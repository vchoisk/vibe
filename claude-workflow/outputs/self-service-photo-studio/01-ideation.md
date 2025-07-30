# Ideation Session: Self-Service Photo Studio Software
**Date**: 2025-07-23  
**Topic**: Software for self-service photo studios in Korea (Type 3 - rent studio with camera/PC setup)

## Final Selection

**Selected Project**: **SnapStudio** - Structured Photo Session Assistant

### 1. Project Name & Tagline
**SnapStudio** - "Turn photo chaos into organized sessions"

### 2. Problem Statement
Self-service photo studio users face two major problems: (1) they take 100+ photos in short sessions but struggle to identify their favorites, and (2) they run out of pose ideas mid-session, leading to repetitive or awkward shots.

### 3. Target Audience
**Primary**: Individual customers using self-service photo studios in Korea (Type 3 studios)
**Secondary**: Studio owners who want to improve customer experience and reduce post-session support

### 4. Core Features
- **Pose Session Structure**: Break photo sessions into 9-photo sets, each focused on a specific pose/theme
- **Pose Library**: Curated pose suggestions with visual examples to inspire users
- **Real-Time Photo Starring**: Users review and star favorite photos after each 9-photo session
- **Smart File Organization**: Starred photos automatically copied to organized subdirectories
- **Session Progress Tracking**: Clear indicators of progress through each pose session

### 5. Technical Highlights
- **File System Integration**: Monitor camera output folder and organize photos automatically
- **Real-Time Photo Display**: Show recently captured photos for immediate review
- **Batch Processing**: Handle photo copying and folder organization seamlessly
- **Session State Management**: Track multiple pose sessions and user selections
- **Touch-Friendly Interface**: Optimized for tablet/touch screen setups common in studios

### 6. Value Proposition
**For Users**: Transform overwhelming photo sessions into structured, manageable experiences with better pose variety and easier photo selection
**For Studios**: Reduce customer confusion, improve satisfaction, and differentiate their service offering
**Monetization**: B2B SaaS model - licensing to studio owners, potential per-session pricing

### 7. Implementation Complexity
**Rating**: 3/5 (Medium)
- **Development Time**: 2-3 months for MVP
- **Technical Challenges**: File system monitoring, real-time photo display, cross-platform compatibility
- **Required Expertise**: Next.js full-stack development, file system APIs, potentially desktop app integration
- **External Dependencies**: Camera/photo software integration, file system permissions

### 8. Why This Project
- **Real Problem**: Addresses genuine pain points observed in Korean self-service photo studios
- **Clear Value**: Immediate user experience improvement with measurable benefits
- **Technical Interest**: Combines file system management, real-time interfaces, and user experience design
- **Market Fit**: Specific niche with clear target customers and business model
- **Scalable**: Can expand to other markets and studio types
- **Feasible Scope**: Achievable within reasonable development timeline

---

## Initial Suggestions

### 1. **StudioFlow** - Complete Self-Service Photo Studio Management
**Core Problem**: Lack of integrated software for booking, camera control, editing, delivery  
**Key Appeal**: Streamlines entire customer journey + studio owner management  
**Technical Hook**: Real-time camera control, AI editing, integrated payment/delivery  
**Quick Complexity**: Medium-High

### 2. **SnapStudio** - Smart Photo Session Assistant  
**Core Problem**: Customers waste time on camera settings, lighting, poses  
**Key Appeal**: Digital photography assistant with real-time guidance  
**Technical Hook**: Computer vision for poses, automated settings, AI quality scoring  
**Quick Complexity**: High

### 3. **PhotoRent** - Streamlined Studio Booking & Session Platform
**Core Problem**: Outdated booking, no studio previews, fragmented session management  
**Key Appeal**: Modern booking with virtual tours, seamless session management  
**Technical Hook**: 3D studio visualization, real-time monitoring, automated processing  
**Quick Complexity**: Medium

## Discussion Log

**User Feedback**: Interested in SnapStudio concept, focusing on:
1. Smart photo selection (but NOT using AI)
2. Real-time photo starring system - users star photos they like immediately
3. Show recent photo(s) on screen and nudge users to select favorites
4. Every photo or every 9th photo review frequency
5. REMOVED: Signature Studio Style (out of scope)

**Refined Concept - SnapStudio**: Real-Time Photo Review & Starring
- **Core Problem**: Users take 100+ photos in 10 minutes but struggle to select best ones
- **Solution**: Immediate photo review with starring system during the session
- **Key Flow**: Photo taken → Display on screen → User stars favorites → End with curated selection

**Additional Feedback**: 
- Every 9th photo review (less disruptive)
- Added pose suggestion system - structured 9-photo sessions per pose
- File organization system - starred photos copied to organized subdirectories
- Solves both photo selection overwhelm AND pose inspiration problems

**Status**: Finalized and ready for Step 2