import { EventEmitter } from 'events';
import fs from 'fs-extra';
import path from 'path';
import { PhotoSession, Photo, Pose } from '@snapstudio/types';
import { generateSessionId } from './utils';

export interface SessionManagerOptions {
  dataDirectory: string;
  maxPhotosPerSession?: number;
  maxSessionTime?: number;
}

export class SessionManager extends EventEmitter {
  private options: SessionManagerOptions;
  private currentSession: PhotoSession | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;
  private instanceId: string;
  private static instanceCount = 0;
  private initializationPromise: Promise<void>;

  constructor(options: SessionManagerOptions) {
    super();
    SessionManager.instanceCount++;
    this.instanceId = `SM-${SessionManager.instanceCount}-${Date.now()}`;
    console.log(`[SessionManager] Creating instance ${this.instanceId}`);
    
    this.options = {
      maxPhotosPerSession: 9,
      maxSessionTime: 3600000, // 1 hour default
      ...options,
    };
    this.initializationPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.ensureDataDirectory();
    await this.loadLastActiveSession();
  }

  private async ensureDataDirectory(): Promise<void> {
    await fs.ensureDir(path.join(this.options.dataDirectory, 'sessions'));
  }

  private async loadLastActiveSession(): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      
      // Find the most recent session that is still active (not review or complete)
      const activeSession = sessions.find(s => s.status === 'active');
      
