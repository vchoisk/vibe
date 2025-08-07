export interface Photo {
  id: string;
  filename: string;
  filepath: string;
  captureTime: Date;
  starred: boolean;
  sessionId: string;
  thumbnailPath?: string;
  sessionFilepath?: string; // Path to the photo copy in the session folder
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
  shootId?: string; // Associated shoot ID if part of a shoot
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

export interface Shoot {
  id: string;
  name: string;
  clientName: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  sessions: string[]; // Array of session IDs
  totalPhotos: number;
  totalStarredPhotos: number;
  createdAt: Date;
  activatedAt?: Date;
  completedAt?: Date;
  notes?: string;
  pricePackage?: {
    name: string;
    durationMinutes: number;
    price: number;
  };
}

export interface ShootSummary {
  shootId: string;
  totalSessions: number;
  totalPhotos: number;
  totalStarredPhotos: number;
  allPhotos: Photo[];
  sessionDetails: PhotoSession[];
  duration: {
    scheduled: number;
    actual: number;
  };
}

export interface SocketEvents {
  'new-photo': Photo;
  'photo-starred': { photoId: string; starred: boolean };
  'session-updated': PhotoSession;
  'session-completed': { sessionId: string };
  'session-created': PhotoSession;
  'shoot-started': Shoot;
  'shoot-updated': Shoot;
  'shoot-completed': ShootSummary;
}