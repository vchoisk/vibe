import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@snapstudio/session-manager';

// GET /api/shoots/[id]/sessions - Get all sessions for a shoot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionManager = (globalThis as any).sessionManager as SessionManager;
    if (!sessionManager) {
      return NextResponse.json({ error: 'Session manager not initialized' }, { status: 500 });
    }

    const sessions = await sessionManager.getSessionsByShootId(id);
    
    return NextResponse.json({ 
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error getting shoot sessions:', error);
    return NextResponse.json(
      { error: 'Failed to get shoot sessions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}