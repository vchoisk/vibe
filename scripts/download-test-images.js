const https = require('https');
const fs = require('fs');
const path = require('path');

// Create test images directory
const testImagesDir = path.join(process.env.HOME, 'Pictures', 'SnapStudio', 'Camera');

// Ensure directory exists
if (!fs.existsSync(testImagesDir)) {
  fs.mkdirSync(testImagesDir, { recursive: true });
}

console.log(`Downloading test images to: ${testImagesDir}`);

// Generate Lorem Picsum URLs with different seeds for variety
const imageUrls = [];
for (let i = 0; i < 9; i++) {
  const seed = Date.now() + i; // Different seed for each image
  imageUrls.push({
    url: `https://picsum.photos/seed/${seed}/800/1200`,
    filename: `portrait-${i + 1}.jpg`
  });
}

// Function to download an image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(filepath);
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      }
    }).on('error', reject);
  });
}

// Download all images
async function downloadAllImages() {
  console.log('Starting download of test images...\n');
  
  for (let i = 0; i < imageUrls.length; i++) {
    const { url, filename } = imageUrls[i];
    const filepath = path.join(testImagesDir, filename);
    
    try {
      console.log(`Downloading ${filename}...`);
      await downloadImage(url, filepath);
      console.log(`✓ Downloaded ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to download ${filename}:`, error.message);
    }
  }
  
  console.log('\nAll downloads complete!');
  console.log(`Images saved to: ${testImagesDir}`);
}

// Run the download
downloadAllImages().catch(console.error);