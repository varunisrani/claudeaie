# KIRO COMPLETE WORKFLOW - SYSTEMATIC SOFTWARE DEVELOPMENT

## MISSION
Execute a complete 6-step software development workflow from requirements analysis to full implementation. Generate structured documentation at each step and produce working code.

## PROJECT CONTEXT
- **Project Description**: Provided in the main prompt
- **Spec Name**: Auto-generated from project description
- **Working Directory**: Current directory where files will be created

## MANDATORY FIRST ACTION - TodoWrite

Create a todo list to track the entire workflow:

```json
{
  "todos": [
    {"content": "Create todo list for Kiro workflow", "status": "pending", "activeForm": "Creating todo list"},
    {"content": "Execute Prime - Project Analysis", "status": "pending", "activeForm": "Executing Prime"},
    {"content": "Execute Spec Init - Initialize Specification", "status": "pending", "activeForm": "Initializing Specification"},
    {"content": "Execute Spec Requirements - Gather Requirements", "status": "pending", "activeForm": "Gathering Requirements"},
    {"content": "Execute Spec Design - Create Design Docs", "status": "pending", "activeForm": "Creating Design"},
    {"content": "Execute Spec Tasks - Break Down Tasks", "status": "pending", "activeForm": "Breaking Down Tasks"},
    {"content": "Execute Spec Implementation - Generate Code", "status": "pending", "activeForm": "Generating Code"},
    {"content": "Verify all documentation created", "status": "pending", "activeForm": "Verifying Documentation"},
    {"content": "Verify implementation complete", "status": "pending", "activeForm": "Verifying Implementation"},
    {"content": "Complete workflow", "status": "pending", "activeForm": "Completing"}
  ]
}
```

## WORKFLOW EXECUTION SEQUENCE

Execute these 6 steps in order. DO NOT skip any step. Mark each todo as completed before moving to the next.

---

### STEP 1: PRIME - PROJECT ANALYSIS

**Purpose**: Comprehensively analyze the project to understand scope, requirements, and context.

**Actions**:
1. **Analyze Project Description**
   - Parse the user's project description
   - Identify key objectives and goals
   - Determine project type (web app, CLI tool, API, library, etc.)
   - Identify primary technologies mentioned or implied

2. **Understand Scope**
   - Determine what's included in the project
   - Identify what's explicitly out of scope
   - Note any constraints or requirements

3. **Identify Stakeholders & Use Cases**
   - Who will use this software?
   - What are the primary use cases?
   - What problems does it solve?

4. **Technical Context**
   - What programming language(s) are appropriate?
   - What frameworks or libraries are needed?
   - What infrastructure or deployment considerations exist?

5. **Risk Assessment**
   - What are potential technical challenges?
   - What dependencies or integrations are required?
   - What areas need special attention?

**Output**: Create a file `docs/prime-analysis.md` with:
```markdown
# Project Analysis (Prime)

## Project Overview
[Description of the project]

## Objectives
- [Key objective 1]
- [Key objective 2]
...

## Project Type
[Type: web app, CLI, API, etc.]

## Technologies
- [Technology 1]
- [Technology 2]
...

## Scope
### In Scope
- [Item 1]
- [Item 2]
...

### Out of Scope
- [Item 1]
- [Item 2]
...

## Stakeholders & Users
[Who will use this and how]

## Use Cases
1. [Use case 1]
2. [Use case 2]
...

## Technical Context
[Framework, language, deployment considerations]

## Risks & Challenges
- [Risk 1 and mitigation]
- [Risk 2 and mitigation]
...
```

**Mark todo as completed** before proceeding.

---

### STEP 2: SPEC INIT - INITIALIZE SPECIFICATION

**Purpose**: Create the specification structure and project foundation.

**Actions**:
1. **Generate Spec Name**
   - Extract 2-3 key words from project description
   - Create kebab-case name (e.g., "todo-app", "rest-api-blog")
   - Must be unique and descriptive

2. **Create Spec Directory Structure**
   ```
   specs/[spec-name]/
   ├── spec.md (main specification)
   ├── requirements.md (detailed requirements)
   ├── design.md (design documentation)
   └── tasks.md (implementation tasks)
   ```

3. **Initialize Main Spec File**
   - Create `specs/[spec-name]/spec.md`
   - Include metadata (name, version, created date)
   - Add placeholder sections

