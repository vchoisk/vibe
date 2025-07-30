import { NextResponse } from 'next/server';
import { PoseLibrary } from '@snapstudio/pose-library';
import { getPaths } from '@snapstudio/config';

let poseLibrary: PoseLibrary | null = null;

function getPoseLibrary() {
  if (!poseLibrary) {
    poseLibrary = new PoseLibrary({
      customPosesPath: getPaths().customPoses,
      includeDefaults: true,
    });
  }
  return poseLibrary;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    const library = getPoseLibrary();

    let poses;
    if (query) {
      poses = library.searchPoses(query);
    } else if (category) {
      poses = library.getPosesByCategory(category as any);
    } else {
      poses = library.getAllPoses();
    }

    return NextResponse.json({
      poses,
      categories: library.getCategories(),
      total: poses.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch poses' },
      { status: 500 }
    );
  }
}