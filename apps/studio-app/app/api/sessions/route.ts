import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';
import { PoseLibrary } from '@snapstudio/pose-library';
import { getPaths, defaultConfig } from '@snapstudio/config';

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { poseId, outputDirectory } = body;

    if (!poseId) {
      return NextResponse.json(
        { error: 'poseId is required' },
        { status: 400 }
      );
    }

    const library = getPoseLibrary();
    const pose = library.getPoseById(poseId);

    if (!pose) {
      return NextResponse.json(
        { error: 'Pose not found' },
        { status: 404 }
      );
    }

    const manager = getSessionManager();
    const session = await manager.createSession(
      pose,
      outputDirectory || defaultConfig.outputDirectory
    );

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create session' },
      { status: 500 }
    );
  }
}