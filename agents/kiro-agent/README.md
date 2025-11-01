# Kiro Complete Workflow Agent

A comprehensive software development workflow agent that executes systematic development from requirements analysis to full implementation.

## Overview

The Kiro Complete Workflow Agent orchestrates a 6-step development process:

1. **Prime (Project Analysis)** - Comprehensive analysis of project requirements and context
2. **Spec Init** - Initialize specification structure and foundation
3. **Spec Requirements** - Gather detailed functional and non-functional requirements
4. **Spec Design** - Create architecture and design documentation
5. **Spec Tasks** - Break down implementation into concrete tasks
6. **Spec Implementation** - Generate complete implementation with tests and documentation

## Features

- **Systematic Workflow**: Follows a proven 6-step methodology
- **Complete Documentation**: Generates structured specs, requirements, design docs, and task breakdowns
- **Full Implementation**: Creates working code with tests, configuration, and documentation
- **Progress Tracking**: Uses TodoWrite to track workflow progress in real-time
- **Detailed Logging**: Comprehensive logging of all operations
- **Cost Tracking**: Monitors token usage and costs throughout execution
- **Auto Spec Naming**: Automatically generates meaningful spec names from project descriptions

## Usage

### Via Container API

```bash
curl -X POST http://localhost:8787/api/agents/execute \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "agentId": "kiro-agent",
    "prompt": "Create a REST API for blog management with user authentication",
    "parameters": {
      "description": "Build a blog API with posts, comments, and user auth using JWT"
    }
  }'
```

### Via Direct Invocation

```typescript
import KiroAgent from './agents/kiro-agent/agent.js';
import config from './agents/kiro-agent/config.json';

const agent = new KiroAgent(config);

const result = await agent.execute({
  taskId: 'task-123',
  prompt: 'Create a todo list application with React',
  parameters: {
    description: 'Build a React-based todo app with local storage persistence'
  },
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-5-20250929'
});

console.log(result);
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Project description |
| `description` | string | No | Detailed project description (falls back to prompt) |

## Output

The agent returns a comprehensive result including:

```typescript
{
  success: true,
  response: "Summary of workflow execution",
  data: {
    project_description: "...",
    spec_name: "generated-spec-name",
    files_created: ["file1.md", "file2.ts", ...],
    todos_completed: 10,
    todos_total: 10,
    completion_percent: 100,
    tool_calls: { "Write": 15, "TodoWrite": 5, ... },
    cost_tracking: {
      total_input_tokens: 12345,
      total_output_tokens: 6789,
      total_cost_usd: 0.1234
    },
    session_id: "session-abc123"
  },
  logs: [...],
  metadata: {
    duration: 45000,
    tokensUsed: 19134,
    costUsd: 0.1234,
    toolCalls: { ... }
  }
}
```

## Generated Files

The agent creates a complete project structure:

```
docs/
  prime-analysis.md          # Step 1: Project analysis

specs/
  [spec-name]/
    spec.md                  # Step 2: Main specification
    requirements.md          # Step 3: Detailed requirements
    design.md                # Step 4: Architecture & design
    tasks.md                 # Step 5: Implementation tasks

src/                         # Step 6: Implementation
  main.[ext]                 # Entry point
  [modules].[ext]            # Core modules
  ...

tests/                       # Step 6: Tests
  unit/
  integration/

