export type Language = 'ko' | 'ja' | 'zh' | 'es' | 'en';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export const languages: LanguageOption[] = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

export const defaultLanguage: Language = 'ko';

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    back: string;
    next: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    start: string;
    complete: string;
    settings: string;
  };
  
  // Home page
  home: {
    welcome: string;
    subtitle: string;
    resumeSession: string;
    startShoot: string;
    manageShoot: string;
    shootInProgress: string;
    startShootHint: string;
    studioSettings: string;
    howItWorks: string;
    howItWorksSteps: string[];
    perfectFor: string;
    perfectForItems: string[];
  };
  
  // Shoot pages
  shoot: {
    newShoot: string;
    createShootSubtitle: string;
    clientName: string;
    shootName: string;
    duration: string;
    notes: string;
    pricePackage: string;
    minutes: string;
    hour: string;
    hours: string;
    activeShoot: string;
    timeRemaining: string;
    sessionsCount: string;
    photosCount: string;
    startNewSession: string;
    completeShoot: string;
    allPhotos: string;
    starredPhotos: string;
    noPhotosYet: string;
    shootSummary: string;
    totalSessions: string;
    totalPhotos: string;
    totalStarred: string;
    scheduledDuration: string;
    actualDuration: string;
    backToHome: string;
  };
  
  // Session pages
  session: {
    selectPose: string;
    selectPoseSubtitle: string;
    allCategories: string;
    startSession: string;
    activeSession: string;
    photoCount: string;
    captureInstructions: string[];
    endSession: string;
    reviewPhotos: string;
    selectFavorites: string;
    starAll: string;
    clearAll: string;
    completeSession: string;
    returnToCapture: string;
  };
  
  // Settings
  settings: {
    title: string;
    studioName: string;
    photosPerSession: string;
    maxSessionTime: string;
    watchDirectory: string;
    outputDirectory: string;
    saveSettings: string;
  };
  
  // Errors
  errors: {
    required: string;
    invalidFormat: string;
    networkError: string;
    sessionActive: string;
    shootActive: string;
    noActiveShoot: string;
    failedToLoad: string;
  };
}