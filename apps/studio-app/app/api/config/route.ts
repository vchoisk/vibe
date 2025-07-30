import { NextRequest, NextResponse } from 'next/server';
import { defaultConfig, getPaths } from '@snapstudio/config';
import fs from 'fs-extra';
import path from 'path';

const configPath = path.join(getPaths().config, 'studio-settings.json');

// GET /api/config - Get studio configuration
export async function GET() {
  try {
    let config = defaultConfig;

    // Load custom config if exists
    if (await fs.pathExists(configPath)) {
      const customConfig = await fs.readJson(configPath);
      config = { ...defaultConfig, ...customConfig };
    }

    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

// PUT /api/config - Update studio configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.studioName || !body.watchDirectory || !body.outputDirectory) {
      return NextResponse.json(
        { error: 'studioName, watchDirectory, and outputDirectory are required' },
        { status: 400 }
      );
    }

    // Merge with defaults
    const updatedConfig = {
      ...defaultConfig,
      ...body,
    };

    // Ensure config directory exists
    await fs.ensureDir(getPaths().config);
    
    // Save config
    await fs.writeJson(configPath, updatedConfig, { spaces: 2 });

    // Ensure directories exist
    await fs.ensureDir(updatedConfig.watchDirectory);
    await fs.ensureDir(updatedConfig.outputDirectory);

    return NextResponse.json({ 
      config: updatedConfig,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update config' },
      { status: 500 }
    );
  }
}