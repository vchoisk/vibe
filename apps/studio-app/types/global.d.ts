import { PhotoMonitor } from '@snapstudio/file-manager';
import { SessionManager } from '@snapstudio/session-manager';
import { Server } from 'socket.io';

declare global {
  var photoMonitor: PhotoMonitor | undefined;
  var sessionManager: SessionManager | undefined;
  var io: Server | undefined;
}

export {};