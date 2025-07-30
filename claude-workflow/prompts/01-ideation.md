# Step 1: Interactive Project Ideation

## Context
You are collaborating on ideation for a new Next.js project that will be built as part of a Turborepo monorepo. This is an **interactive process** where we'll discuss and refine ideas together through multiple rounds of suggestions and feedback.

## Interactive Process Overview
This step involves collaborative discussion where:
1. **Claude makes initial suggestions** based on the topic/theme provided
2. **Human provides feedback** - what they like, don't like, want to explore further
3. **Together we iterate** on ideas, combining the best elements
4. **We select and refine** the most promising concept

## Technical Requirements (All Ideas Must Meet)
- Built with Next.js 14+ (App Router)
- Full-stack application (frontend + backend/API)
- Suitable for a Turborepo monorepo structure
- Can be implemented within reasonable scope

## Innovation Criteria (Goals to Aim For)
- Solves a real problem or addresses a genuine need
- Has potential for user engagement
- Incorporates modern web technologies
- Scalable and extensible architecture

## Interactive Discussion Format

### Initial Suggestion Phase
**Claude's Role**: Present 2-3 initial project concepts based on the topic/theme, each with:
- **Project Name**: Clear, memorable name
- **Core Problem**: What problem does this solve?
- **Key Appeal**: Why this could be interesting/valuable
- **Technical Hook**: What makes it technically engaging
- **Quick Complexity**: Rough estimate (Simple/Medium/Complex)

### Discussion Phase
**Human's Role**: Respond with feedback such as:
- Which concepts are most interesting?
- What aspects appeal to you most?
- What concerns or questions do you have?
- Any specific features or directions you want to explore?
- Any concepts you want to combine or modify?

### Refinement Phase
**Collaborative**: Based on feedback, we'll:
- Develop the most promising concept further
- Address concerns and questions
- Combine good elements from different ideas
- Refine the scope and approach

## Final Development Template
Once we agree on a concept, we'll develop it with:

### 1. Project Name & Tagline
Final name and one-line description

### 2. Problem Statement
Clear articulation of what problem this solves

### 3. Target Audience
Primary and secondary user groups

### 4. Core Features (3-5 key features)
- Feature 1: Description and user value
- Feature 2: Description and user value
- etc.

### 5. Technical Highlights
- Key technologies/APIs to be used
- Interesting technical challenges
- Integration opportunities

### 6. Value Proposition
How this creates value for users (and potential monetization)

### 7. Implementation Complexity
Rate 1-5 with detailed justification including:
- Development time estimate
- Technical challenges
- Required expertise
- External dependencies

### 8. Why This Project
Reasoning for why this is the right choice

## Getting Started
**To begin**: Provide a topic, theme, or area of interest, and Claude will make initial suggestions to start our collaborative ideation process.

**Example starter**: "I'm interested in [politics/healthcare/education/entertainment/productivity/etc.]"

## Output File Structure
Save all ideation sessions to: `claude-workflow/outputs/[project-name]/01-ideation.md`

**File Structure**:
1. **Final Selection** (at top) - Selected concept with full development template
2. **Initial Suggestions** - Original concepts presented
3. **Discussion Log** - Conversation and feedback process
4. **Status** - Current state and next steps