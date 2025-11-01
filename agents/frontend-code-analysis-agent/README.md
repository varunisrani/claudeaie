# Frontend Code Analysis Agent

Analyzes React/Vue/Angular/Next.js applications and generates comprehensive Playwright test plans through a 5-step automated workflow.

## Overview

The Frontend Code Analysis Agent performs deep analysis of frontend codebases and generates detailed test plans for Playwright agents. It executes a systematic 5-step workflow that produces comprehensive documentation for testing and quality assurance.

## Features

- **Multi-Framework Support**: Works with React, Vue, Angular, Next.js, and other modern frontend frameworks
- **5-Step Analysis Workflow**: Systematic approach to complete codebase understanding
- **Automated Test Plan Generation**: Creates detailed Playwright test specifications
- **Comprehensive Documentation**: Generates 5 detailed markdown documents
- **Component Mapping**: Identifies and catalogs all components and interactions
- **User Journey Analysis**: Maps critical user flows and navigation patterns

## Generated Documents

The agent generates 5 comprehensive markdown documents:

1. **CODEBASE_ANALYSIS.md** - Complete codebase analysis
   - Project structure and organization
   - Technology stack and dependencies
   - Configuration analysis
   - Development workflow documentation

2. **PAGE_FLOW_MAP.md** - All pages and user flows
   - Complete route inventory
   - Page component analysis
   - Navigation patterns
   - Authentication flow mapping

3. **COMPONENT_INVENTORY.md** - Interactive components catalog
   - Component categorization
   - Interactive element identification
   - Form components analysis
   - Data display components

4. **USER_JOURNEY_ANALYSIS.md** - Critical user paths
   - Interaction mapping
   - Keyboard and touch interactions
   - Modal and dialog patterns
   - Accessibility considerations

5. **PLAYWRIGHT_TEST_PLAN.md** - Detailed test plan for Playwright agents
   - Comprehensive test case specifications
   - Browser and device coverage matrix
   - Test data requirements
   - Execution instructions

## 5-Step Workflow

### Step 1: Scan Codebase
- Analyzes project structure
- Detects framework and technologies
- Maps source code organization
- Identifies routing configuration

### Step 2: Analyze Pages and Flows
- Discovers all routes and pages
- Maps navigation patterns
- Identifies user journeys
- Analyzes authentication flows

### Step 3: Identify Components
- Catalogs all components
- Classifies by purpose and complexity
- Identifies interactive elements
- Maps component dependencies

### Step 4: Map Interactions
- Documents all user interactions
- Maps form validations
- Analyzes keyboard navigation
- Identifies modal patterns

### Step 5: Generate Test Plan
- Creates detailed test specifications
- Defines test data requirements
- Specifies browser/device coverage
- Provides execution instructions

## Usage

### Via Container API

```bash
POST /api/agent/execute
{
  "agentId": "frontend-code-analysis-agent",
  "prompt": "Analyze my frontend application",
  "parameters": {
    "frontendFolder": "/path/to/frontend",
    "outputFolder": "test_plan_output"
  }
}
```

### Required Parameters

- **frontendFolder** (required): Absolute path to the frontend application directory
- **outputFolder** (optional): Directory where analysis documents will be generated (default: `test_plan_output`)

### Example

```javascript
const response = await fetch('http://localhost:8787/api/agent/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    agentId: 'frontend-code-analysis-agent',
    prompt: 'Analyze my React application and generate test plans',
    parameters: {
      frontendFolder: '/home/user/myapp/frontend',
      outputFolder: 'analysis_output'
    }
  })
});

const result = await response.json();
console.log(result);
```

## Output Structure

```
test_plan_output/
├── CODEBASE_ANALYSIS.md
├── PAGE_FLOW_MAP.md
├── COMPONENT_INVENTORY.md
├── USER_JOURNEY_ANALYSIS.md
└── PLAYWRIGHT_TEST_PLAN.md
```

## Supported Frameworks

- **React** - Class and functional components, hooks
- **Vue** - Vue 2 and Vue 3
- **Angular** - All versions
- **Next.js** - Pages and App Router
- **Svelte/SvelteKit**
- **Solid.js**
- Other modern frontend frameworks

## Use Cases

1. **Testing Preparation**: Generate comprehensive test plans before implementing Playwright tests
2. **Code Audits**: Understand codebase structure and organization
3. **Documentation**: Create detailed documentation of frontend applications
4. **Onboarding**: Help new developers understand application architecture
5. **Quality Assurance**: Identify testing priorities and coverage gaps
6. **Migration Planning**: Document existing application before refactoring

## Technical Details

- **Model**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- **Max Turns**: 100
- **Permission Mode**: bypassPermissions (for file system access)
- **MCP Required**: No

## Cost Tracking

The agent provides detailed cost tracking including:
- Input/output token usage
- Cache creation and read tokens
- Step-by-step cost breakdown
- Total cost in USD

## Command Files

The agent uses 5 sequential command files that define each step of the workflow:

- `commands/step1-scan-codebase.md` - Codebase scanning instructions
- `commands/step2-analyze-pages-flows.md` - Page and flow analysis
- `commands/step3-identify-components.md` - Component identification
- `commands/step4-map-interactions.md` - Interaction mapping
- `commands/step5-generate-test-plan.md` - Test plan generation

## Implementation

The agent extends `BaseAgent` and uses the Claude Agent SDK `query()` function to execute the analysis workflow. It tracks:

- Files analyzed
- Components discovered
- Pages/routes found
- Documents generated
- Tool usage statistics
- Cost and performance metrics

## Notes

- The agent requires file system access to read the frontend codebase
- Analysis duration varies based on codebase size (typically 5-15 minutes)
- Generated documents are comprehensive and ready for immediate use
- All 5 steps must complete for full analysis
- The agent uses TodoWrite for progress tracking

## Author

Claude Agent SDK Team

## Version

1.0.0

## License

Same as parent project
