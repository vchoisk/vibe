import { NextRequest, NextResponse } from 'next/server';
import { EventManager } from '@snapstudio/session-manager';

// GET /api/events - Get all events
export async function GET() {
  try {
    const eventManager = (globalThis as any).eventManager as EventManager;
    if (!eventManager) {
      return NextResponse.json({ error: 'Event manager not initialized' }, { status: 500 });
    }

    const events = await eventManager.getAllEvents();
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error getting events:', error);
    return NextResponse.json(
      { error: 'Failed to get events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const eventManager = (globalThis as any).eventManager as EventManager;
    if (!eventManager) {
      return NextResponse.json({ error: 'Event manager not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { name, clientName, durationMinutes, notes, pricePackage } = body;

    if (!name || !clientName || !durationMinutes) {
      return NextResponse.json(
        { error: 'Missing required fields: name, clientName, durationMinutes' },
        { status: 400 }
      );
    }

    const event = await eventManager.createEvent({
      name,
      clientName,
      durationMinutes,
      notes,
      pricePackage,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}