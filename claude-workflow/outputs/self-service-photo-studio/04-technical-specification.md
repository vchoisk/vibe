# Technical Specification: SnapStudio

**Date**: 2025-07-23  
**Version**: 1.0  
**Based on**: PRD v1.0, User Scenarios v1.0

## 1. Executive Summary

### Project Overview
SnapStudio is a **local-first Next.js web application** that runs as a local server on studio computers, transforming self-service photo studio experiences through structured 9-photo pose sessions, real-time photo starring, and automatic file organization. Multiple devices on the studio network can access the interface through browsers without any installation.

### Key Architectural Decisions
- **Local Network Server**: Next.js server running on studio computer, accessible via local IP
- **Browser-Based UI**: React application accessible from any device on studio network
- **Local-First Architecture**: File-based operations with no database or cloud dependencies
- **Vanilla Extract**: Type-safe, zero-runtime CSS-in-JS for optimal performance
- **File System Integration**: Real-time photo monitoring and automatic organization

### Implementation Timeline
- **Phase 1 (Weeks 1-2)**: Foundation setup, monorepo configuration, core packages
- **Phase 2 (Weeks 3-6)**: Core features implementation, user workflows, file management
- **Phase 3 (Weeks 7-8)**: Integration, polish, performance optimization
- **Phase 4 (Weeks 9-10)**: Production packaging, deployment, testing

### Success Criteria
- **Performance**: Photo display within 2 seconds, smooth 60fps interactions
- **Reliability**: 99.9% uptime during studio hours, graceful error recovery
- **User Experience**: 85% session completion rate, 60% faster photo selection
- **Business Impact**: Reduced studio support requests, improved customer satisfaction

---

## 2. System Architecture

### 2.1 High-Level Architecture

**System Overview**:
SnapStudio operates as a standalone desktop application that monitors a camera output directory, provides an intuitive UI for photo session management, and automatically organizes selected photos into clean directory structures.

**Core Components**:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Camera/PC     │    │   SnapStudio    │    │  File System    │
│                 │    │   Server        │    │                 │
│ Saves photos to ├────┤                 ├────┤ Organized       │
│ watch directory │    │ • Next.js API   │    │ photo folders   │
│                 │    │ • File Monitor  │    │                 │
└─────────────────┘    │ • Session Mgmt  │    └─────────────────┘
                       └─────┬───────────┘
                             │ HTTP Server (localhost:3000)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐        ┌──────▼──────┐      ┌─────▼─────┐
   │ Studio  │        │   Tablet    │      │  Phone    │
   │Computer │        │   Browser   │      │ Browser   │
   │Browser  │        │             │      │           │
   └─────────┘        └─────────────┘      └───────────┘
   
   All devices access: http://192.168.1.100:3000
```

**Data Flow**:
1. Camera saves photos → Watch directory
2. File monitor detects new photos → Triggers UI update
3. User interacts with pose library → Session state updates
4. User stars photos → Session data updates
5. File organizer copies starred photos → Organized directories
6. User completes session → Clean state reset

**Technology Stack**:
- **Runtime**: Node.js server running locally on studio computer
- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Vanilla Extract for type-safe CSS-in-JS
- **File Operations**: Node.js fs-extra + chokidar file watcher
- **Real-time Updates**: WebSockets for live photo updates across devices
- **Build System**: Turbo monorepo with TypeScript

### 2.2 Monorepo Structure

```
apps/
  └── studio-app/              # Main SnapStudio Next.js application
      ├── src/
      │   ├── app/             # Next.js App Router pages
      │   ├── components/      # React components
      │   ├── lib/            # Utility functions
      │   ├── styles/         # Vanilla Extract styles
      │   └── hooks/          # Custom React hooks for WebSocket/state
packages/
  ├── ui/                     # Shared UI components and design system
  ├── file-manager/           # File system operations and monitoring
  ├── session-manager/        # Photo session state management
  ├── pose-library/           # Pose data and management utilities
  ├── types/                  # Shared TypeScript type definitions
  └── config/                 # Shared configuration and constants
