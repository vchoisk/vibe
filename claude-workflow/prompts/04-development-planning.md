# Step 4: Development Planning & Task Breakdown Prompt

## Context
You are breaking down the architecture design from Step 3 into a concrete, sequential development plan. This plan will guide the implementation phase with clear, actionable tasks.

## Input Required
- Complete architecture design from Step 3
- PRD from Step 2 for feature prioritization
- Any timeline constraints or preferences

## Your Task
Create a detailed development plan that breaks down the architecture into implementable tasks, organized by development phases.

## Development Planning Structure

### 1. Development Strategy
- Overall approach (server-first, then client)
- Phase breakdown rationale
- Dependencies and prerequisites
- Risk mitigation strategies

### 2. Environment Setup Phase
#### 2.1 Monorepo Setup
- [ ] Initialize Turborepo configuration
- [ ] Set up workspace structure (apps/, packages/)
- [ ] Configure shared tooling (ESLint, Prettier, TypeScript)
- [ ] Set up development scripts

#### 2.2 Development Infrastructure
- [ ] Set up local development environment
- [ ] Configure database (local + development)
- [ ] Set up environment variables structure
- [ ] Configure CI/CD pipeline basics

### 3. Shared Packages Phase
#### 3.1 Core Packages
- [ ] Create `packages/types` - shared TypeScript definitions
- [ ] Create `packages/config` - shared configuration
- [ ] Create `packages/database` - database schemas and utilities
- [ ] Create `packages/auth` - authentication utilities

#### 3.2 UI Package (if applicable)
- [ ] Set up UI package structure
- [ ] Create design system foundations
- [ ] Build core UI components
- [ ] Set up Storybook (if needed)

### 4. Backend/API Development Phase
#### 4.1 Database Setup
- [ ] Set up database schema
- [ ] Create migration system
- [ ] Seed development data
- [ ] Set up database connection utilities

#### 4.2 Authentication System
- [ ] Implement authentication strategy
- [ ] Create user registration/login
- [ ] Set up session management
- [ ] Implement authorization middleware

#### 4.3 Core API Development
For each major feature from PRD:
- [ ] Feature X API endpoints
- [ ] Feature Y API endpoints
- [ ] Feature Z API endpoints

#### 4.4 API Infrastructure
- [ ] Error handling middleware
- [ ] Input validation
- [ ] Rate limiting
- [ ] API documentation

### 5. Frontend Development Phase
#### 5.1 Next.js App Setup
- [ ] Initialize Next.js application
- [ ] Set up App Router structure
- [ ] Configure styling system
- [ ] Set up state management

#### 5.2 Authentication UI
- [ ] Login/register pages
- [ ] Protected route system
- [ ] User profile management
- [ ] Password reset flow

#### 5.3 Core Feature Implementation
For each major feature from PRD (prioritized):
- [ ] Feature X frontend implementation
- [ ] Feature Y frontend implementation
- [ ] Feature Z frontend implementation

#### 5.4 UI/UX Polish
- [ ] Responsive design implementation
- [ ] Loading states and error handling
- [ ] Accessibility improvements
- [ ] Performance optimization

### 6. Integration & Testing Phase
#### 6.1 End-to-End Integration
- [ ] Frontend-backend integration testing
- [ ] Third-party service integration
- [ ] Payment integration (if applicable)
- [ ] Email service integration

#### 6.2 Testing Implementation
- [ ] Unit tests for utilities
- [ ] API endpoint testing
- [ ] Frontend component testing
- [ ] End-to-end testing setup

### 7. Deployment & Production Phase
#### 7.1 Production Setup
- [ ] Production database setup
- [ ] Environment configuration
- [ ] Security hardening
- [ ] Performance monitoring

#### 7.2 Deployment
- [ ] CI/CD pipeline completion
- [ ] Production deployment
- [ ] Domain and SSL setup
- [ ] Monitoring and alerting

## Task Details Template
For each major task, include:
- **Task Name**: Clear, actionable title
- **Description**: What needs to be done
- **Dependencies**: What must be completed first
- **Acceptance Criteria**: How to know it's done
- **Estimated Effort**: Time estimate
- **Technical Notes**: Key implementation details

## Priority Framework
- **P0 (Critical)**: MVP functionality, blocking other work
- **P1 (High)**: Important features, user experience
- **P2 (Medium)**: Nice-to-have features
- **P3 (Low)**: Future enhancements

## Development Milestones
Define key milestones:
1. **Foundation Complete**: Monorepo setup, shared packages
2. **Backend MVP**: Core API functionality
3. **Frontend MVP**: Basic user interface
4. **Feature Complete**: All MVP features implemented
5. **Production Ready**: Testing, deployment, monitoring

## Risk Assessment
Identify potential blockers:
- Technical complexity risks
- External dependency risks
- Timeline risks
- Resource risks

## Quality Gates
Define criteria for moving between phases:
- Code review requirements
- Testing coverage thresholds
- Performance benchmarks
- Security requirements

## Deliverable
A comprehensive, sequential development plan that can be followed step-by-step, with clear tasks, dependencies, and quality criteria.