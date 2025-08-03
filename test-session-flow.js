#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testSessionFlow() {
  console.log('Testing session flow...\n');

  try {
    // -1. Complete any existing session
    console.log('-1. Completing any existing session...');
    try {
      await fetch(`${API_BASE}/sessions/current/complete`, { method: 'POST' });
      console.log('   Completed existing session\n');
    } catch (e) {
      console.log('   No existing session to complete\n');
    }

    // 0. Get available poses
    console.log('0. Getting available poses...');
    const posesRes = await fetch(`${API_BASE}/poses`);
    const { poses } = await posesRes.json();
    console.log(`   Found ${poses.length} poses`);
    const firstPose = poses[0];
    console.log(`   Using pose: ${firstPose.name} (${firstPose.id})\n`);

    // 1. Create a session
    console.log('1. Creating session...');
    const createRes = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poseId: firstPose.id })
    });
    
    if (!createRes.ok) {
      const error = await createRes.text();
      throw new Error(`Failed to create session: ${error}`);
    }
    
    const { session } = await createRes.json();
    console.log(`   Created session: ${session.id}\n`);

    // 2. Check current session
    console.log('2. Checking current session...');
    const currentRes = await fetch(`${API_BASE}/sessions/current`);
    const currentData = await currentRes.json();
    console.log(`   Current session: ${currentData.session?.id || 'none'}\n`);

    // 3. Add some photos (simulate)
    console.log('3. Adding test photos...');
    // This would normally be done by the file watcher
    
    // 4. Update session status to review
    console.log('4. Updating session status to review...');
    const updateRes = await fetch(`${API_BASE}/sessions/current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'review' })
    });
    
    if (!updateRes.ok) {
      const error = await updateRes.text();
      console.error(`   Error updating session: ${error}`);
    } else {
      const updateData = await updateRes.json();
      console.log(`   Updated session status: ${updateData.session?.status || 'unknown'}\n`);
    }

    // 5. Check current session again
    console.log('5. Checking current session again...');
    const finalRes = await fetch(`${API_BASE}/sessions/current`);
    const finalData = await finalRes.json();
    console.log(`   Current session: ${finalData.session?.id || 'none'} (status: ${finalData.session?.status || 'none'})\n`);

    // 6. Test photos API (what review page calls)
    console.log('6. Testing photos API...');
    const photosRes = await fetch(`${API_BASE}/photos`);
    if (!photosRes.ok) {
      const error = await photosRes.text();
      console.error(`   Error getting photos: ${error}`);
    } else {
      const photosData = await photosRes.json();
      console.log(`   Photos API returned: ${photosData.photos?.length || 0} photos\n`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSessionFlow();