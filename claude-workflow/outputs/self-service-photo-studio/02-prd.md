# Product Requirements Document: SnapStudio

**Date**: 2025-07-23  
**Version**: 1.0  
**Status**: Draft for Review

## 1. Executive Summary

**Project Name**: SnapStudio - Structured Photo Session Assistant  
**Tagline**: "Turn photo chaos into organized sessions"

**Brief Description**: SnapStudio is a Next.js-based desktop/web application that transforms self-service photo studio experiences by organizing photo sessions into structured 9-photo pose sets, providing real-time photo starring capabilities, and automatically organizing selected photos into clean directory structures.

**Key Value Proposition**: Eliminates the overwhelming experience of choosing from 100+ photos while solving pose inspiration problems through guided, structured photo sessions.

**Success Metrics**:
- 80% reduction in time spent selecting photos post-session
- 90% of users complete full pose sessions (vs. abandoning mid-session)
- 70% increase in customer satisfaction scores for participating studios

## 2. Problem Statement & Opportunity

**Detailed Problem Description**:
Self-service photo studios (Type 3 in Korea) suffer from two critical user experience problems:
1. **Photo Selection Overwhelm**: Users take 100+ photos in 10-minute sessions but have no efficient way to identify their best shots, leading to frustration and poor selection decisions
2. **Pose Inspiration Drought**: Users run out of pose ideas mid-session, resulting in repetitive, awkward, or unsatisfying photos

**Market Opportunity Size**:
- Korean self-service photo studio market growing 15% annually
- Estimated 2,000+ Type 3 studios nationwide
- Average 50-100 customers per studio per day
- Potential market: $2-5M annually (licensing model)

**Current Solutions and Limitations**:
- **Manual Review**: Users manually scroll through hundreds of photos on camera/PC - time-consuming and inefficient
- **No Pose Guidance**: Users rely on mirrors and trial-and-error for poses - leads to repetitive results
- **Basic File Management**: Standard camera software saves all photos in single directory - difficult to organize favorites

**Why Now?**:
- Growing popularity of self-service photo experiences post-COVID
- Increased expectation for digital user experience improvements
- Technology maturity (Next.js, file system APIs) makes implementation feasible
- Studio owners seeking differentiation in competitive market

## 3. Target Users & Personas

### Primary User Persona: "Studio Customer - Sarah"
**Demographics**: Female, 20-30 years old, university student or young professional  
**Technology Comfort**: High - smartphone native, uses various apps daily  
**Studio Usage**: Visits self-service studios 2-3 times per year for profile photos, special occasions  
**Pain Points**:
- Overwhelmed by choosing from 100+ similar photos
- Runs out of pose ideas after 5 minutes
- Frustrated by poor photo organization
- Time pressure during rental sessions

**Goals & Motivations**:
- Get high-quality photos efficiently
- Try different poses and styles
- Easy selection and organization of favorites
- Maximize value from studio rental time

### Secondary User Persona: "Studio Owner - Mr. Kim"
**Demographics**: Male, 35-50 years old, small business owner  
**Technology Comfort**: Medium - comfortable with business software, learning new tools  
**Business Goals**: Increase customer satisfaction, reduce support requests, differentiate from competitors  
**Pain Points**:
- Customers need help with photo selection post-session
- Equipment setup questions interrupt operations
- Difficulty justifying premium pricing vs. competitors

**Goals & Motivations**:
- Improve customer experience and reviews
- Reduce operational support burden
- Increase customer retention and referrals
- Justify premium pricing through superior experience

## 4. Product Vision & Goals

**Long-term Vision (1-2 years)**:
SnapStudio becomes the standard software for self-service photo studios across Korea and expands to Japan and other Asian markets, transforming chaotic photo sessions into organized, enjoyable experiences.

**Success Criteria and KPIs**:
- **User Experience**: 4.5+ star average rating in app stores
- **Adoption**: 300+ studios using SnapStudio within 12 months
- **Engagement**: 85% of users complete multiple pose sessions per visit
- **Efficiency**: 60% reduction in post-session photo selection time

**Business Objectives**:
- Generate $500K+ ARR within 18 months
- Achieve 40% market penetration in Seoul metro area
- Establish partnerships with major studio chains
- Build foundation for expansion to other markets

**User Experience Objectives**:
- Intuitive interface requiring no training
- Seamless integration with existing studio workflows
- Fast, responsive performance on typical studio hardware
- Delightful pose discovery and photo organization experience

## 5. Functional Requirements

### 5.1 Core Features (MVP)

#### F1: Pose Session Structure
**User Story**: As a studio customer, I want to organize my photo session into focused pose sets so that I can try different styles without feeling overwhelmed.

**Acceptance Criteria**:
- User can start a new photo session
- Each session is structured into 9-photo sets
- Clear progress indicator shows "Photo X of 9"
- User can complete a session and start a new one
- Sessions are automatically named with pose type

