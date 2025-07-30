import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs-extra';
import { EventEmitter } from 'events';
import { Photo } from '@snapstudio/types';
import { generatePhotoId, isImageFile } from './utils';

export interface PhotoMonitorOptions {
  watchDirectory: string;
  ignored?: string[];
  awaitWriteFinish?: boolean | { stabilityThreshold?: number; pollInterval?: number };
}

export class PhotoMonitor extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private options: PhotoMonitorOptions;
  private sessionId: string | null = null;

  constructor(options: PhotoMonitorOptions) {
    super();
    this.options = {
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
      ...options,
    };
  }

  startWatching(sessionId: string): void {
    if (this.watcher) {
      this.stopWatching();
    }

    this.sessionId = sessionId;

    this.watcher = chokidar.watch(this.options.watchDirectory, {
      ignored: this.options.ignored || [/^\./],
      persistent: true,
      awaitWriteFinish: this.options.awaitWriteFinish,
      ignoreInitial: true,
    });

    this.watcher.on('add', this.handleNewPhoto.bind(this));
    this.watcher.on('error', (error) => this.emit('error', error));
  }

  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  private async handleNewPhoto(filepath: string): Promise<void> {
    try {
      if (!isImageFile(filepath)) {
        return;
      }

      const stats = await fs.stat(filepath);
      const filename = path.basename(filepath);

      const photo: Photo = {
        id: generatePhotoId(),
        filename,
        filepath,
        captureTime: stats.birthtime,
        starred: false,
        sessionId: this.sessionId || 'unknown',
      };

      this.emit('new-photo', photo);
    } catch (error) {
      this.emit('error', error);
    }
  }

  async getExistingPhotos(sessionId: string): Promise<Photo[]> {
    try {
      const files = await fs.readdir(this.options.watchDirectory);
      const photos: Photo[] = [];

      for (const file of files) {
        const filepath = path.join(this.options.watchDirectory, file);
        
        if (isImageFile(filepath)) {
          const stats = await fs.stat(filepath);
          photos.push({
            id: generatePhotoId(),
            filename: file,
            filepath,
            captureTime: stats.birthtime,
            starred: false,
            sessionId,
          });
        }
      }

      return photos.sort((a, b) => a.captureTime.getTime() - b.captureTime.getTime());
    } catch (error) {
      console.error('Error reading existing photos:', error);
      return [];
    }
  }
}