```

---

## 3. Frontend Specification

### 3.1 Application Architecture

**Next.js App Router Structure**:
```
src/app/
├── page.tsx                   # Welcome screen / session launcher
├── session/
│   ├── pose-select/
│   │   └── page.tsx          # Pose library and selection
│   ├── active/
│   │   └── page.tsx          # Active photo session (progress tracking)
│   ├── review/
│   │   └── page.tsx          # Photo review and starring
│   └── complete/
│       └── page.tsx          # Session completion and file access
├── settings/
│   └── page.tsx              # Studio configuration
├── api/
│   ├── photos/               # Photo management endpoints
│   ├── sessions/             # Session state endpoints
│   └── files/                # File organization endpoints
└── components/
    ├── PhotoGrid/            # Photo display and interaction
    ├── PoseSelector/         # Pose library interface
    ├── SessionProgress/      # Progress indicators
    ├── StarButton/           # Photo starring interface
    └── ErrorBoundary/        # Error handling wrapper
```

**Component Organization Patterns**:
- **Atomic Design**: Atoms (buttons, inputs) → Molecules (photo cards) → Organisms (photo grids)
- **Feature-Based**: Components grouped by functionality (session/, photos/, poses/)
- **Shared UI**: Common components in packages/ui for reusability
- **Style Co-location**: Vanilla Extract styles alongside components

**State Management Strategy**:
- **React Context**: Session state (current pose, progress, starred photos)
- **SWR**: Server state for file operations and photo data
- **Local Storage**: Persist user preferences and session recovery
- **URL State**: Session navigation and deep linking

### 3.2 User Interface Design

**Screen Specifications** (Based on User Scenarios):

**Welcome Screen**:
- Large "Start New Session" button (touch-friendly 60px height)
- Studio branding area (configurable)
- Quick access to settings (gear icon)
- Session history (optional, last 3 sessions)

**Pose Selection Screen**:
- Grid layout: 3-4 poses per row on large screens, 2 per row on tablets
- Categories: Portrait, Full-body, Sitting, Creative, Custom
- Visual examples: 200x300px preview images
- Pose descriptions and instructions overlay
- "Custom Pose" option for experienced users

**Active Session Screen**:
- Large progress indicator: "Session 1: Professional Portrait - Photo 3 of 9"
- Live photo preview area (600x400px minimum)
- Pose guidance image (persistent, 200x250px)
- Minimal UI during photo-taking (non-distracting)

**Photo Review Screen**:
- 3x3 grid layout for 9 photos (responsive scaling)
- Large touch targets for starring (40px minimum)
- Clear visual distinction: starred photos have gold overlay
- Batch actions: "Star All", "Clear All", "Next Session"
- Progress summary: "Session 1 complete - 3 photos starred"

**Responsive Design Requirements**:
- **Primary**: Large desktop displays (1920x1080, 21"+ monitors)
- **Secondary**: Tablet interfaces (1024x768, 10-12" screens)
- **Touch-First**: 44px minimum touch targets, gesture support
- **High Contrast**: Readable in various studio lighting conditions

### 3.3 Frontend Data Management

**Client-Side State Structure**:
```typescript
interface AppState {
  currentSession: {
    id: string;
    poseType: string;
    photoCount: number;
    photos: Photo[];
    starredPhotos: string[];
    status: 'selecting' | 'active' | 'reviewing' | 'complete';
  };
  allSessions: Session[];
  studioConfig: {
    watchDirectory: string;
    outputDirectory: string;
    studioName: string;
  };
  uiState: {
    loading: boolean;
    error: string | null;
    currentView: string;
  };
}
```

**API Integration Patterns**:
- **SWR for File Operations**: `useSWR('/api/photos/recent', fetcher)`
- **WebSocket Integration**: Real-time updates when new photos detected
- **Optimistic Updates**: Star photos immediately, sync across devices
- **Error Boundaries**: Graceful handling of file system errors
- **Multi-Device Sync**: Session state synchronized across all connected devices

---

## 4. Backend Specification

### 4.1 API Architecture

**REST API Design** (Next.js API Routes):

```
GET    /api/photos/recent           # Get latest photos from watch directory
POST   /api/photos/star             # Star/unstar specific photos
POST   /api/photos/organize         # Trigger file organization
GET    /api/sessions/current        # Get current session state
POST   /api/sessions/create         # Create new pose session
PUT    /api/sessions/[id]/complete  # Complete session
GET    /api/poses                   # Get pose library
POST   /api/config/update           # Update studio configuration
GET    /api/health                  # System health check
WebSocket: /api/socket              # Real-time updates for all connected devices
```

**Request/Response Schemas**:
```typescript
// Photo starring request
POST /api/photos/star
{
  photoId: string;
  starred: boolean;
  sessionId: string;
}

