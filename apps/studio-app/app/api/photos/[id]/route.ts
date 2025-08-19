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
    
    // First try to find the photo in the current session
    const currentSession = manager.getCurrentSession();
    let photo = currentSession?.photos.find(p => p.id === photoId);
    let photoPath = photo?.filepath;
    
    // If not found in current session, search in all sessions
    if (!photo) {
      const paths = getPaths();
      const sessionsDir = path.join(paths.appData, 'sessions');
      
      // Check if sessions directory exists
      if (fs.existsSync(sessionsDir)) {
        const sessionDirs = fs.readdirSync(sessionsDir).filter(dir => 
          fs.statSync(path.join(sessionsDir, dir)).isDirectory()
        );
        
        // Search through each session for the photo
        for (const sessionDir of sessionDirs) {
          const sessionDataPath = path.join(sessionsDir, sessionDir, 'session.json');
          if (fs.existsSync(sessionDataPath)) {
            try {
              const sessionData = JSON.parse(fs.readFileSync(sessionDataPath, 'utf-8'));
              const foundPhoto = sessionData.photos?.find((p: any) => p.id === photoId);
              if (foundPhoto) {
                photo = foundPhoto;
                photoPath = foundPhoto.filepath;
                break;
              }
            } catch (e) {
              // Skip invalid session files
              continue;
            }
          }
        }
      }
    }
    
    if (!photo || !photoPath) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Read the photo file
    
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
    
    // Get filename for download
    const filename = `photo-${photoId}${ext}`;
    
    // Return the image with proper headers
    return new NextResponse(photoBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': photoBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}