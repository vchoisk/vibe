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

    // Use Next.js built-in fetch with a simple approach
    const randomId = Date.now() + Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/seed/${randomId}/800/1200`;
    
    console.log(`[API] Fetching test photo from: ${imageUrl}`);
    
    let imageBuffer: Buffer;
    
    try {
      // Use fetch API (available in Next.js)
      const response = await fetch(imageUrl, {
        // Follow redirects automatically
        redirect: 'follow',
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      
      if (imageBuffer.length === 0) {
        throw new Error('Downloaded image is empty');
      }
      
      console.log(`[API] Successfully downloaded image: ${imageBuffer.length} bytes`);
    } catch (error) {
      console.error(`[API] Failed to download test photo:`, error);
      
      // Fallback: Use a simple valid test JPEG
      // This is a real 100x100 red JPEG image
      const fallbackBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==';
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