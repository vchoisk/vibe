export interface Photo {
  id: string;
  filename: string;
  filepath: string;
  captureTime: Date;
  starred: boolean;
  sessionId: string;
  thumbnailPath?: string;
}

export interface PhotoSession {
  id: string;
  poseType: string;
  poseName: string;
  startTime: Date;
  endTime?: Date;
  photoCount: number;
  maxPhotos: number;
  photos: Photo[];
  starredPhotos: string[];
  status: 'active' | 'review' | 'complete';
  outputDirectory: string;
}

export interface StudioConfig {
  studioName: string;
  watchDirectory: string;
  outputDirectory: string;
  maxSessionTime: number;
  photosPerSession: number;
  autoCleanup: boolean;
  customPoses: Pose[];
}

export interface Pose {
  id: string;
  name: string;
  description: string;
  category: 'portrait' | 'full-body' | 'sitting' | 'creative' | 'custom';
  imageUrl: string;
  instructions: string[];
}

export interface AppState {
  currentSession: {
    id: string;
    poseType: string;
    photoCount: number;
    photos: Photo[];
    starredPhotos: string[];
    status: 'selecting' | 'active' | 'reviewing' | 'complete';
  };
  allSessions: PhotoSession[];
  studioConfig: StudioConfig;
  uiState: {
    loading: boolean;
    error: string | null;
    currentView: string;
  };
}

export interface SocketEvents {
  'new-photo': Photo;
  'photo-starred': { photoId: string; starred: boolean };
  'session-updated': PhotoSession;
  'session-completed': { sessionId: string };
}