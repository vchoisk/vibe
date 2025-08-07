import { NextRequest, NextResponse } from 'next/server';
import { ShootManager } from '@snapstudio/session-manager';

// POST /api/shoots/[id]/start - Start a shoot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shootManager = (globalThis as any).shootManager as ShootManager;
    if (!shootManager) {
      return NextResponse.json({ error: 'Shoot manager not initialized' }, { status: 500 });
    }

    const shoot = await shootManager.startShoot(id);
    return NextResponse.json({ shoot });
  } catch (error) {
    console.error('Error starting shoot:', error);
    return NextResponse.json(
      { error: 'Failed to start shoot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}