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
    backToHome: string;
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
    overtime: string;
    sessionsCount: string;
    photosCount: string;
    startNewSession: string;
    completeShoot: string;
    allPhotos: string;
    starredPhotos: string;
    starredOnly: string;
    noPhotosYet: string;
    shootSummary: string;
    totalSessions: string;
    totalPhotos: string;
    totalStarred: string;
    scheduledDuration: string;
    actualDuration: string;
    backToHome: string;
    client: string;
    sessionInProgress: string;
    photosTaken: string;
    continueSession: string;
    shootPhotos: string;
    loadingPhotos: string;
    sessionLabel: string;
    photosLabel: string;
    starredPhotosLabel: string;
    completeSessionFirst: string;
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
    title: string;
    takePhotos: string;
    photoProgress: string;
    photosRemaining: string;
    sessionComplete: string;
    instructions: string;
    instructionsList: string[];
    continueToReview: string;
    photos: string;
    cancelSession: string;
    waitingForPhotos: string;
    connectionLost: string;
    cancelConfirm: string;
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
    failedToCreateSession: string;
    failedToCompleteSession: string;
    noActiveSession: string;
    shootNotFound: string;
    failedToCompleteShoot: string;
  };
  
  // Pose selection
  poseSelect: {
    title: string;
    subtitle: string;
    subtitleWithClient: string;
    allPoses: string;
    loadingPoses: string;
    selected: string;
    instructions: string;
    startSession: string;
  };
  
  // Review page
  review: {
    title: string;
    subtitle: string;
    starredCount: string;
    starAll: string;
    clearAll: string;
    starPhoto: string;
    unstarPhoto: string;
    readyToFinish: string;
    photosSavedMessage: string;
    noPhotosSelected: string;
    takeMorePhotos: string;
    completeSession: string;
    sessionCompleteWithPhotos: string;
    sessionCompleteNoPhotos: string;
  };
  
  // Shoot summary
  shootSummary: {
    title: string;
    totalSessions: string;
    totalPhotos: string;
    starredPhotos: string;
    duration: string;
    minutes: string;
    sessionLabel: string;
    photosCount: string;
    invoice: string;
    overtime: string;
    additionalCharges: string;
  };
}