import { NextRequest, NextResponse } from 'next/server';
import { ShootManager, SessionManager } from '@snapstudio/session-manager';

// POST /api/shoots/[id]/complete - Complete a shoot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shootManager = (globalThis as any).shootManager as ShootManager;
    const sessionManager = (globalThis as any).sessionManager as SessionManager;
    
    if (!shootManager) {
      console.error('Shoot manager not initialized in global scope');
      return NextResponse.json({ error: 'Shoot manager not initialized' }, { status: 500 });
    }
    
    if (!sessionManager) {
      console.error('Session manager not initialized in global scope');
      return NextResponse.json({ error: 'Session manager not initialized' }, { status: 500 });
    }

    // Check if there's an active session
    const currentSession = sessionManager.getCurrentSession();
    if (currentSession && currentSession.status === 'active') {
      return NextResponse.json(
        { error: 'Cannot complete shoot while a session is active. Please complete the current session first.' },
        { status: 400 }
      );
    }

    const summary = await shootManager.completeShoot(id, sessionManager);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error completing shoot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete shoot', details: error instanceof Error ? error.stack : 'Unknown error' },
      { status: 500 }
    );
  }
}