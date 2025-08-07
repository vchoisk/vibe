import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';

// GET /api/events/[id]/sessions - Get all sessions for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionManager = (globalThis as any).sessionManager as SessionManager;
    if (!sessionManager) {
      return NextResponse.json({ error: 'Session manager not initialized' }, { status: 500 });
    }

    const sessions = await sessionManager.getSessionsByEventId(params.id);
    
    return NextResponse.json({ 
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error getting event sessions:', error);
    return NextResponse.json(
      { error: 'Failed to get event sessions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}