**Priority**: P0 (Critical)

#### F2: Pose Library & Selection
**User Story**: As a studio customer, I want to choose from a curated library of pose suggestions so that I never run out of ideas during my session.

**Acceptance Criteria**:
- Pose library contains 20+ different pose types with visual examples
- Poses categorized by style (portrait, full-body, sitting, etc.)
- Visual examples show proper positioning and angles
- User can select pose before starting each 9-photo session
- Custom pose option for experienced users

**Priority**: P0 (Critical)

#### F3: Real-Time Photo Display & Starring
**User Story**: As a studio customer, I want to see my photos immediately after taking them and quickly mark my favorites so that I don't have to review hundreds of photos later.

**Acceptance Criteria**:
- Photos appear on screen within 2 seconds of capture
- After 9 photos, all photos from the session are displayed in a grid
- One-click starring mechanism (touch or keyboard shortcut)
- Clear visual indication of starred vs. unstarred photos
- Ability to change starring decisions during review

**Priority**: P0 (Critical)

#### F4: Smart File Organization
**User Story**: As a studio customer, I want my favorite photos automatically organized into clean folders so that I can easily find and use them later.

**Acceptance Criteria**:
- Starred photos automatically copied to "Selected" subdirectory
- Each pose session creates its own organized subfolder
- Original photos remain in main directory
- Folder names include pose type and timestamp
- No duplicate file management issues

**Priority**: P0 (Critical)

#### F5: Session Progress Tracking
**User Story**: As a studio customer, I want to see my progress through the photo session so that I can manage my time effectively.

**Acceptance Criteria**:
- Clear display of current session number and photo count
- Visual progress bar for current 9-photo session
- Total session time tracking
- Summary view of completed sessions
- Option to end session early if satisfied

**Priority**: P1 (High)

### 5.2 Advanced Features (Post-MVP)

#### F6: Multi-User Sessions
- Support for multiple people in group photo sessions
- Individual starring for each participant
- Collaborative pose selection

#### F7: Studio Analytics Dashboard
- Usage statistics for studio owners
- Popular pose insights
- Customer session patterns
- Performance metrics

#### F8: Custom Pose Upload
- Studio owners can add custom poses to library
- Branded pose suggestions
- Regional/cultural pose preferences

#### F9: Photo Enhancement Integration
- Basic filter/adjustment options
- Integration with popular photo editing tools
- Batch processing for starred photos

#### F10: Mobile Companion App
- Remote camera trigger via smartphone
- Photo preview on mobile device
- Social sharing integration

## 6. Non-Functional Requirements

**Performance Requirements**:
- Photo display latency < 2 seconds after capture
- File operations complete within 1 second
- Application startup time < 5 seconds
- Smooth 60fps interface interactions

**Security Requirements**:
- Local file system access only (no cloud storage of customer photos)
- Session data cleared after customer checkout
- No personal data collection or transmission
- Secure file handling to prevent corruption

**Scalability Requirements**:
- Support concurrent sessions (multiple studio setups)
- Handle 1000+ photos per day per studio
- Database-free architecture for simple deployment
- Horizontal scaling through multiple installations

**Accessibility Requirements**:
- Touch-friendly interface for tablet/touch screen setups
- High contrast mode for various lighting conditions
- Large, clear typography for easy reading
- Keyboard shortcuts for power users

**Browser/Device Compatibility**:
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Touch screen support for tablet interfaces
- Windows 10/11 and macOS compatibility
- Responsive design for various screen sizes

## 7. Technical Constraints & Assumptions

**Technology Stack Decisions**:
- **Frontend**: Next.js 14+ with App Router for modern React experience
- **Backend**: Next.js API routes for file system operations
- **UI Framework**: Tailwind CSS for rapid styling
- **State Management**: React Context/useState for session state
- **File System**: Node.js fs module for photo monitoring and organization

**Third-party Integrations**:
- File system watcher libraries for real-time photo detection
- Image optimization libraries for fast display
- Cross-platform desktop app framework (Electron if needed)

**Data Requirements**:
- Local JSON files for pose library and session configuration
- No database required - file-based storage
- Session state stored in memory/local storage
- Photo metadata extracted from EXIF data

**API Dependencies**:
- File System API for photo monitoring
- Local storage APIs for session persistence
- Hardware camera integration (indirect through file system)

**Infrastructure Considerations**:
- Single-machine deployment per studio
- No server/cloud infrastructure required
- Local network only - no internet dependency
- Simple installation package for studio owners

## 8. User Experience Requirements

### Key User Flows

#### Flow 1: Starting a New Photo Session
1. Launch SnapStudio application
2. View pose library with visual examples
3. Select desired pose type
4. See session setup screen with progress indicators
5. Begin taking photos with chosen pose guidance

