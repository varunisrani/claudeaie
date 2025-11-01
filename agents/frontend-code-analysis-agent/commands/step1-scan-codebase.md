# STEP 1: SCAN CODEBASE - Frontend Project Structure Analysis

## MISSION
Analyze the frontend codebase structure to understand the project architecture, dependencies, and organization.

## ACTIONS TO EXECUTE

### 1.1 Project Structure Scanning
- **ACTION**: Use `Glob` to scan the entire frontend folder structure
- **PATTERNS**:
  - `**/*` - Get all files and directories
  - `package.json` - Find package.json files
  - `**/*.json` - Find configuration files
  - `src/**/*` - Scan source directory structure
- **OUTPUT**: Complete file and directory structure map

### 1.2 Framework and Technology Detection
- **ACTION**: Use `Read` to analyze `package.json`
- **ANALYZE**:
  - Framework detection (React, Vue, Angular, etc.)
  - Dependencies and devDependencies
  - Build tools (Vite, Webpack, etc.)
  - Testing frameworks (Jest, Vitest, Cypress, etc.)
  - UI libraries (Material-UI, Tailwind, etc.)
- **OUTPUT**: Technology stack summary

### 1.3 Configuration File Analysis
- **ACTION**: Use `Read` to examine key configuration files
- **FILES TO READ**:
  - `vite.config.js` or `vite.config.ts`
  - `webpack.config.js` (if exists)
  - `tsconfig.json` (TypeScript projects)
  - `tailwind.config.js` (if using Tailwind)
  - `.env*` files (environment configuration)
  - `eslint.config.js` or `.eslintrc.*`
  - `jest.config.js` or `vitest.config.js`
- **OUTPUT**: Build and development configuration summary

### 1.4 Source Code Organization
- **ACTION**: Use `Glob` and `Read` to understand source code structure
- **AREAS TO MAP**:
  - `src/` directory structure
  - `src/components/` - Component organization
  - `src/pages/` or `src/views/` - Page organization
  - `src/hooks/` - Custom hooks
  - `src/services/` or `src/api/` - API services
  - `src/utils/` - Utility functions
  - `src/types/` - TypeScript definitions
  - `src/styles/` - CSS/styling organization
- **OUTPUT**: Source code organization map

### 1.5 Routing Configuration
- **ACTION**: Use `Glob` and `Read` to find routing setup
- **PATTERNS TO SEARCH**:
  - `**/router*` - Router files
  - `**/routes*` - Routes files
  - `**/*route*` - Any routing related files
- **ANALYZE**:
  - React Router configuration
  - Vue Router setup
  - Angular routing module
  - File-based routing (Next.js, SvelteKit, etc.)
- **OUTPUT**: Routing structure analysis

### 1.6 Build Scripts and Development Setup
- **ACTION**: Use `Read` to analyze `package.json` scripts section
- **IDENTIFY**:
  - Development server command
  - Build command
  - Test command
  - Lint and format commands
  - Any custom scripts
- **OUTPUT**: Development workflow documentation

## REQUIRED OUTPUTS

### Create Analysis Document: CODEBASE_ANALYSIS.md
Use `Write` tool to create a comprehensive codebase analysis document with:

```markdown
# Frontend Codebase Analysis Report

## Project Overview
- **Project Name**: [extracted from package.json]
- **Framework**: [React/Vue/Angular/etc.]
- **Build Tool**: [Vite/Webpack/etc.]
- **Language**: [TypeScript/JavaScript]
- **Location**: [frontend folder path]

## Technology Stack
### Core Framework
- Framework: [details]
- Version: [version]
- Type: [SPA/SSR/Static/etc.]

### Key Dependencies
- **UI Library**: [Material-UI/Tailwind/etc.]
- **State Management**: [Redux/Zustand/Vuex/etc.]
- **Routing**: [React Router/Vue Router/etc.]
- **HTTP Client**: [Axios/Fetch/etc.]
- **Form Handling**: [React Hook Form/ Formik/etc.]

### Development Tools
- **Build Tool**: [Vite/Webpack/etc.]
- **Testing Framework**: [Jest/Vitest/etc.]
- **Linting**: [ESLint configuration]
- **Type Checking**: [TypeScript if applicable]
- **CSS Framework**: [Tailwind/CSS Modules/etc.]

## Project Structure
```
[Complete directory tree structure]
```

## Key Directories Analysis
### src/
- **Purpose**: Main source code
- **Organization**: [structure description]

### src/components/
- **Purpose**: Reusable UI components
- **Count**: [number of components]
- **Organization**: [subdirectories if any]

### src/pages/ or src/views/
- **Purpose**: Page-level components
- **Count**: [number of pages]
- **Organization**: [structure description]

### [Other key directories]
- **Purpose**: [description]
- **Contents**: [summary]

## Configuration Analysis
### Build Configuration
- **Tool**: [Vite/Webpack/etc.]
- **Key Settings**: [important configuration details]
- **Output**: [build output settings]

### TypeScript Configuration (if applicable)
- **Strict Mode**: [yes/no]
- **Target**: [ES version]
- **Module Resolution**: [strategy]

### Development Scripts
- **Dev Server**: `npm run [command]`
- **Build**: `npm run [command]`
- **Test**: `npm run [command]`
- **Lint**: `npm run [command]`

## Routing Configuration
- **Router**: [React Router/Vue Router/etc.]
- **Strategy**: [code-based/file-based/etc.]
- **Routes Found**: [list of main routes]

## Development Environment
- **Package Manager**: [npm/yarn/pnpm]
- **Node Version Required**: [if specified]
- **Browser Support**: [target browsers]

## Initial Assessment
### Strengths
- [list of positive aspects]

### Areas Requiring Attention
- [list of potential issues or improvements]

### Testing Readiness
- [existing testing setup analysis]
```

## SUCCESS CRITERIA
✅ Complete project structure mapped
✅ Framework and dependencies identified
✅ Configuration files analyzed
✅ Source code organization documented
✅ Routing configuration understood
✅ Development workflow documented
✅ CODEBASE_ANALYSIS.md created and saved

## NEXT STEP
Once this step is complete, mark the corresponding todo as completed and proceed to Step 2: Analyze Pages and Flows.

---
**Do NOT proceed to the next step until ALL analysis is complete and CODEBASE_ANALYSIS.md is generated!**