**Output**: Create `specs/[spec-name]/spec.md`:
```markdown
# Specification: [Project Name]

**Spec Name**: [spec-name]
**Version**: 1.0.0
**Created**: [Current Date]
**Status**: In Development

## Overview
[Brief description from project analysis]

## Document Structure
This specification consists of:
- **requirements.md**: Detailed functional and non-functional requirements
- **design.md**: Architecture, design patterns, and technical decisions
- **tasks.md**: Implementation task breakdown

## Quick Reference
- **Primary Language**: [Language]
- **Framework**: [Framework if applicable]
- **Target Users**: [User types]

---

*This specification will be completed through the Kiro workflow process.*
```

**Mark todo as completed** before proceeding.

---

### STEP 3: SPEC REQUIREMENTS - GATHER REQUIREMENTS

**Purpose**: Document detailed functional and non-functional requirements.

**Actions**:
1. **Identify Functional Requirements**
   - Core features the software must provide
   - User interactions and workflows
   - Data inputs and outputs
   - Business logic and rules

2. **Identify Non-Functional Requirements**
   - Performance requirements
   - Security considerations
   - Scalability needs
   - Maintainability standards
   - Testing requirements

3. **Define Acceptance Criteria**
   - How will we know each requirement is met?
   - What are the success metrics?

4. **Prioritize Requirements**
   - Must-have (critical)
   - Should-have (important)
   - Could-have (nice to have)

**Output**: Create `specs/[spec-name]/requirements.md`:
```markdown
# Requirements: [Project Name]

## Functional Requirements

### FR-1: [Requirement Title]
**Priority**: Must-have | Should-have | Could-have
**Description**: [What the system must do]
**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### FR-2: [Requirement Title]
...

## Non-Functional Requirements

### NFR-1: Performance
**Description**: [Performance requirements]
**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### NFR-2: Security
**Description**: [Security requirements]
**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### NFR-3: Maintainability
**Description**: [Code quality, testing, documentation standards]

### NFR-4: Scalability
**Description**: [How system handles growth]

## User Stories

### US-1: [User Story Title]
**As a** [type of user]
**I want** [goal]
**So that** [benefit]

**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### US-2: [User Story Title]
...

## Constraints
- [Constraint 1]
- [Constraint 2]

## Dependencies
- [External dependency 1]
- [External dependency 2]
```

**Mark todo as completed** before proceeding.

---

### STEP 4: SPEC DESIGN - CREATE DESIGN DOCUMENTATION

**Purpose**: Document architecture, design decisions, and technical approach.

**Actions**:
1. **Define Architecture**
   - High-level system architecture
   - Component breakdown
   - Data flow diagrams (described in text)
   - Integration points

2. **Design Patterns**
   - Which design patterns will be used?
   - Why these patterns?
   - How do they solve our problems?

3. **Data Models**
   - Database schema (if applicable)
   - Data structures
   - Data relationships

4. **API Design** (if applicable)
   - Endpoints
   - Request/response formats
   - Authentication/authorization

5. **UI/UX Design** (if applicable)
   - User interface structure
   - User flows
   - Key screens/components

6. **Technology Stack**
   - Languages and versions
   - Frameworks and libraries
   - Tools and infrastructure

**Output**: Create `specs/[spec-name]/design.md`:
```markdown
# Design: [Project Name]

## Architecture Overview

### System Architecture
[Describe the overall architecture - monolith, microservices, client-server, etc.]

### Component Diagram
```
[Text-based component diagram]
Component A --> Component B
Component B --> Database
...
```

### Data Flow
1. [Step 1 of data flow]
2. [Step 2 of data flow]
...

## Technology Stack

### Core Technologies
- **Language**: [Language + Version]
- **Framework**: [Framework + Version]
- **Database**: [Database type if applicable]
- **Other**: [Additional technologies]

### Dependencies
- [Dependency 1]: [Purpose]
- [Dependency 2]: [Purpose]

## Design Patterns

### Pattern 1: [Pattern Name]
**Purpose**: [Why we're using it]
**Implementation**: [How we'll implement it]

### Pattern 2: [Pattern Name]
...

## Data Models

### Model 1: [Model Name]
```
{
  field1: type,
  field2: type,
  ...
}
```
**Description**: [What this model represents]

### Model 2: [Model Name]
...

## API Design (if applicable)

### Endpoint 1: [Method] /path
**Purpose**: [What it does]
**Request**:
```json
{
  "param1": "value"
}
```
**Response**:
```json
{
  "result": "value"
}
```

## UI/UX Design (if applicable)

### Screen 1: [Screen Name]
**Purpose**: [What user does here]
**Components**:
- [Component 1]
- [Component 2]

### User Flow
1. [User action 1]
2. [System response 1]
3. [User action 2]
...

## Security Considerations
- [Security measure 1]
- [Security measure 2]

## Performance Considerations
- [Optimization 1]
- [Optimization 2]

## Error Handling Strategy
[How errors will be handled]

## Testing Strategy
- **Unit Tests**: [Approach]
- **Integration Tests**: [Approach]
- **E2E Tests**: [Approach if applicable]
```