#### Flow 2: Photo Review and Starring
1. Complete 9 photos in current pose session
2. View photo grid with all 9 recent photos
3. Click/tap to star favorite photos
4. Confirm selections and proceed
5. Choose to start new pose session or finish

#### Flow 3: Session Completion and File Access
1. Review all starred photos from all sessions
2. Confirm final selections
3. Access organized photo folders
4. Exit application with clean session reset

### Design Principles
- **Simplicity First**: Minimize cognitive load with clear, single-purpose screens
- **Immediate Feedback**: Instant visual confirmation of all user actions
- **Progress Visibility**: Always show where user is in the session process
- **Touch-Optimized**: Large touch targets for tablet/touch screen use
- **Forgiving Interface**: Easy to undo/change decisions

### Responsive Design Requirements
- Primary: Large tablet interface (12"+ screens)
- Secondary: Desktop computer displays (21"+ monitors)
- Tertiary: Smaller tablet support (10" screens)
- Touch-first design with mouse/keyboard support

### Accessibility Standards
- WCAG 2.1 AA compliance for color contrast
- Keyboard navigation for all interactive elements
- Screen reader compatibility for visually impaired users
- Clear focus indicators for interactive elements

## 9. Success Metrics & Analytics

### Key Performance Indicators (KPIs)

**User Engagement Metrics**:
- Average photos starred per session (target: 15-25)
- Session completion rate (target: 85%+)
- Average session duration (target: 8-12 minutes)
- Pose variety per session (target: 3+ different poses)

**User Experience Metrics**:
- Time to first starred photo (target: < 30 seconds)
- Photo review completion rate (target: 90%+)
- User return rate within 30 days (target: 40%+)
- Customer satisfaction score (target: 4.5/5)

**Technical Performance Metrics**:
- Photo display latency (target: < 2 seconds)
- File organization success rate (target: 99.9%+)
- Application crash rate (target: < 0.1%)
- Startup time (target: < 5 seconds)

**Business Metrics**:
- Studio adoption rate (target: 300+ studios in 12 months)
- Monthly recurring revenue per studio (target: $50-100)
- Customer support ticket reduction (target: 60%+)
- Studio customer satisfaction improvement (target: 25%+)

## 10. Timeline & Milestones

### Phase 1: Foundation (Month 1-2)
**Milestone 1.1**: Development Environment Setup
- Next.js application scaffolding
- File system monitoring implementation
- Basic UI framework setup

**Milestone 1.2**: Core Photo Flow
- Photo display functionality
- Basic starring mechanism
- Session state management

### Phase 2: MVP Features (Month 2-3)
**Milestone 2.1**: Pose Library Integration
- Pose selection interface
- 20+ initial pose library
- Session structure implementation

**Milestone 2.2**: File Organization System
- Automatic folder creation
- Photo copying mechanism
- File naming conventions

### Phase 3: User Experience Polish (Month 3-4)
**Milestone 3.1**: UI/UX Refinement
- Touch-optimized interface
- Progress indicators
- Error handling and edge cases

**Milestone 3.2**: Testing and Optimization
- Performance optimization
- Cross-platform testing
- User acceptance testing

### Phase 4: Deployment and Launch (Month 4)
**Milestone 4.1**: Studio Integration
- Installation packages
- Documentation and training materials
- Initial studio partnerships

**Dependencies and Risks**:
- **Risk**: File system permissions vary across studio setups
- **Mitigation**: Comprehensive testing on various Windows/Mac configurations
- **Risk**: Camera software compatibility issues
- **Mitigation**: Focus on file-based integration rather than direct camera control

## 11. Out of Scope

### What We Won't Build in v1
- **Direct Camera Control**: No integration with specific camera models or software
- **Cloud Storage**: All data remains local to studio computers
- **Advanced Photo Editing**: No filters, adjustments, or editing capabilities
- **User Accounts**: No login system or user profiles
- **Payment Processing**: No integrated billing or subscription management
- **Mobile App**: No smartphone application (desktop/web only)
- **Multi-Studio Management**: No centralized management across multiple locations

### Future Considerations
- Integration with popular photo editing software
- Cloud backup options for studio owners
- Advanced analytics and reporting dashboard
- Franchise/chain management features
- International localization (Japanese, Chinese markets)

### Explicitly Excluded Features
- Social media integration or sharing
- Facial recognition or AI-based photo analysis
- Real-time photo enhancement or filters
- Customer personal data collection
- Internet connectivity requirements
- Subscription or recurring payment models within the app

---

**Document Approval**:
- [ ] Product Owner Review
- [ ] Technical Lead Review  
- [ ] UX/UI Design Review
- [ ] Stakeholder Sign-off

**Next Steps**: Proceed to Step 3 (Architecture Design) upon PRD approval.