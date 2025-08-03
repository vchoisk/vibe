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

// Sample image URLs from Unsplash (portrait-style photos)
const imageUrls = [
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1200&fit=crop',
    filename: 'portrait-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1200&fit=crop',
    filename: 'portrait-2.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop',
    filename: 'portrait-3.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1200&fit=crop',
    filename: 'portrait-4.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=1200&fit=crop',
    filename: 'portrait-5.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop',
    filename: 'portrait-6.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop',
    filename: 'portrait-7.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800&h=1200&fit=crop',
    filename: 'portrait-8.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop',
    filename: 'portrait-9.jpg'
  }
];

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