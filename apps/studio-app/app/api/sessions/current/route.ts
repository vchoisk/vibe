import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';
import { getPaths, defaultConfig } from '@snapstudio/config';
import { createErrorResponse, errors } from '@/lib/api/errors';

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

// GET /api/sessions/current - Get current session
export async function GET() {
  try {
    const manager = getSessionManager();
    const session = manager.getCurrentSession();

    console.log(`[API] Get current session:`, session ? `Found ${session.id}` : 'No active session');

    return NextResponse.json({ session });
  } catch (error) {
    return createErrorResponse(error, 500, '/api/sessions/current');
  }
}

// PUT /api/sessions/current - Update current session status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      throw errors.badRequest('status is required');
    }

    const manager = getSessionManager();
    
    // Check if there's a current session
    const currentSession = manager.getCurrentSession();
    if (!currentSession) {
      throw errors.notFound('No active session to update');
    }

    console.log(`[API] Updating session ${currentSession.id} status from ${currentSession.status} to ${status}`);
    
    await manager.updateSessionStatus(status);

    const updatedSession = manager.getCurrentSession();
    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    return createErrorResponse(error, 500, '/api/sessions/current');
  }
}