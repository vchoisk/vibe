import { StudioConfig } from '@snapstudio/types';
import os from 'os';
import path from 'path';

export const defaultConfig: StudioConfig = {
  studioName: 'SnapStudio',
  watchDirectory: path.join(os.homedir(), 'Pictures', 'SnapStudio', 'Camera'),
  outputDirectory: path.join(os.homedir(), 'Pictures', 'SnapStudio', 'Organized'),
  maxSessionTime: 3600000, // 1 hour
  photosPerSession: 9,
  autoCleanup: false,
  customPoses: [],
};

export const getAppDataPath = (): string => {
  const platform = process.platform;
  
  switch (platform) {
    case 'win32':
      return path.join(process.env.APPDATA || '', 'SnapStudio');
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'SnapStudio');
    default:
      return path.join(os.homedir(), '.snapstudio');
  }
};

export const getPaths = () => ({
  appData: getAppDataPath(),
  sessions: path.join(getAppDataPath(), 'sessions'),
  config: path.join(getAppDataPath(), 'config'),
  logs: path.join(getAppDataPath(), 'logs'),
  temp: path.join(getAppDataPath(), 'temp'),
  customPoses: path.join(getAppDataPath(), 'config', 'custom-poses.json'),
});

export type Config = typeof defaultConfig;