// Session creation request
POST /api/sessions/create
{
  poseType: string;
  poseName: string;
  maxPhotos: number; // default: 9
}

// Photos response
GET /api/photos/recent
{
  photos: Array<{
    id: string;
    filename: string;
    filepath: string;
    captureTime: string;
    starred: boolean;
    sessionId: string;
  }>;
  totalCount: number;
}
```

### 4.2 Data Architecture

**File-Based Storage Strategy**:
```
~/.snapstudio/                     # Application data directory
├── sessions/                      # Session state files
│   ├── session-20250723-001.json
│   └── session-20250723-002.json
├── config/
│   ├── studio-settings.json      # Studio configuration
│   └── pose-library-custom.json  # Custom poses
├── temp/                          # Temporary files
└── logs/
    └── app.log                    # Application logs
```

**Data Models**:
```typescript
interface PhotoSession {
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

interface Photo {
  id: string;
  filename: string;
  filepath: string;
  captureTime: Date;
  starred: boolean;
  sessionId: string;
  thumbnailPath?: string;
}

interface StudioConfig {
  studioName: string;
  watchDirectory: string;
  outputDirectory: string;
  maxSessionTime: number; // seconds
  photosPerSession: number; // default: 9
  autoCleanup: boolean;
  customPoses: Pose[];
}
```

### 4.3 Business Logic Implementation

**File System Monitoring with WebSocket Broadcast**:
```typescript
// File watcher implementation with real-time updates
import chokidar from 'chokidar';
import { Server as SocketIOServer } from 'socket.io';

class PhotoMonitor {
  private watcher: chokidar.FSWatcher;
  private io: SocketIOServer;
  
  constructor(io: SocketIOServer) {
    this.io = io;
  }
  
  startWatching(directory: string) {
    this.watcher = chokidar.watch(directory, {
      ignored: /^\./, // ignore hidden files
      persistent: true,
      awaitWriteFinish: true, // wait for file write completion
    });
    
    this.watcher.on('add', this.handleNewPhoto.bind(this));
  }
  
  private async handleNewPhoto(filepath: string) {
    // Generate thumbnail, update session state
    const photo = await this.processNewPhoto(filepath);
    
    // Broadcast to all connected devices
    this.io.emit('new-photo', photo);
  }
}
```

**Real-time Communication**:
```typescript
// WebSocket event types
interface SocketEvents {
  'new-photo': Photo;
  'photo-starred': { photoId: string; starred: boolean };
  'session-updated': Session;
  'session-completed': { sessionId: string };
}

// Client-side hook for real-time updates
function useRealtimeUpdates() {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    
    newSocket.on('new-photo', (photo: Photo) => {
      // Update local state, trigger UI update
    });
    
    newSocket.on('photo-starred', ({ photoId, starred }) => {
      // Sync starring across devices
    });
    
    return () => newSocket.close();
  }, []);
  
  return socket;
}
```

**File Organization Logic**:
```typescript
class FileOrganizer {
  async organizeStarredPhotos(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    const outputDir = path.join(
      session.outputDirectory,
      `session-${session.id}-${session.poseName}`
    );
    
    await fs.ensureDir(outputDir);
    
    for (const photoId of session.starredPhotos) {
      const photo = session.photos.find(p => p.id === photoId);
      if (photo) {
        await fs.copy(photo.filepath, path.join(outputDir, photo.filename));
      }
    }
  }
}
```

---

## 5. Development Infrastructure

### 5.1 Development Environment

**Local Development Setup**:
```bash
# Clone and setup
git clone <repo>
cd snapstudio
npm install

