import sharp from 'sharp';
import path from 'path';
import fs from 'fs-extra';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ThumbnailGenerator {
  private defaultOptions: Required<ThumbnailOptions> = {
    width: 300,
    height: 300,
    quality: 85,
    format: 'jpeg',
  };

  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    options?: ThumbnailOptions
  ): Promise<void> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      await sharp(inputPath)
        .resize(opts.width, opts.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat(opts.format, { quality: opts.quality })
        .toFile(outputPath);
    } catch (error) {
      console.error(`Error generating thumbnail for ${inputPath}:`, error);
      throw error;
    }
  }

  async generateBatch(
    photos: Array<{ input: string; output: string }>,
    options?: ThumbnailOptions
  ): Promise<void> {
    const promises = photos.map(({ input, output }) =>
      this.generateThumbnail(input, output, options)
    );

    await Promise.all(promises);
  }

  async ensureThumbnailDirectory(baseDir: string): Promise<string> {
    const thumbDir = path.join(baseDir, 'thumbnails');
    await fs.ensureDir(thumbDir);
    return thumbDir;
  }
}