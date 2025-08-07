import { NextRequest, NextResponse } from 'next/server';
import { EventManager } from '@snapstudio/session-manager';
import { SessionManager } from '@snapstudio/session-manager';

// GET /api/events/[id] - Get specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventManager = (globalThis as any).eventManager as EventManager;
    if (!eventManager) {
      return NextResponse.json({ error: 'Event manager not initialized' }, { status: 500 });
    }

    const event = await eventManager.getEvent(params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error getting event:', error);
    return NextResponse.json(
      { error: 'Failed to get event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id] - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventManager = (globalThis as any).eventManager as EventManager;
    if (!eventManager) {
      return NextResponse.json({ error: 'Event manager not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const event = await eventManager.updateEvent(params.id, body);

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}