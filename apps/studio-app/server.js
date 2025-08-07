const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { PhotoMonitor } = require('@snapstudio/file-manager');
const { SessionManager, ShootManager } = require('@snapstudio/session-manager');
const { defaultConfig, getPaths } = require('@snapstudio/config');
const { setupDirectories } = require('./lib/setup');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Initialize managers
let photoMonitor = null;
let sessionManager = null;
let shootManager = null;
let io = null;

// Setup directories before starting
setupDirectories().then(() => {
  return app.prepare();
}).then(async () => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Initialize managers
  sessionManager = new SessionManager({
    dataDirectory: getPaths().appData,
    maxPhotosPerSession: defaultConfig.photosPerSession,
    maxSessionTime: defaultConfig.maxSessionTime,
  });
  
  shootManager = new ShootManager({
    dataDirectory: getPaths().appData,
  });
  
  // Wait for session manager to load any active sessions
  await sessionManager.waitForInitialization();

  photoMonitor = new PhotoMonitor({
    watchDirectory: defaultConfig.watchDirectory,
    awaitWriteFinish: false,
  });
  
  // If there's a restored active session, start watching for photos
  const currentSession = sessionManager.getCurrentSession();
  if (currentSession && currentSession.status === 'active') {
    console.log('Restored active session, starting photo monitor');
    photoMonitor.startWatching(currentSession.id);
  }

  // Set up photo monitor events
  photoMonitor.on('new-photo', async (photo) => {
    console.log('New photo detected:', photo.filename);
    
    try {
      // Add photo to current session
      await sessionManager.addPhoto(photo);
      
      // Broadcast to all connected clients
      io.emit('new-photo', photo);
      
      // Get updated session state
      const session = sessionManager.getCurrentSession();
      if (session) {
        io.emit('session-updated', session);
      }
    } catch (error) {
      console.error('Error handling new photo:', error);
    }
  });

  // Set up session manager events
  sessionManager.on('session-created', async (session) => {
    console.log('Session created:', session.id);
    // Start watching for photos
    photoMonitor.startWatching(session.id);
    io.emit('session-created', session);
    
    // If part of a shoot, update the shoot
    if (session.shootId) {
      const currentShoot = shootManager.getCurrentShoot();
      if (currentShoot && currentShoot.id === session.shootId) {
        await shootManager.addSessionToShoot(session.shootId, session.id);
      }
    }
  });

  sessionManager.on('session-updated', (session) => {
    io.emit('session-updated', session);
  });

  sessionManager.on('session-completed', async (session) => {
    console.log('Session completed:', session.id);
    // Stop watching for photos
    photoMonitor.stopWatching();
    io.emit('session-completed', { sessionId: session.id });
    
    // Update shoot photo counts if part of a shoot
    if (session.shootId) {
      const shoot = await shootManager.getShoot(session.shootId);
      if (shoot) {
        await shootManager.updateShoot(session.shootId, {
          totalPhotos: shoot.totalPhotos + session.photos.length,
          totalStarredPhotos: shoot.totalStarredPhotos + session.starredPhotos.length,
        });
      }
    }
  });

  sessionManager.on('photo-starred', ({ photoId, starred, session }) => {
    io.emit('photo-starred', { photoId, starred });
    io.emit('session-updated', session);
  });

  // Set up shoot manager events
  shootManager.on('shoot-started', (shoot) => {
    console.log('Shoot started:', shoot.id);
    io.emit('shoot-started', shoot);
  });

  shootManager.on('shoot-updated', (shoot) => {
    io.emit('shoot-updated', shoot);
  });

  shootManager.on('shoot-completed', (summary) => {
    console.log('Shoot completed:', summary.shootId);
    io.emit('shoot-completed', summary);
  });

  shootManager.on('shoot-overtime', (shoot) => {
    console.log('Shoot overtime:', shoot.id);
    io.emit('shoot-overtime', shoot);
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send current session state to new connections
    const currentSession = sessionManager.getCurrentSession();
    if (currentSession) {
      socket.emit('session-updated', currentSession);
    }
    
    // Send current shoot state to new connections
    const currentShoot = shootManager.getCurrentShoot();
    if (currentShoot) {
      socket.emit('shoot-updated', currentShoot);
    }
  });

  // Make managers available globally for API routes
  globalThis.photoMonitor = photoMonitor;
  globalThis.sessionManager = sessionManager;
  globalThis.shootManager = shootManager;
  globalThis.io = io;

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Watch directory: ${defaultConfig.watchDirectory}`);
    console.log(`> Output directory: ${defaultConfig.outputDirectory}`);
  });
});