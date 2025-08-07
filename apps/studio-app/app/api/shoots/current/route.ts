import { NextResponse } from 'next/server';
import { ShootManager } from '@snapstudio/session-manager';

// GET /api/shoots/current - Get current active shoot
export async function GET() {
  try {
    const shootManager = (globalThis as any).shootManager as ShootManager;
    if (!shootManager) {
      return NextResponse.json({ error: 'Shoot manager not initialized' }, { status: 500 });
    }

    const currentShoot = shootManager.getCurrentShoot();
    if (!currentShoot) {
      return NextResponse.json({ shoot: null });
    }

    // Add remaining time
    const remainingMinutes = shootManager.getRemainingTime();
    
    return NextResponse.json({ 
      shoot: currentShoot,
      remainingMinutes,
    });
  } catch (error) {
    console.error('Error getting current shoot:', error);
    return NextResponse.json(
      { error: 'Failed to get current shoot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}