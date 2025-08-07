import { NextRequest, NextResponse } from 'next/server';
import { ShootManager } from '@snapstudio/session-manager';

// GET /api/shoots - Get all shoots
export async function GET() {
  try {
    const shootManager = (globalThis as any).shootManager as ShootManager;
    if (!shootManager) {
      return NextResponse.json({ error: 'Shoot manager not initialized' }, { status: 500 });
    }

    const shoots = await shootManager.getAllShoots();
    return NextResponse.json({ shoots });
  } catch (error) {
    console.error('Error getting shoots:', error);
    return NextResponse.json(
      { error: 'Failed to get shoots', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/shoots - Create a new shoot
export async function POST(request: NextRequest) {
  try {
    const shootManager = (globalThis as any).shootManager as ShootManager;
    if (!shootManager) {
      return NextResponse.json({ error: 'Shoot manager not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { name, clientName, durationMinutes, notes, pricePackage } = body;

    if (!name || !clientName || !durationMinutes) {
      return NextResponse.json(
        { error: 'Missing required fields: name, clientName, durationMinutes' },
        { status: 400 }
      );
    }

    const shoot = await shootManager.createShoot({
      name,
      clientName,
      durationMinutes,
      notes,
      pricePackage,
    });

    return NextResponse.json({ shoot });
  } catch (error) {
    console.error('Error creating shoot:', error);
    return NextResponse.json(
      { error: 'Failed to create shoot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}