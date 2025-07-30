import path from 'path';
import crypto from 'crypto';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'];

export function isImageFile(filepath: string): boolean {
  const ext = path.extname(filepath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

export function generatePhotoId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}