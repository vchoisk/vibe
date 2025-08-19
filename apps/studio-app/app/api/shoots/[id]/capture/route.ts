import { NextRequest, NextResponse } from 'next/server';
import { cameraService } from '@/lib/camera/gphoto2.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shootId = params.id;
    const body = await request.json();
    const { sessionId, poseNumber } = body;

    if (!sessionId || poseNumber === undefined) {
      return NextResponse.json(
        { error: 'sessionId and poseNumber are required' },
        { status: 400 }
      );
    }

    // Use camera service to capture photo
    const result = await cameraService.capturePhoto(sessionId, poseNumber, shootId);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to capture photo' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}