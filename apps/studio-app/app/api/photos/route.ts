import { NextRequest, NextResponse } from 'next/server';
import { PhotoMonitor } from '@snapstudio/file-manager';
import { SessionManager } from '@snapstudio/session-manager';
import { getPaths, defaultConfig } from '@snapstudio/config';

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

function getSessionManager() {
  if (!sessionManager) {
    sessionManager = new SessionManager({
      dataDirectory: getPaths().appData,
      maxPhotosPerSession: defaultConfig.photosPerSession,
      maxSessionTime: defaultConfig.maxSessionTime,
    });
  }
  return sessionManager;
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
      return NextResponse.json(
        { error: 'No active session' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      photos: currentSession.photos,
      total: currentSession.photos.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}