**Mark todo as completed** before proceeding.

---

### STEP 5: SPEC TASKS - BREAK DOWN IMPLEMENTATION TASKS

**Purpose**: Create a detailed task breakdown for implementation.

**Actions**:
1. **Identify Major Components**
   - Break project into logical components
   - Order by dependencies

2. **Create Task List**
   - Each task should be independently implementable
   - Include setup, core features, testing, documentation
   - Add estimated complexity (simple, moderate, complex)

3. **Define Dependencies**
   - Which tasks must be completed before others?
   - What's the critical path?

4. **Add Implementation Notes**
   - Key considerations for each task
   - Potential pitfalls
   - References to design docs

**Output**: Create `specs/[spec-name]/tasks.md`:
```markdown
# Implementation Tasks: [Project Name]

## Setup Tasks

### TASK-001: Project Initialization
**Complexity**: Simple
**Description**: Initialize project structure and configuration
**Steps**:
- [ ] Create project directory structure
- [ ] Initialize package manager (npm, cargo, etc.)
- [ ] Set up configuration files
- [ ] Create README.md
**Dependencies**: None
**Notes**: [Any important notes]

### TASK-002: Development Environment
**Complexity**: Simple
**Description**: Configure development tools
**Steps**:
- [ ] Set up linter/formatter
- [ ] Configure build tools
- [ ] Set up testing framework
**Dependencies**: TASK-001

## Core Implementation Tasks

### TASK-003: [Component/Feature Name]
**Complexity**: Moderate | Complex
**Description**: [What this task accomplishes]
**Steps**:
- [ ] [Subtask 1]
- [ ] [Subtask 2]
- [ ] Write unit tests
**Dependencies**: [Previous task IDs]
**Notes**: [Important considerations]

### TASK-004: [Component/Feature Name]
...

## Integration Tasks

### TASK-0XX: [Integration Task]
**Complexity**: Moderate
**Description**: [Connect components]
**Steps**:
- [ ] [Integration step 1]
- [ ] [Integration step 2]
**Dependencies**: [Component task IDs]

## Testing Tasks

### TASK-0XX: Unit Testing
**Complexity**: Moderate
**Description**: Comprehensive unit test coverage
**Steps**:
- [ ] Test [Component 1]
- [ ] Test [Component 2]
- [ ] Achieve >80% coverage
**Dependencies**: Core implementation tasks

### TASK-0XX: Integration Testing
**Complexity**: Moderate
**Description**: End-to-end integration tests
**Steps**:
- [ ] Test [Workflow 1]
- [ ] Test [Workflow 2]
**Dependencies**: Integration tasks

## Documentation Tasks

### TASK-0XX: API Documentation
**Complexity**: Simple
**Description**: Document all public APIs
**Dependencies**: Core implementation

### TASK-0XX: User Guide
**Complexity**: Simple
**Description**: Create user-facing documentation
**Dependencies**: All implementation tasks

## Task Summary
- **Total Tasks**: [Number]
- **Simple**: [Number]
- **Moderate**: [Number]
- **Complex**: [Number]
- **Estimated Timeline**: [Rough estimate]

## Critical Path
1. TASK-001 → TASK-002 → TASK-003 → ...
```

**Mark todo as completed** before proceeding.

---

### STEP 6: SPEC IMPLEMENTATION - GENERATE CODE

**Purpose**: Generate the actual implementation code based on all previous steps.

**Actions**:
1. **Create Project Structure**
   - Generate directory structure
   - Create all necessary files

