import { NextRequest, NextResponse } from 'next/server';
import { cameraService } from '@/lib/camera/gphoto2.service';

export async function GET() {
  try {
    const settings = await cameraService.getSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Camera settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get camera settings: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { setting, value } = body;

    if (!setting || !value) {
      return NextResponse.json(
        { error: 'setting and value are required' },
        { status: 400 }
      );
    }

    await cameraService.setSetting(setting, value);

    return NextResponse.json({
      success: true,
      setting,
      value
    });
  } catch (error: any) {
    console.error('Set camera setting error:', error);
    return NextResponse.json(
      { error: 'Failed to set camera setting: ' + error.message },
      { status: 500 }
    );
  }
}