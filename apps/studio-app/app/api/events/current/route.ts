import { NextResponse } from 'next/server';
import { EventManager } from '@snapstudio/session-manager';

// GET /api/events/current - Get current active event
export async function GET() {
  try {
    const eventManager = (globalThis as any).eventManager as EventManager;
    if (!eventManager) {
      return NextResponse.json({ error: 'Event manager not initialized' }, { status: 500 });
    }

    const currentEvent = eventManager.getCurrentEvent();
    if (!currentEvent) {
      return NextResponse.json({ event: null });
    }

    // Add remaining time
    const remainingMinutes = eventManager.getRemainingTime();
    
    return NextResponse.json({ 
      event: currentEvent,
      remainingMinutes,
    });
  } catch (error) {
    console.error('Error getting current event:', error);
    return NextResponse.json(
      { error: 'Failed to get current event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}