import { NextRequest, NextResponse } from 'next/server';
import { EventManager, SessionManager } from '@snapstudio/session-manager';

// POST /api/events/[id]/complete - Complete an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventManager = (globalThis as any).eventManager as EventManager;
    const sessionManager = (globalThis as any).sessionManager as SessionManager;
    
    if (!eventManager) {
      console.error('Event manager not initialized in global scope');
      return NextResponse.json({ error: 'Event manager not initialized' }, { status: 500 });
    }
    
    if (!sessionManager) {
      console.error('Session manager not initialized in global scope');
      return NextResponse.json({ error: 'Session manager not initialized' }, { status: 500 });
    }

    // Check if there's an active session
    const currentSession = sessionManager.getCurrentSession();
    if (currentSession && currentSession.status === 'active') {
      return NextResponse.json(
        { error: 'Cannot complete event while a session is active. Please complete the current session first.' },
        { status: 400 }
      );
    }

    const summary = await eventManager.completeEvent(params.id, sessionManager);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error completing event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete event', details: error instanceof Error ? error.stack : 'Unknown error' },
      { status: 500 }
    );
  }
}