# Step 3: User Scenarios & Workflow Design

## Context
You are creating detailed user scenarios and workflow designs for the project defined in the PRD from Step 2. This step bridges the gap between product requirements and technical architecture by defining exactly how users will interact with the system.

## Input Required
- Complete PRD from Step 2
- Target user personas and pain points
- Core features and user stories

## Your Task
Create comprehensive user scenarios that detail the complete user experience, including workflow diagrams, interaction patterns, and edge cases.

## User Scenarios Structure

### 1. Primary User Scenarios
For each major user persona, create detailed scenarios covering:

#### Scenario Template
**Scenario Name**: [Descriptive title]
**User Persona**: [Which persona this applies to]
**Context**: [When/why this scenario occurs]
**Preconditions**: [What must be true before this scenario]
**Success Criteria**: [How we know the scenario succeeded]

**Workflow Steps**:
1. **Step 1**: [User action] → [System response] → [User sees/feels]
2. **Step 2**: [User action] → [System response] → [User sees/feels]
3. [Continue for complete workflow]

**Alternative Flows**:
- **Alt 1**: [What happens if user does X instead]
- **Alt 2**: [What happens if system fails at step Y]

**Edge Cases**:
- [Unusual but possible situations]
- [Error conditions and recovery]

### 2. User Journey Mapping
Map the complete user experience from discovery to completion:

#### Journey Phases
- **Discovery**: How users find/access the system
- **Onboarding**: First-time user experience
- **Core Usage**: Primary workflow execution
- **Completion**: How users finish their tasks
- **Follow-up**: Post-completion experience

#### For Each Phase Include
- **User Goals**: What the user wants to achieve
- **User Actions**: Specific actions they take
- **Touchpoints**: System interfaces they interact with
- **Emotions**: How the user feels at each step
- **Pain Points**: Potential frustrations or obstacles
- **Opportunities**: Ways to improve the experience

### 3. Detailed Workflow Diagrams
Create step-by-step workflow descriptions (text-based diagrams):

#### Primary Workflows
- End-to-end happy path scenarios
- Decision points and branching logic
- System state changes
- Data flow between steps

#### Error Handling Workflows
- What happens when things go wrong
- Recovery mechanisms
- User feedback and guidance
- Graceful degradation

### 4. Interaction Patterns
Define consistent interaction patterns across the system:

#### UI Interaction Patterns
- Navigation patterns
- Input methods (touch, keyboard, mouse)
- Feedback mechanisms
- Loading and waiting states
- Error presentation

#### Data Interaction Patterns
- How users input data
- How data is validated
- How results are presented
- How users can modify/correct data

### 5. Accessibility & Usability Scenarios
Consider users with different needs and contexts:

#### Accessibility Scenarios
- Users with visual impairments
- Users with motor difficulties
- Users with cognitive differences
- Users in challenging environments

#### Device & Context Scenarios
- Different screen sizes
- Various input methods
- Poor lighting conditions
- Time pressure situations

### 6. Business Logic Scenarios
Detail how business rules are implemented in user-facing workflows:

#### Business Rules
- Validation rules and constraints
- Workflow approval processes
- Data consistency requirements
- Security and privacy rules

#### Integration Scenarios
- How external systems affect user workflows
- Data synchronization patterns
- Offline/online behavior differences

## Scenario Documentation Requirements

### Scenario Detail Level
- **High-Level**: Overall user journey and goals
- **Medium-Level**: Screen-by-screen interactions
- **Low-Level**: Individual UI element behaviors

### Include for Each Scenario
- **Frequency**: How often this scenario occurs
- **Importance**: Critical vs. nice-to-have workflows
- **Complexity**: Simple vs. complex user interactions
- **Risk Level**: What happens if this fails

### Cross-Reference with PRD
- Map scenarios to functional requirements
- Validate scenarios meet user stories
- Ensure all personas are covered
- Confirm edge cases are addressed

## Validation Criteria

### Completeness Check
- [ ] All primary user personas have scenarios
- [ ] All core features have usage scenarios
- [ ] Error conditions and edge cases covered
- [ ] Accessibility requirements addressed

### User Experience Validation
- [ ] Workflows feel natural and intuitive
- [ ] Cognitive load is appropriate for users
- [ ] Time to completion is reasonable
- [ ] User feedback and guidance is sufficient

### Technical Feasibility
- [ ] Scenarios are technically implementable
- [ ] Performance requirements are realistic
- [ ] Integration points are clearly defined
- [ ] Data requirements are specified

## Output Format

Save all scenarios to: `claude-workflow/outputs/[project-name]/03-user-scenarios.md`

**File Structure**:
1. **Executive Summary** - Key scenarios and user flows
2. **Primary User Scenarios** - Detailed scenario descriptions
3. **User Journey Maps** - Complete experience mapping
4. **Workflow Diagrams** - Step-by-step process flows
5. **Interaction Patterns** - Consistent UI/UX patterns
6. **Edge Cases & Error Handling** - Exception scenarios
7. **Validation Summary** - Completeness and feasibility check

## Deliverable
A comprehensive user scenario document that provides clear guidance for technical architecture design and serves as a reference for user experience validation throughout development.