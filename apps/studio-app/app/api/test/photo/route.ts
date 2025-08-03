import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';
import { getPaths, defaultConfig } from '@snapstudio/config';
import { createErrorResponse, errors } from '@/lib/api/errors';
import fs from 'fs-extra';
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

// POST /api/test/photo - Create a test photo in the watch directory
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      throw errors.forbidden('Test photos only available in development');
    }

    const manager = getSessionManager();
    const session = manager.getCurrentSession();
    
    if (!session || session.status !== 'active') {
      throw errors.notFound('No active session found');
    }

    // Create a test image file
    const testPhotoNumber = (session.photos?.length || 0) + 1;
    const filename = `test-photo-${Date.now()}-${testPhotoNumber}.jpg`;
    const filepath = path.join(defaultConfig.watchDirectory, filename);

    // Create a simple test image (1x1 pixel JPEG)
    const testImageBuffer = Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJalmRDHL1NEA=',
      'base64'
    );

    // Ensure the watch directory exists
    await fs.ensureDir(defaultConfig.watchDirectory);

    // Write the test image to the watch directory
    await fs.writeFile(filepath, testImageBuffer);

    console.log(`[API] Created test photo: ${filename}`);

    return NextResponse.json({ 
      success: true,
      filename,
      message: 'Test photo created. File watcher should detect it shortly.'
    });
  } catch (error) {
    return createErrorResponse(error, 500, '/api/test/photo');
  }
}