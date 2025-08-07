import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';
import { PoseLibrary } from '@snapstudio/pose-library';
import { getPaths, defaultConfig } from '@snapstudio/config';
import { createErrorResponse, errors } from '@/lib/api/errors';

let poseLibrary: PoseLibrary | null = null;

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

function getPoseLibrary() {
  if (!poseLibrary) {
    poseLibrary = new PoseLibrary({
      customPosesPath: getPaths().customPoses,
      includeDefaults: true,
    });
  }
  return poseLibrary;
}

// GET /api/sessions - Get all sessions or current session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const current = searchParams.get('current') === 'true';

    const manager = getSessionManager();

    if (current) {
      const currentSession = manager.getCurrentSession();
      return NextResponse.json({ session: currentSession });
    }

    const sessions = await manager.getAllSessions();
    return NextResponse.json({ 
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    return createErrorResponse(error, 500, '/api/sessions');
  }
}

// POST /api/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { poseId, outputDirectory, shootId } = body;

    if (!poseId) {
      throw errors.badRequest('poseId is required', { received: body });
    }

    const library = getPoseLibrary();
    const pose = library.getPoseById(poseId);

    if (!pose) {
      throw errors.notFound(`Pose with ID '${poseId}'`);
    }

    const manager = getSessionManager();
    
    // Check if there's already an active session
    const currentSession = manager.getCurrentSession();
    if (currentSession && currentSession.status === 'active') {
      throw errors.conflict(
        'A photo session is already active. Please complete or cancel the current session first.',
        { currentSessionId: currentSession.id }
      );
    }

    const session = await manager.createSession(
      pose,
      outputDirectory || defaultConfig.outputDirectory,
      shootId // Pass shootId if provided
    );

    console.log(`[API] Created new session: ${session.id} with pose: ${pose.name}${shootId ? ` for shoot: ${shootId}` : ''}`);
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error, 500, '/api/sessions');
  }
}