# Step 3: Full-Stack Architecture Design Prompt

## Context
You are designing the complete technical architecture for the project defined in the PRD from Step 2. This architecture will be implemented in a Turborepo monorepo with Next.js applications.

## Input Required
- Complete PRD from Step 2
- Any specific technical constraints or preferences

## Your Task
Design a comprehensive full-stack architecture that addresses all requirements from the PRD.

## Architecture Design Structure

### 1. High-Level System Architecture
- System overview diagram (describe in text)
- Key components and their relationships
- Data flow between components
- External service integrations

### 2. Monorepo Structure
```
apps/
  ├── web/                  # Main Next.js application
  ├── admin/               # Admin dashboard (if needed)
  └── api/                 # Standalone API (if needed)
packages/
  ├── ui/                  # Shared UI components
  ├── database/            # Database schemas and utilities
  ├── auth/               # Authentication utilities
  ├── config/             # Shared configuration
  └── types/              # Shared TypeScript types
```

### 3. Frontend Architecture

#### 3.1 Next.js Application Structure
- App Router structure
- Page organization
- Component architecture
- State management approach
- Styling strategy

#### 3.2 Key Frontend Technologies
- UI framework/library choices
- State management (if complex)
- Form handling
- Client-side routing
- Performance optimization strategies

### 4. Backend Architecture

#### 4.1 API Design
- API structure (REST/GraphQL/tRPC)
- Endpoint organization
- Authentication/authorization strategy
- Rate limiting and security

#### 4.2 Database Design
- Database choice and rationale
- Schema design
- Relationships and indexes
- Migration strategy
- Backup and recovery

#### 4.3 Server Architecture
- Deployment strategy
- Environment configuration
- Logging and monitoring
- Error handling

### 5. Authentication & Authorization
- Authentication method (NextAuth.js, Auth0, custom)
- User roles and permissions
- Session management
- Security considerations

### 6. Data Architecture
- Data modeling
- API data contracts
- Caching strategy
- Real-time data (if needed)

### 7. Third-Party Integrations
- External APIs and services
- Payment processing (if applicable)
- File storage/CDN
- Email services
- Analytics

### 8. Development & DevOps
- Development workflow
- Testing strategy (unit, integration, e2e)
- CI/CD pipeline
- Deployment environments
- Monitoring and observability

### 9. Performance & Scalability
- Performance optimization strategies
- Caching layers
- Database optimization
- CDN strategy
- Scalability considerations

### 10. Security Architecture
- Data protection
- Input validation
- HTTPS/SSL
- CORS configuration
- Security headers
- Vulnerability management

### 11. Package Dependencies
List key packages for each workspace:
- Frontend dependencies
- Backend dependencies
- Shared dependencies
- Development dependencies

### 12. Configuration Management
- Environment variables
- Feature flags
- Configuration files
- Secrets management

## Technical Decisions & Rationale
For each major technology choice, provide:
- What was chosen
- Why it was chosen
- Alternatives considered
- Trade-offs

## Implementation Considerations
- Development complexity assessment
- Potential technical risks
- Performance bottlenecks
- Scalability limitations
- Maintenance considerations

## Deliverable
A complete technical architecture document that can guide the development planning phase, including specific technology choices, package structure, and implementation approach.