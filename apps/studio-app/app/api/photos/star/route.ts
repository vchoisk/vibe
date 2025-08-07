import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';
import { getPaths, defaultConfig } from '@snapstudio/config';

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

// POST /api/photos/star - Star or unstar a photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, starred, sessionId } = body;

    if (!photoId || starred === undefined) {
      return NextResponse.json(
        { error: 'photoId and starred are required' },
        { status: 400 }
      );
    }

    const manager = getSessionManager();
    await manager.starPhoto(photoId, starred, sessionId);

    // If sessionId was provided, get that specific session for the response
    let responseSession;
    if (sessionId) {
      responseSession = await manager.getSession(sessionId);
    } else {
      responseSession = manager.getCurrentSession();
    }

    return NextResponse.json({ 
      success: true,
      session: responseSession,
      starredCount: responseSession?.starredPhotos.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to star photo' },
      { status: 500 }
    );
  }
}