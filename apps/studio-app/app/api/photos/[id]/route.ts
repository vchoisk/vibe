import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';
import { getPaths, defaultConfig } from '@snapstudio/config';
import fs from 'fs';
import path from 'path';

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

// GET /api/photos/[id] - Get a specific photo file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: photoId } = await params;
    const manager = getSessionManager();
    const currentSession = manager.getCurrentSession();
    
    if (!currentSession) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 404 }
      );
    }

    // Find the photo in the current session
    const photo = currentSession.photos.find(p => p.id === photoId);
    
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Read the photo file
    const photoPath = photo.filepath;
    
    if (!fs.existsSync(photoPath)) {
      return NextResponse.json(
        { error: 'Photo file not found' },
        { status: 404 }
      );
    }

    const photoBuffer = fs.readFileSync(photoPath);
    const ext = path.extname(photoPath).toLowerCase();
    
    // Determine content type
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    
    // Return the image
    return new NextResponse(photoBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}