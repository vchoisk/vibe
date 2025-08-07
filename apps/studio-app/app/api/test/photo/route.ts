import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';
import { getPaths, defaultConfig } from '@snapstudio/config';
import { createErrorResponse, errors } from '@/lib/api/errors';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

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

    // Path to TestPhotos directory
    const testPhotosDir = path.join(os.homedir(), 'Pictures', 'SnapStudio', 'TestPhotos');
    
    // Check if TestPhotos directory exists
    if (!await fs.pathExists(testPhotosDir)) {
      throw errors.serverError('TestPhotos directory not found at: ' + testPhotosDir);
    }
    
    // Get list of available test photos
    const testPhotos = await fs.readdir(testPhotosDir);
    const jpgPhotos = testPhotos.filter(file => 
      file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')
    );
    
    if (jpgPhotos.length === 0) {
      throw errors.serverError('No test photos found in TestPhotos directory');
    }
    
    // Select a random photo from the available test photos
    const randomIndex = Math.floor(Math.random() * jpgPhotos.length);
    const selectedPhoto = jpgPhotos[randomIndex];
    const sourcePath = path.join(testPhotosDir, selectedPhoto);
    
    // Create a unique filename for the copied photo
    const testPhotoNumber = (session.photos?.length || 0) + 1;
    const filename = `test-photo-${Date.now()}-${testPhotoNumber}.jpg`;
    const filepath = path.join(defaultConfig.watchDirectory, filename);
    
    console.log(`[API] Copying test photo from: ${selectedPhoto}`);
    
    let imageBuffer: Buffer;
    
    try {
      // Read the test photo
      imageBuffer = await fs.readFile(sourcePath);
      
      if (imageBuffer.length === 0) {
        throw new Error('Test photo file is empty');
      }
      
      console.log(`[API] Successfully read test photo: ${imageBuffer.length} bytes`);
    } catch (error) {
      console.error(`[API] Failed to read test photo:`, error);
      
      // Fallback: Use a simple valid test JPEG
      // This is a real 100x100 red JPEG image
      const fallbackBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhNBUQdhcRMiMoEIFUKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==';
      imageBuffer = Buffer.from(fallbackBase64, 'base64');
      console.log(`[API] Using fallback test image`);
    }

    // Ensure the watch directory exists
    await fs.ensureDir(defaultConfig.watchDirectory);

    // Write the test image to the watch directory
    await fs.writeFile(filepath, imageBuffer);

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