# Development with hot reload (accessible on network)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Server runs on http://localhost:3000
# Accessible on network: http://[studio-ip]:3000
```

**Development Scripts** (package.json):
```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "turbo run build",
    "start": "next start -H 0.0.0.0",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "studio:setup": "node scripts/setup-studio.js",
    "clean": "turbo run clean"
  }
}
```

**Code Quality Tools**:
- **ESLint**: Airbnb config + Next.js rules + custom studio rules
- **Prettier**: Consistent code formatting across monorepo
- **TypeScript**: Strict mode enabled, no implicit any
- **Husky**: Pre-commit hooks for linting and testing

### 5.2 Testing Strategy

**Unit Testing**:
- **Jest + React Testing Library**: Component and utility testing
- **Coverage Target**: 80% for business logic, 60% for UI components
- **Test Location**: Co-located with components (`__tests__` folders)

**Integration Testing**:
- **File System Operations**: Mock file operations, test organization logic
- **API Endpoints**: Test Next.js API routes with mock data
- **Session Workflows**: Test complete user workflows

**End-to-End Testing**:
- **Playwright**: Full application testing in Electron environment
- **Critical Paths**: Complete photo session, file organization, error recovery
- **Performance Tests**: Photo loading speed, file operation timing

### 5.3 Build and Deployment

**Studio Installation Package**:
```bash
# Create studio installation package
npm run build
npm run package:studio

# Generates:
# - snapstudio-studio-setup.zip (Windows/Mac/Linux)
# - Contains: built app + setup script + documentation
```

**Distribution Strategy**:
- **Portable Package**: ZIP file with built Next.js app + Node.js
- **Setup Script**: Automated configuration for studio network
- **Web Interface**: No installation needed on client devices
- **Network Access**: Automatic IP detection and QR code generation
- **Package Size**: Target <50MB (no Electron overhead)

**Studio Setup Process**:
```bash
# 1. Extract package on studio computer
unzip snapstudio-studio-setup.zip

# 2. Run setup script
./setup-studio.sh  # Mac/Linux
setup-studio.bat   # Windows

# 3. Configure directories
# - Camera output directory
# - Organized photos directory
# - Studio name and branding

# 4. Start server
npm run start

