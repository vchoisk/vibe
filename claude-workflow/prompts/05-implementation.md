# Step 5: Implementation Guidance Prompt

## Context
You are now implementing the development plan from Step 4. This prompt will guide the actual coding phase, following the server-first then client approach.

## Input Required
- Development plan from Step 4
- Architecture design from Step 3
- Current task from the development plan
- Existing codebase state

## Implementation Approach

### Server-First Implementation Strategy
1. **Foundation First**: Set up monorepo, shared packages, and infrastructure
2. **Backend Core**: Database, authentication, and core API endpoints
3. **Frontend Integration**: Build UI that consumes the backend APIs
4. **Polish & Optimization**: Testing, performance, and deployment

## Implementation Prompts by Phase

### Phase 1: Foundation Setup
```
I'm implementing [SPECIFIC TASK] from the development plan. 

Current Context:
- Task: [Task name and description]
- Dependencies: [What's already completed]
- Goal: [What should be achieved]

Please help me:
1. Set up the required files and folder structure
2. Install necessary dependencies
3. Configure tooling and scripts
4. Implement the core functionality
5. Test that everything works correctly

Technical Requirements:
- Follow the architecture design from Step 3
- Use the monorepo structure defined in the plan
- Implement proper TypeScript types
- Add appropriate error handling
- Include basic tests where applicable

Deliverable: Working implementation that passes the acceptance criteria from the development plan.
```

### Phase 2: Backend Implementation
```
I'm implementing [SPECIFIC API FEATURE] for the backend.

Current Context:
- Feature: [Feature name from PRD]
- API Endpoints: [List endpoints to implement]
- Database Requirements: [Schema/models needed]
- Authentication: [Auth requirements]

Please help me:
1. Create database schemas/models
2. Implement API endpoints with proper validation
3. Add authentication/authorization
4. Include error handling and logging
5. Write API tests
6. Update API documentation

Technical Requirements:
- Follow RESTful principles (or GraphQL/tRPC as defined)
- Implement proper input validation
- Add appropriate middleware
- Use shared types from packages/types
- Include proper error responses
- Add rate limiting where needed

Deliverable: Fully functional API endpoints that meet the requirements from the PRD.
```

### Phase 3: Frontend Implementation
```
I'm implementing [SPECIFIC UI FEATURE] for the frontend.

Current Context:
- Feature: [Feature name from PRD]
- Pages/Components: [What UI needs to be built]
- API Integration: [Which endpoints to consume]
- User Flow: [Key user interactions]

Please help me:
1. Create the required pages and components
2. Implement state management
3. Add API integration with proper error handling
4. Style components according to design system
5. Add loading states and error boundaries
6. Implement responsive design
7. Add client-side validation

Technical Requirements:
- Use Next.js App Router
- Follow component architecture from design
- Implement proper TypeScript types
- Add proper error handling and loading states
- Use shared UI components where possible
- Ensure accessibility standards
- Optimize for performance

Deliverable: Complete UI implementation that provides excellent user experience.
```

### Integration Testing Prompt
```
I need to test the integration between [FRONTEND FEATURE] and [BACKEND API].

Current Context:
- Frontend implementation: [What's been built]
- Backend API: [Available endpoints]
- Expected behavior: [What should happen]

Please help me:
1. Test all user flows end-to-end
2. Verify error handling works correctly
3. Test edge cases and boundary conditions
4. Ensure proper loading states
5. Validate data consistency
6. Test authentication flows
7. Verify performance is acceptable

Create test cases that cover:
- Happy path scenarios
- Error scenarios
- Edge cases
- Performance requirements
- Security requirements

Deliverable: Comprehensive testing that ensures feature works reliably.
```

## Implementation Best Practices

### Code Quality Standards
- Use TypeScript strictly
- Follow consistent naming conventions
- Add proper JSDoc comments for functions
- Implement proper error handling
- Use shared types and utilities
- Follow the established patterns

### Development Workflow
1. **Understand the Task**: Review requirements and acceptance criteria
2. **Plan the Implementation**: Break down into smaller steps
3. **Write Code**: Implement following best practices
4. **Test Locally**: Verify functionality works
5. **Review**: Check code quality and standards
6. **Document**: Update relevant documentation

### Task Completion Checklist
For each implementation task:
- [ ] Code implements all requirements
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Basic tests are added
- [ ] Code follows project conventions
- [ ] Documentation is updated
- [ ] Task acceptance criteria are met

## Troubleshooting Guide

### Common Issues & Solutions
- **Type Errors**: Check shared types in packages/types
- **API Integration**: Verify endpoint URLs and request format
- **Authentication**: Check auth middleware and token handling
- **Database**: Verify schema matches code expectations
- **Build Errors**: Check dependencies and imports

### When to Ask for Help
- Unclear requirements or acceptance criteria
- Technical blockers that prevent progress
- Architecture decisions not covered in design
- Performance or security concerns
- Complex integration challenges

## Progress Tracking
After completing each task:
1. Mark task as complete in development plan
2. Document any deviations from original plan
3. Note any new requirements discovered
4. Update architecture if significant changes needed
5. Plan next task based on dependencies

## Deliverable per Task
Each implementation session should result in:
- Working code that meets acceptance criteria
- Updated tests (where applicable)
- Documentation updates
- Progress update on development plan
- Identification of next priority task