import { NextRequest, NextResponse } from 'next/server';
import { ShootManager } from '@snapstudio/session-manager';

// GET /api/shoots/[id] - Get specific shoot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shootManager = (globalThis as any).shootManager as ShootManager;
    if (!shootManager) {
      return NextResponse.json({ error: 'Shoot manager not initialized' }, { status: 500 });
    }

    const shoot = await shootManager.getShoot(id);
    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 });
    }

    return NextResponse.json({ shoot });
  } catch (error) {
    console.error('Error getting shoot:', error);
    return NextResponse.json(
      { error: 'Failed to get shoot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/shoots/[id] - Update shoot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shootManager = (globalThis as any).shootManager as ShootManager;
    if (!shootManager) {
      return NextResponse.json({ error: 'Shoot manager not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const shoot = await shootManager.updateShoot(id, body);

    return NextResponse.json({ shoot });
  } catch (error) {
    console.error('Error updating shoot:', error);
    return NextResponse.json(
      { error: 'Failed to update shoot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}