      if (activeSession) {
        console.log(`[SessionManager ${this.instanceId}] Restoring session ${activeSession.id} (${activeSession.status})`);
        this.currentSession = activeSession;
        
        // Restart the session timer if the session is still active
        if (activeSession.status === 'active') {
          this.startSessionTimer();
        }
      } else {
        console.log(`[SessionManager ${this.instanceId}] No active session to restore`);
      }
    } catch (error) {
      console.error(`[SessionManager ${this.instanceId}] Error loading last active session:`, error);
    }
  }

  async createSession(pose: Pose, outputDirectory: string, shootId?: string): Promise<PhotoSession> {
    console.log(`[SessionManager ${this.instanceId}] createSession called`);
    if (this.currentSession && this.currentSession.status !== 'complete') {
      throw new Error('A session is already active. Please complete it first.');
    }

    const session: PhotoSession = {
      id: generateSessionId(),
      poseType: pose.category,
      poseName: pose.name,
      startTime: new Date(),
      photoCount: 0,
      maxPhotos: this.options.maxPhotosPerSession!,
      photos: [],
      starredPhotos: [],
      status: 'active',
      outputDirectory,
      shootId, // Associate with shoot if provided
    };

    // Create a photos directory for this session
    const sessionPhotosDir = path.join(this.options.dataDirectory, 'sessions', session.id, 'photos');
    await fs.ensureDir(sessionPhotosDir);

    this.currentSession = session;
    await this.saveSession(session);

    // Start session timer
    this.startSessionTimer();

    this.emit('session-created', session);
    return session;
  }

  async addPhoto(photo: Photo): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'active') {
      throw new Error('No active session to add photos to');
    }

    // Check if we've already reached the max
    if (this.currentSession.photos.length >= this.currentSession.maxPhotos) {
      console.log('Session already has maximum photos, ignoring new photo');
      return;
    }

    // Copy photo to session folder
    const sessionPhotosDir = path.join(this.options.dataDirectory, 'sessions', this.currentSession.id, 'photos');
    const photoDestination = path.join(sessionPhotosDir, photo.filename);
    
    try {
      await fs.copy(photo.filepath, photoDestination, { preserveTimestamps: true });
      console.log(`[SessionManager ${this.instanceId}] Copied photo ${photo.filename} to session folder`);
      
      // Update photo object to reference the session copy
      const photoWithSessionPath = {
        ...photo,
        sessionFilepath: photoDestination
      };
      
      this.currentSession.photos.push(photoWithSessionPath);
      this.currentSession.photoCount = this.currentSession.photos.length;

      await this.saveSession(this.currentSession);
      this.emit('photo-added', { session: this.currentSession, photo: photoWithSessionPath });

      // Check if we've NOW reached the max after adding this photo
      if (this.currentSession.photos.length >= this.currentSession.maxPhotos) {
        console.log('Session reached maximum photos, changing status to review');
        await this.updateSessionStatus('review');
      }
    } catch (error) {
      console.error(`[SessionManager ${this.instanceId}] Error copying photo to session folder:`, error);
      throw error;
    }
  }

  async starPhoto(photoId: string, starred: boolean): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const photo = this.currentSession.photos.find(p => p.id === photoId);
    if (!photo) {
      throw new Error('Photo not found in current session');
    }

    photo.starred = starred;

    if (starred && !this.currentSession.starredPhotos.includes(photoId)) {
      this.currentSession.starredPhotos.push(photoId);
    } else if (!starred) {
      this.currentSession.starredPhotos = this.currentSession.starredPhotos.filter(
        id => id !== photoId
      );
    }

    await this.saveSession(this.currentSession);
    this.emit('photo-starred', { photoId, starred, session: this.currentSession });
  }

  async updateSessionStatus(status: PhotoSession['status']): Promise<void> {
    console.log(`[SessionManager ${this.instanceId}] updateSessionStatus called with status: ${status}`);
    if (!this.currentSession) {
      console.log(`[SessionManager ${this.instanceId}] No current session to update`);
      throw new Error('No active session');
    }

    this.currentSession.status = status;

    if (status === 'complete') {
      this.currentSession.endTime = new Date();
      this.stopSessionTimer();
    }

    await this.saveSession(this.currentSession);
    this.emit('session-updated', this.currentSession);
  }

  async completeSession(): Promise<PhotoSession> {
    if (!this.currentSession) {
      throw new Error('No active session to complete');
    }

    await this.updateSessionStatus('complete');
    const completedSession = this.currentSession;
    this.currentSession = null;

    this.emit('session-completed', completedSession);
    return completedSession;
  }

  async waitForInitialization(): Promise<void> {
    await this.initializationPromise;
  }

  getCurrentSession(): PhotoSession | null {
    console.log(`[SessionManager ${this.instanceId}] getCurrentSession called, current session:`, 
      this.currentSession ? `${this.currentSession.id} (${this.currentSession.status})` : 'null'
    );
    return this.currentSession;
  }

  async getAllSessions(): Promise<PhotoSession[]> {
    const sessionsDir = path.join(this.options.dataDirectory, 'sessions');
    const entries = await fs.readdir(sessionsDir);
    const sessions: PhotoSession[] = [];

    for (const entry of entries) {
      const entryPath = path.join(sessionsDir, entry);
      const stat = await fs.stat(entryPath);
      
      if (stat.isDirectory()) {
        // New structure: session folders with session.json inside
        const sessionJsonPath = path.join(entryPath, 'session.json');
        if (await fs.pathExists(sessionJsonPath)) {
          const session = await fs.readJson(sessionJsonPath);
          sessions.push(this.deserializeSession(session));
        }
      } else if (entry.endsWith('.json')) {
        // Legacy structure: session-*.json files
        const session = await fs.readJson(entryPath);
        sessions.push(this.deserializeSession(session));
      }
    }

    return sessions.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async getSession(sessionId: string): Promise<PhotoSession | null> {
    // Try new location first
    const newSessionPath = path.join(
      this.options.dataDirectory,
      'sessions',
      sessionId,
      'session.json'
    );

    if (await fs.pathExists(newSessionPath)) {
      const session = await fs.readJson(newSessionPath);
      return this.deserializeSession(session);
    }

    // Fallback to legacy location
    const legacySessionPath = path.join(
      this.options.dataDirectory,
      'sessions',
      `session-${sessionId}.json`
    );

    if (await fs.pathExists(legacySessionPath)) {
      const session = await fs.readJson(legacySessionPath);
      return this.deserializeSession(session);
    }

    return null;
  }

  private async saveSession(session: PhotoSession): Promise<void> {
    const sessionDir = path.join(this.options.dataDirectory, 'sessions', session.id);
    await fs.ensureDir(sessionDir);
    
    const sessionPath = path.join(sessionDir, 'session.json');
    
    // Also save a backup in the old location for backward compatibility
    const legacyPath = path.join(
      this.options.dataDirectory,
      'sessions',
      `session-${session.id}.json`
    );

    const serializedSession = this.serializeSession(session);
    await fs.writeJson(sessionPath, serializedSession, { spaces: 2 });
    await fs.writeJson(legacyPath, serializedSession, { spaces: 2 });
  }

  private startSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    this.sessionTimer = setTimeout(async () => {
      if (this.currentSession && this.currentSession.status === 'active') {
        await this.updateSessionStatus('review');
        this.emit('session-timeout', this.currentSession);
      }
    }, this.options.maxSessionTime!);
  }

  private stopSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private serializeSession(session: PhotoSession): any {
    // Create detailed starred photos array with full photo info
    const starredPhotosDetail = session.photos
      .filter(photo => session.starredPhotos.includes(photo.id))
      .map(photo => ({
        ...photo,
        captureTime: photo.captureTime.toISOString(),
      }));

    return {
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString(),
      photos: session.photos.map(photo => ({
        ...photo,
        captureTime: photo.captureTime.toISOString(),
      })),
      starredPhotosDetail, // Add detailed starred photo information
    };
  }

  private deserializeSession(data: any): PhotoSession {
    return {
      ...data,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      photos: data.photos.map((photo: any) => ({
        ...photo,
        captureTime: new Date(photo.captureTime),
      })),
    };
  }

  async getSessionsByShootId(shootId: string): Promise<PhotoSession[]> {
    const allSessions = await this.getAllSessions();
    return allSessions.filter(session => session.shootId === shootId);
  }

  async cleanupOldSessions(daysToKeep: number = 30): Promise<number> {
    const sessions = await this.getAllSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;

    for (const session of sessions) {
      if (session.endTime && session.endTime < cutoffDate) {
        const sessionPath = path.join(
          this.options.dataDirectory,
          'sessions',
          `session-${session.id}.json`
        );
        await fs.remove(sessionPath);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}