# 5. Access from any device
# http://[studio-ip]:3000
# QR code displayed for easy mobile access
```

---

## 6. Implementation Plan

### 6.1 Development Phases

**Phase 1: Foundation (Weeks 1-2)**

*Milestone: Development environment ready, core packages operational*

**Week 1: Environment Setup**
- [ ] **Setup-001**: Initialize Turbo monorepo with Next.js + Electron
  - Dependencies: None
  - Acceptance: `npm run dev` launches app, hot reload works
  - Effort: 1 day
  - Priority: P0

- [ ] **Setup-002**: Configure TypeScript, ESLint, Prettier across monorepo
  - Dependencies: Setup-001
  - Acceptance: Code linting and formatting works, no TS errors
  - Effort: 0.5 days
  - Priority: P0

- [ ] **Setup-003**: Create packages structure (ui, file-manager, session-manager, etc.)
  - Dependencies: Setup-001
  - Acceptance: Package imports work, monorepo build succeeds
  - Effort: 1 day
  - Priority: P0

**Week 2: Core Packages**
- [ ] **Core-001**: Implement file-manager package with chokidar integration
  - Dependencies: Setup-003
  - Acceptance: Can monitor directory and detect new photos
  - Effort: 2 days
  - Priority: P0

- [ ] **Core-002**: Create session-manager package with state management
  - Dependencies: Setup-003
  - Acceptance: Can create/update/complete photo sessions
  - Effort: 1.5 days
  - Priority: P0

- [ ] **Core-003**: Build pose-library package with initial pose data
  - Dependencies: Setup-003
  - Acceptance: Pose data loads, categories work
  - Effort: 1 day
  - Priority: P1

**Phase 2: Core Features (Weeks 3-6)**

*Milestone: MVP functionality complete, basic user workflows operational*

**Week 3-4: User Interface**
- [ ] **UI-001**: Create welcome screen and session launcher
  - Dependencies: Core-002
  - Acceptance: User can start new session, navigation works
  - Effort: 2 days
  - Priority: P0

- [ ] **UI-002**: Build pose selection screen with grid layout
  - Dependencies: Core-003, UI-001
  - Acceptance: User can browse and select poses, visual examples display
  - Effort: 3 days
  - Priority: P0

- [ ] **UI-003**: Implement active session screen with progress tracking
  - Dependencies: Core-001, Core-002
  - Acceptance: Shows photo progress, displays new photos within 2 seconds
  - Effort: 3 days
  - Priority: P0

**Week 5-6: Photo Management**
- [ ] **Photo-001**: Create photo review screen with starring functionality
  - Dependencies: UI-003
  - Acceptance: 9-photo grid displays, starring works, visual feedback clear
  - Effort: 3 days
  - Priority: P0

- [ ] **Photo-002**: Implement file organization system
  - Dependencies: Core-001, Photo-001
  - Acceptance: Starred photos copied to organized folders automatically
  - Effort: 2 days
  - Priority: P0

- [ ] **Photo-003**: Build session completion and file access
  - Dependencies: Photo-002
  - Acceptance: User can access organized photos, clean session reset
  - Effort: 2 days
  - Priority: P0

**Phase 3: Integration & Polish (Weeks 7-8)**

*Milestone: Feature-complete application with error handling and optimization*

**Week 7: Integration Testing**
- [ ] **Test-001**: End-to-end workflow testing
  - Dependencies: All Phase 2 tasks
  - Acceptance: Complete user scenarios work without issues
  - Effort: 2 days
  - Priority: P0

- [ ] **Test-002**: Error handling and edge cases
  - Dependencies: Test-001
  - Acceptance: Camera failures, file permission issues handled gracefully
  - Effort: 2 days
  - Priority: P0

**Week 8: Performance & Polish**
- [ ] **Perf-001**: Image optimization and loading performance
  - Dependencies: Photo-001
  - Acceptance: Photo display under 2 seconds, smooth scrolling
  - Effort: 2 days
  - Priority: P1

- [ ] **Polish-001**: UI/UX refinements based on testing
  - Dependencies: Test-001
  - Acceptance: Touch interactions responsive, visual feedback clear
  - Effort: 2 days
  - Priority: P1

**Phase 4: Production Readiness (Weeks 9-10)**

*Milestone: Production-ready application with packaging and distribution*

**Week 9: Packaging**
- [ ] **Deploy-001**: Electron packaging and distribution setup
  - Dependencies: All previous phases
  - Acceptance: Installable packages for Mac and Windows
  - Effort: 2 days
  - Priority: P0

- [ ] **Deploy-002**: Auto-updater implementation
  - Dependencies: Deploy-001
  - Acceptance: App can update itself when new versions available
  - Effort: 2 days
  - Priority: P1

**Week 10: Final Validation**
- [ ] **Final-001**: Studio integration testing
  - Dependencies: Deploy-001
  - Acceptance: Works reliably in real studio environment
  - Effort: 2 days
  - Priority: P0

- [ ] **Final-002**: Documentation and training materials
  - Dependencies: Final-001
  - Acceptance: Installation guide, user manual, troubleshooting docs
  - Effort: 2 days
  - Priority: P1

### 6.2 Risk Assessment

**High-Risk Items**:
- **File System Permissions**: Different OS permissions could block file operations
  - *Mitigation*: Comprehensive cross-platform testing, clear error messages
- **Camera Software Compatibility**: Various camera software save files differently
  - *Mitigation*: Focus on file-based integration, support multiple formats
- **Performance with Large Images**: High-resolution photos may slow UI
  - *Mitigation*: Image optimization pipeline, progressive loading

**Medium-Risk Items**:
- **Electron App Size**: Desktop app package could be too large
  - *Mitigation*: Optimize dependencies, implement efficient bundling
- **Touch Interface on Desktop**: Touch interactions on various hardware
  - *Mitigation*: Hybrid touch/mouse design, extensive device testing

---

## 7. Technical Decisions & Trade-offs

### 7.1 Technology Choices

**Next.js + Electron vs. Native Desktop App**:
- **Choice**: Next.js + Electron
- **Rationale**: Faster development, cross-platform compatibility, web technology expertise
- **Alternatives**: Tauri, Flutter Desktop, Native (Swift/C++)
- **Trade-offs**: Larger app size vs. development speed and maintainability

**Vanilla Extract vs. Tailwind CSS**:
- **Choice**: Vanilla Extract
- **Rationale**: Zero-runtime performance, excellent TypeScript integration, better for desktop app
- **Alternatives**: Tailwind CSS, Styled Components, CSS Modules
- **Trade-offs**: More verbose vs. better performance and type safety

**File-Based Storage vs. Database**:
- **Choice**: File-based storage (JSON files)
- **Rationale**: Eliminates deployment complexity, ensures data locality, simpler backup/recovery
- **Alternatives**: SQLite, IndexedDB, Remote database
- **Trade-offs**: Limited query capabilities vs. simplicity and reliability

**SWR vs. React Query vs. Custom Data Fetching**:
- **Choice**: SWR
- **Rationale**: Lightweight, excellent Next.js integration, good caching strategy
- **Alternatives**: React Query, Custom hooks, Apollo Client
- **Trade-offs**: Less features than React Query vs. smaller bundle size

### 7.2 Architecture Patterns

**Local-First Architecture**:
- All data operations happen locally on studio computer
- No external API calls or cloud dependencies
- File system as single source of truth
- Session state persisted locally for crash recovery

**Event-Driven File Processing**:
- File system watcher triggers UI updates
- Asynchronous file operations with progress feedback
- Queue-based processing for batch operations
- Error recovery with retry mechanisms

---

## 8. Quality Assurance

### 8.1 Code Quality Standards

**TypeScript Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Testing Requirements**:
- **Unit Tests**: 80% coverage for business logic
- **Integration Tests**: All API endpoints and file operations
- **E2E Tests**: Critical user workflows (session creation, photo starring, file organization)
- **Performance Tests**: Photo loading under 2 seconds, file operations under 1 second

### 8.2 Definition of Done

**Feature Completion Criteria**:
- [ ] Functionality works as specified in user scenarios
- [ ] Unit tests written and passing
- [ ] Integration tests cover happy path and error cases
- [ ] UI is responsive and touch-friendly
- [ ] Error handling provides clear user feedback
- [ ] Performance meets specified benchmarks
- [ ] Code reviewed by team member
- [ ] Documentation updated

**Quality Gates**:
- **Phase 1**: All setup tasks complete, monorepo builds successfully
- **Phase 2**: Core workflows functional, basic UI operational
- **Phase 3**: Error handling complete, performance optimized
- **Phase 4**: Production packaging working, studio testing successful

---

**Technical Specification Validation**: ✅ Complete and Ready for Implementation  
**Next Step**: Begin Phase 1 implementation with `/step5` guidance