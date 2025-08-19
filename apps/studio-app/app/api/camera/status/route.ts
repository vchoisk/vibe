import { NextResponse } from 'next/server';
import { cameraService } from '@/lib/camera/gphoto2.service';

export async function GET() {
  try {
    const [isInstalled, cameras, battery] = await Promise.all([
      cameraService.isInstalled(),
      cameraService.listCameras().catch(() => []),
      cameraService.getBatteryLevel().catch(() => 'N/A')
    ]);

    return NextResponse.json({
      gphoto2Installed: isInstalled,
      cameras,
      batteryLevel: battery,
      cameraConnected: cameras.length > 0
    });
  } catch (error: any) {
    console.error('Camera status error:', error);
    return NextResponse.json(
      { error: 'Failed to get camera status: ' + error.message },
      { status: 500 }
    );
  }
}