README.md                    # Step 6: Project documentation
[package-file]               # Step 6: Package configuration
[config-files]               # Step 6: Tool configurations
```

## Example Projects

### Example 1: REST API

```json
{
  "prompt": "Create a REST API for task management with user authentication"
}
```

**Generated**:
- Complete Express.js or Fastify API
- JWT authentication
- CRUD endpoints for tasks
- User management
- Database schema
- API documentation
- Tests

### Example 2: CLI Tool

```json
{
  "prompt": "Build a command-line tool for file conversion between JSON and YAML"
}
```

**Generated**:
- CLI application structure
- Argument parsing
- File conversion logic
- Error handling
- Help documentation
- Tests

### Example 3: Web Application

```json
{
  "prompt": "Create a React dashboard for monitoring system metrics"
}
```

**Generated**:
- React application with components
- State management
- API integration
- Responsive UI
- Build configuration
- Tests

## Workflow Steps in Detail

### Step 1: Prime - Project Analysis
- Analyzes project description
- Identifies objectives and scope
- Determines technology stack
- Assesses risks and challenges
- Creates `docs/prime-analysis.md`

### Step 2: Spec Init - Initialize Specification
- Generates spec name from project description
- Creates spec directory structure
- Initializes main specification file
- Creates `specs/[spec-name]/spec.md`

### Step 3: Spec Requirements - Gather Requirements
- Documents functional requirements
- Documents non-functional requirements
- Creates user stories
- Defines acceptance criteria
- Creates `specs/[spec-name]/requirements.md`

### Step 4: Spec Design - Create Design
- Defines system architecture
- Documents design patterns
- Designs data models
- Designs APIs (if applicable)
- Creates `specs/[spec-name]/design.md`

### Step 5: Spec Tasks - Break Down Tasks
- Creates detailed task breakdown
- Identifies dependencies
- Estimates complexity
- Creates implementation roadmap
- Creates `specs/[spec-name]/tasks.md`

### Step 6: Spec Implementation - Generate Code
- Creates complete project structure
- Implements all core functionality
- Writes comprehensive tests
- Generates configuration files
- Creates documentation
- Produces working implementation

## Configuration

Located in `config.json`:

```json
{
  "id": "kiro-agent",
  "name": "Kiro Complete Workflow",
  "maxTurns": 150,
  "defaultModel": "claude-sonnet-4-5-20250929",
  "requiresMCP": false
}
```

## Progress Tracking

The agent uses TodoWrite to track progress through 10 tasks:

1. Create todo list for Kiro workflow
2. Execute Prime - Project Analysis
3. Execute Spec Init - Initialize Specification
4. Execute Spec Requirements - Gather Requirements
5. Execute Spec Design - Create Design Docs
6. Execute Spec Tasks - Break Down Tasks
7. Execute Spec Implementation - Generate Code
8. Verify all documentation created
9. Verify implementation complete
10. Complete workflow

Each task is updated in real-time as the workflow progresses.

## Best Practices

1. **Clear Project Descriptions**: Provide detailed project descriptions for best results
2. **Specify Technologies**: Mention preferred languages/frameworks if you have preferences
3. **Review Generated Specs**: Check the generated documentation before implementation
4. **Iterative Refinement**: Use generated specs as starting points for further refinement
5. **Cost Awareness**: Monitor cost tracking for large projects

## Troubleshooting

### Workflow Stops Early
- Check the logs for errors
- Verify API key is valid
- Ensure sufficient max_turns in configuration

### Missing Files
- Check the `files_created` list in the result
- Review error logs for file write failures
- Verify directory permissions

### Incomplete Implementation
- Check todo completion percentage
- Review the last completed step in logs
- May need to increase max_turns for complex projects

## Technical Details

- **Implementation**: TypeScript with ES modules
- **Base Class**: Extends `BaseAgent`
- **SDK**: Uses `@anthropic-ai/claude-agent-sdk`
- **Cost Tracking**: Real-time token and cost monitoring
- **Logging**: Comprehensive logging with multiple levels
- **Error Handling**: Graceful error handling with detailed reporting

## Version History

- **v1.0.0**: Initial release
  - Complete 6-step workflow
  - Full documentation generation
  - Code implementation
  - Progress tracking
  - Cost monitoring

## Contributing

When contributing improvements:
1. Maintain the 6-step workflow structure
2. Preserve progress tracking functionality
3. Keep documentation generation comprehensive
4. Test with various project types
5. Update examples and documentation

## License

Same as parent project.
