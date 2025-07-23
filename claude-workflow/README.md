# Claude AI Development Workflow

This folder contains structured prompts and outputs for a systematic approach to building Next.js projects with Claude AI in a Turborepo monorepo.

## Workflow Overview

The development process follows these 5 sequential steps:

1. **Ideation** → Generate and select project ideas
2. **PRD Creation** → Define product requirements 
3. **Architecture Design** → Plan technical implementation
4. **Development Planning** → Break down into actionable tasks
5. **Implementation** → Execute server-first, then client development

## Folder Structure

```
claude-workflow/
├── prompts/           # Template prompts for each step
│   ├── 01-ideation.md
│   ├── 02-prd.md
│   ├── 03-architecture.md
│   ├── 04-development-planning.md
│   └── 05-implementation.md
├── outputs/           # Generated documents from each step
│   ├── ideation/
│   ├── prd/
│   ├── architecture/
│   ├── planning/
│   └── implementation-logs/
└── README.md          # This file
```

## How to Use

### Step 1: Project Ideation
Use `prompts/01-ideation.md` to generate multiple project ideas and select the best one.

**Output**: Save selected idea to `outputs/ideation/selected-idea.md`

### Step 2: Create PRD
Use `prompts/02-prd.md` with your selected idea to create a comprehensive Product Requirements Document.

**Output**: Save PRD to `outputs/prd/product-requirements.md`

### Step 3: Architecture Design
Use `prompts/03-architecture.md` with your PRD to design the full-stack technical architecture.

**Output**: Save architecture to `outputs/architecture/technical-design.md`

### Step 4: Development Planning
Use `prompts/04-development-planning.md` to break down the architecture into sequential development tasks.

**Output**: Save plan to `outputs/planning/development-plan.md`

### Step 5: Implementation
Use `prompts/05-implementation.md` for each development task, following server-first then client approach.

**Output**: Log progress in `outputs/implementation-logs/`

## Development Approach

### Server-First Strategy
1. **Foundation**: Monorepo setup, shared packages
2. **Backend**: Database, authentication, APIs
3. **Frontend**: UI consuming backend APIs
4. **Polish**: Testing, optimization, deployment

### Quality Standards
- TypeScript throughout
- Proper error handling
- Testing at each phase
- Documentation updates
- Code review before moving to next step

## Tips for Success

1. **Follow the sequence** - Don't skip steps
2. **Be thorough** - Each step builds on the previous
3. **Document everything** - Save all outputs for reference
4. **Test frequently** - Validate at each phase
5. **Iterate when needed** - Refine earlier steps if requirements change

## Next Steps

1. Start with `prompts/01-ideation.md` to generate your project idea
2. Save your outputs to the appropriate folders
3. Use each output as input to the next step
4. Begin implementation following the development plan