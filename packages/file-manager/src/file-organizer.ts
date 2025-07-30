import path from 'path';
import fs from 'fs-extra';
import { Photo, PhotoSession } from '@snapstudio/types';
import { sanitizeFilename } from './utils';

export interface FileOrganizerOptions {
  outputDirectory: string;
  createThumbnails?: boolean;
  preserveOriginals?: boolean;
}

export class FileOrganizer {
  private options: FileOrganizerOptions;

  constructor(options: FileOrganizerOptions) {
    this.options = {
      createThumbnails: true,
      preserveOriginals: true,
      ...options,
    };
  }

  async organizeStarredPhotos(session: PhotoSession): Promise<string> {
    const sessionDirName = this.createSessionDirectoryName(session);
    const outputDir = path.join(this.options.outputDirectory, sessionDirName);

    await fs.ensureDir(outputDir);

    const starredPhotos = session.photos.filter((photo) => 
      session.starredPhotos.includes(photo.id)
    );

    for (const photo of starredPhotos) {
      await this.copyPhoto(photo, outputDir);
    }

    await this.createSessionInfo(session, outputDir);

    return outputDir;
  }

  private async copyPhoto(photo: Photo, outputDir: string): Promise<void> {
    const destFilename = this.createPhotoFilename(photo);
    const destPath = path.join(outputDir, destFilename);

    try {
      if (this.options.preserveOriginals) {
        await fs.copy(photo.filepath, destPath, { overwrite: false });
      } else {
        await fs.move(photo.filepath, destPath, { overwrite: false });
      }
    } catch (error) {
      console.error(`Error copying photo ${photo.filename}:`, error);
      throw error;
    }
  }

  private createSessionDirectoryName(session: PhotoSession): string {
    const date = new Date(session.startTime);
    const dateStr = date.toISOString().split('T')[0];
    const poseName = sanitizeFilename(session.poseName);
    return `${dateStr}_${poseName}_${session.id.slice(0, 8)}`;
  }

  private createPhotoFilename(photo: Photo): string {
    const ext = path.extname(photo.filename);
    const base = path.basename(photo.filename, ext);
    const timestamp = photo.captureTime.getTime();
    return `${sanitizeFilename(base)}_${timestamp}${ext}`;
  }

  private async createSessionInfo(session: PhotoSession, outputDir: string): Promise<void> {
    const infoPath = path.join(outputDir, 'session-info.json');
    const info = {
      sessionId: session.id,
      poseName: session.poseName,
      poseType: session.poseType,
      startTime: session.startTime,
      endTime: session.endTime,
      totalPhotos: session.photoCount,
      starredPhotos: session.starredPhotos.length,
      exportDate: new Date().toISOString(),
    };

    await fs.writeJson(infoPath, info, { spaces: 2 });
  }

  async cleanupOldSessions(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const dirs = await fs.readdir(this.options.outputDirectory);
    let cleanedCount = 0;

    for (const dir of dirs) {
      const dirPath = path.join(this.options.outputDirectory, dir);
      const stats = await fs.stat(dirPath);

      if (stats.isDirectory() && stats.mtime < cutoffDate) {
        await fs.remove(dirPath);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}