import { NextResponse } from 'next/server';
import { getPaths } from '@snapstudio/config';
import fs from 'fs-extra';

export async function GET() {
  try {
    const paths = getPaths();
    
    // Check if required directories exist
    const checks = {
      appData: await fs.pathExists(paths.appData),
      sessions: await fs.pathExists(paths.sessions),
      config: await fs.pathExists(paths.config),
    };

    const status = Object.values(checks).every(Boolean) ? 'healthy' : 'initializing';

    return NextResponse.json({
      status,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      directories: checks,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}