2. **Implement Core Components**
   - Write implementation code for each component
   - Follow the design from design.md
   - Implement all requirements from requirements.md

3. **Add Tests**
   - Unit tests for each component
   - Integration tests where applicable
   - Test utilities and helpers

4. **Create Configuration Files**
   - Package configuration (package.json, Cargo.toml, etc.)
   - Build configuration
   - Environment configuration

5. **Add Documentation**
   - Code comments
   - README with setup and usage instructions
   - API documentation

6. **Create Examples**
   - Usage examples
   - Sample configurations

**Output**: Generate ALL implementation files including:

1. **Main Implementation Files**
   - Source code files in appropriate directory (src/, lib/, etc.)
   - Follow project conventions and design docs
   - Include proper error handling
   - Add comprehensive comments

2. **Configuration Files**
   - Package manifest (package.json, Cargo.toml, requirements.txt, etc.)
   - Build configuration
   - Linter/formatter config
   - Environment config template

3. **Test Files**
   - Test directory structure
   - Unit tests for each module
   - Integration tests
   - Test fixtures and helpers

4. **Documentation Files**
   - README.md with:
     - Project overview
     - Installation instructions
     - Usage examples
     - API documentation
     - Contributing guidelines
   - Additional docs as needed

5. **Example Files**
   - Example usage
   - Sample configurations
   - Demo scripts

**Example Structure** (adjust based on project type):
```
[project-root]/
├── src/                   # Source code
│   ├── main.[ext]        # Entry point
│   ├── [module1].[ext]   # Core modules
│   ├── [module2].[ext]
│   └── ...
├── tests/                # Tests
│   ├── unit/
│   └── integration/
├── docs/                 # Documentation
│   ├── prime-analysis.md
│   └── api.md
├── specs/                # Specifications
│   └── [spec-name]/
│       ├── spec.md
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── examples/            # Examples
│   └── example1.[ext]
├── README.md            # Main readme
├── [package-file]       # package.json, Cargo.toml, etc.
└── [config-files]       # .eslintrc, .prettierrc, etc.
```

**Implementation Guidelines**:
- Write clean, well-structured code
- Follow language best practices
- Include error handling
- Add logging where appropriate
- Make code modular and testable
- Include inline comments for complex logic
- Follow the design patterns specified in design.md
- Implement ALL requirements from requirements.md

**Mark todo as completed** when ALL files are created.

---

## COMPLETION REQUIREMENTS

You MUST:
1. Create TodoWrite list at the very start
2. Execute ALL 6 steps in order (Prime → Init → Requirements → Design → Tasks → Implementation)
3. Create ALL documentation files:
   - docs/prime-analysis.md
   - specs/[spec-name]/spec.md
   - specs/[spec-name]/requirements.md
   - specs/[spec-name]/design.md
   - specs/[spec-name]/tasks.md
4. Generate ALL implementation files:
   - Source code files
   - Test files
   - Configuration files
   - README.md
   - Example files
5. Update todos as you progress
6. Mark ALL 10 todos as completed (100% completion)
7. Verify all files are created successfully

## FORBIDDEN ACTIONS

- Do NOT skip any of the 6 steps
- Do NOT create partial implementations
- Do NOT skip documentation steps
- Do NOT move to next step until current step is fully complete
- Do NOT create files without content
- Do NOT skip todo updates
- Do NOT stop before implementation is complete
- Do NOT ask for more information unless absolutely critical

## SUCCESS CRITERIA

- All 10 todos marked as completed (100%)
- All 6 workflow steps executed successfully
- Complete documentation set created:
  - Prime analysis document
  - Specification documents (spec, requirements, design, tasks)
- Full implementation created:
  - Working source code
  - Tests
  - Configuration
  - Documentation
  - Examples
- All files contain complete, high-quality content
- Implementation matches requirements and design

## PROGRESS TRACKING

Update todos at each step:
- When starting a step: Mark as "in_progress"
- When completing a step: Mark as "completed"
- Always show percentage completion

Provide updates like:
- "Starting Prime - Project Analysis..."
- "Created docs/prime-analysis.md (Step 1/6 complete)"
- "Starting Spec Requirements gathering..."
- "Implementation 50% complete - created 8/15 files..."
- "Workflow 100% complete - all files generated successfully!"

START NOW by creating the TodoWrite list and executing all 6 steps to completion.
