import { NextRequest, NextResponse } from 'next/server';

// GET /api/test/debug - Debug endpoint to test fetch
export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if fetch is available
    const fetchAvailable = typeof fetch !== 'undefined';
    
    // Test 2: Try a simple fetch
    let fetchTest = 'not tested';
    let fetchError = null;
    
    if (fetchAvailable) {
      try {
        const testUrl = 'https://httpbin.org/get';
        const response = await fetch(testUrl);
        fetchTest = `Status: ${response.status}, OK: ${response.ok}`;
      } catch (err) {
        fetchError = err instanceof Error ? err.message : 'Unknown error';
        fetchTest = 'failed';
      }
    }
    
    // Test 3: Try Lorem Picsum
    let picsumTest = 'not tested';
    let picsumError = null;
    
    try {
      const picsumUrl = 'https://picsum.photos/200/300';
      const response = await fetch(picsumUrl);
      picsumTest = `Status: ${response.status}, OK: ${response.ok}, Content-Type: ${response.headers.get('content-type')}`;
    } catch (err) {
      picsumError = err instanceof Error ? err.message : 'Unknown error';
      picsumTest = 'failed';
    }
    
    return NextResponse.json({
      environment: {
        nodeVersion: process.version,
        env: process.env.NODE_ENV,
      },
      tests: {
        fetchAvailable,
        fetchTest,
        fetchError,
        picsumTest,
        picsumError,
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}