import { NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';
import { FileOrganizer } from '@snapstudio/file-manager';
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

function getFileOrganizer(): FileOrganizer {
  const { FileOrganizer } = require('@snapstudio/file-manager');
  return new FileOrganizer({
    outputDirectory: defaultConfig.outputDirectory,
    createThumbnails: true,
    preserveOriginals: true,
  });
}

// POST /api/sessions/current/complete - Complete current session
export async function POST() {
  try {
    const manager = getSessionManager();
    const session = await manager.completeSession();

    // Organize starred photos
    if (session.starredPhotos.length > 0) {
      const organizer = getFileOrganizer();
      const outputDir = await organizer.organizeStarredPhotos(session);
      
      return NextResponse.json({ 
        session,
        outputDirectory: outputDir,
        starredCount: session.starredPhotos.length,
      });
    }

    return NextResponse.json({ 
      session,
      starredCount: 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete session' },
      { status: 500 }
    );
  }
}