import { NextRequest, NextResponse } from 'next/server';
import { PhotoMonitor } from '@snapstudio/file-manager';
import { SessionManager } from '@snapstudio/session-manager';
import { getPaths, defaultConfig } from '@snapstudio/config';
import { createErrorResponse, errors } from '@/lib/api/errors';

let photoMonitor: PhotoMonitor | null = null;
let sessionManager: SessionManager | null = null;

function getPhotoMonitor() {
  if (!photoMonitor) {
    photoMonitor = new PhotoMonitor({
      watchDirectory: defaultConfig.watchDirectory,
      awaitWriteFinish: true,
    });
  }
  return photoMonitor;
}

function getSessionManager(): SessionManager {
  // Use global instance if available (from custom server)
  if (globalThis.sessionManager) {
    return globalThis.sessionManager;
  }
  
  // Fallback for development without custom server
  const { SessionManager } = require('@snapstudio/session-manager');
  return new SessionManager({
    dataDirectory: getPaths().appData,
    maxPhotosPerSession: defaultConfig.photosPerSession,
    maxSessionTime: defaultConfig.maxSessionTime,
  });
}

// GET /api/photos - Get photos for current session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    const manager = getSessionManager();
    
    if (sessionId) {
      const session = await manager.getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ 
        photos: session.photos,
        total: session.photos.length,
      });
    }

    const currentSession = manager.getCurrentSession();
    if (!currentSession) {
      throw errors.notFound('No active session found');
    }

    console.log(`[API] Get photos for current session ${currentSession.id}: ${currentSession.photos.length} photos`);

    return NextResponse.json({ 
      photos: currentSession.photos,
      total: currentSession.photos.length,
    });
  } catch (error) {
    return createErrorResponse(error, 500, '/api/photos');
  }
}