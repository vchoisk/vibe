const fs = require('fs');
const path = require('path');

const testPhotosDir = path.join(process.env.HOME, 'Pictures', 'SnapStudio', 'TestPhotos');
const cameraDir = path.join(process.env.HOME, 'Pictures', 'SnapStudio', 'Camera');

// Get list of test photos
const testPhotos = fs.readdirSync(testPhotosDir).filter(f => f.endsWith('.jpg'));

if (testPhotos.length === 0) {
  console.log('No test photos found in:', testPhotosDir);
  process.exit(1);
}

// Find the next photo to add
let nextPhotoIndex = 0;
for (let i = 0; i < testPhotos.length; i++) {
  const photoPath = path.join(cameraDir, testPhotos[i]);
  if (!fs.existsSync(photoPath)) {
    nextPhotoIndex = i;
    break;
  }
}

if (nextPhotoIndex >= testPhotos.length) {
  console.log('All test photos have been added!');
  process.exit(0);
}

// Copy the next photo
const sourcePhoto = path.join(testPhotosDir, testPhotos[nextPhotoIndex]);
const destPhoto = path.join(cameraDir, testPhotos[nextPhotoIndex]);

fs.copyFileSync(sourcePhoto, destPhoto);
console.log(`✓ Added ${testPhotos[nextPhotoIndex]} to camera directory`);
console.log(`  Photos added: ${nextPhotoIndex + 1}/${testPhotos.length}`);