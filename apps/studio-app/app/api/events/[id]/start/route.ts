import { NextRequest, NextResponse } from 'next/server';
import { EventManager } from '@snapstudio/session-manager';

// POST /api/events/[id]/start - Start an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventManager = (globalThis as any).eventManager as EventManager;
    if (!eventManager) {
      return NextResponse.json({ error: 'Event manager not initialized' }, { status: 500 });
    }

    const event = await eventManager.startEvent(params.id);
    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error starting event:', error);
    return NextResponse.json(
      { error: 'Failed to start event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}