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
    
    if (!eventManager || !sessionManager) {
      return NextResponse.json({ error: 'Managers not initialized' }, { status: 500 });
    }

    const summary = await eventManager.completeEvent(params.id, sessionManager);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error completing event:', error);
    return NextResponse.json(
      { error: 'Failed to complete event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}