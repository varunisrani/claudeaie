# AI Deployment Agent

A comprehensive AI-powered deployment agent that automates the entire process of setting up GitHub repositories, configuring Vercel projects, building applications, and deploying to production with intelligent error fixing.

## Overview

The AI Deployment Agent automates the complete deployment workflow for web applications, handling everything from GitHub repository creation to Vercel deployment with automatic build error fixing and health monitoring.

## Features

### Core Capabilities
- **Dual Mode Operation**: Supports both NEW and EXISTING projects
- **Automated GitHub Management**: Repository creation, cloning, and configuration
- **Vercel Integration**: Automatic project creation, linking, and deployment
- **Intelligent Build System**: Automated build execution with error fixing
- **Real-time Monitoring**: Deployment health monitoring and issue resolution
- **CLI Tool Integration**: Seamless GitHub CLI, Vercel CLI, and npm integration

### Project Modes

#### NEW PROJECT MODE
- Creates new GitHub repository
- Initializes project structure
- Sets up build configuration
- Creates Vercel project
- Links GitHub → Vercel
- Deploys to production

#### EXISTING PROJECT MODE
- Clones existing GitHub repository
- Detects existing Vercel project
- Uses existing configuration
- Pulls latest changes
- Deploys updates to existing Vercel project

## 6-Step Workflow

### Step 1: Environment Analysis (Prime)
Verifies the deployment environment:
- Check GitHub CLI (`gh`) installation and authentication
- Check Vercel CLI (`vercel`) installation and authentication
- Check npm/yarn availability
- Verify Git configuration
- Check for required environment variables

### Step 2: Project Detection
Determines project mode:
- Parse user input for GitHub URL or project name
- Check if repository exists on GitHub
- Determine NEW vs EXISTING project mode
- Store detected mode for subsequent steps

### Step 3: GitHub Setup
Repository setup based on mode:
- **NEW**: Create repository, initialize, clone, setup initial commit
- **EXISTING**: Clone repository, fetch branches, pull latest changes

### Step 4: Vercel Setup
Configure Vercel project:
- Check for existing Vercel project
- Create new or link to existing project
- Configure environment variables
- Set up build settings
- Link GitHub repository to Vercel

### Step 5: Build and Deploy
Execute build and deployment:
- Install dependencies
- Run local build test
- Apply automatic fixes for build errors:
  - Missing dependencies
  - TypeScript errors
  - ESLint errors
  - Module resolution issues
- Deploy to Vercel
- Monitor deployment progress

### Step 6: Monitor and Fix
Post-deployment validation:
- Check deployment health
- Verify application accessibility
- Check runtime errors in Vercel logs
- Apply automatic fixes if needed
- Run final health check

## Usage

### In Container Environment

The agent is automatically loaded by the container server and can be invoked via API:

```bash
curl -X POST http://localhost:8787/agents/ai-deployment-agent/execute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_ANTHROPIC_API_KEY" \
  -d '{
    "prompt": "Deploy my Next.js portfolio to Vercel",
    "parameters": {
      "project_name": "my-portfolio",
      "framework": "nextjs"
    }
  }'
```

### Parameters

- **prompt** (required): Natural language description of deployment task
- **parameters** (optional):
  - `project_name`: Name for the project/repository
  - `github_url`: Existing GitHub repository URL (for EXISTING mode)
  - `framework`: Framework type (nextjs, react, vue, etc.)
  - `env_vars`: Environment variables as key-value pairs

### Example Prompts

**New Project:**
```json
{
  "prompt": "Create a new Next.js portfolio website and deploy it to Vercel",
  "parameters": {
    "project_name": "my-portfolio",
    "framework": "nextjs"
  }
}
```

**Existing Project:**
```json
{
  "prompt": "Deploy my existing React app from GitHub",
  "parameters": {
    "github_url": "https://github.com/user/react-app"
  }
}
```

**With Environment Variables:**
```json
{
  "prompt": "Deploy my app with API keys",
  "parameters": {
    "project_name": "my-app",
    "env_vars": {
      "API_KEY": "secret-key",
      "DATABASE_URL": "postgresql://..."
    }
  }
}
```

## Error Handling

### Automatic Build Error Fixes

**Missing Dependencies:**
```bash
# Detected: Module not found errors
# Fix: npm install <missing-package>
```

**TypeScript Errors:**
```bash
# Detected: Type errors in build output
# Fix: Add type definitions or configuration
```

**Environment Variables:**
```bash
# Detected: Undefined environment variables
# Fix: Set in Vercel project settings
```

**Build Command Issues:**
```bash
# Detected: Command not found
# Fix: Update package.json scripts
```

### Deployment Monitoring

- **Accessibility Checks**: HTTP status verification
- **Performance Analysis**: Load time and response size monitoring
- **Health Monitoring**: Memory and timeout issue detection
- **Automatic Fixes**: Configuration optimization and redeployment

## Response Format

```json
{
  "success": true,
  "response": "AI Deployment Complete!\n\nProject: my-portfolio\nMode: NEW\nSteps Completed: 6/6\n\n🚀 Deployment URL: https://my-portfolio.vercel.app\n📦 Repository: https://github.com/user/my-portfolio\n...",
  "data": {
    "project_name": "my-portfolio",
    "mode": "NEW",
    "deployment_url": "https://my-portfolio.vercel.app",
    "repository_url": "https://github.com/user/my-portfolio",
    "workflow_steps": {
      "prime": true,
      "detect-project": true,
      "setup-github": true,
      "setup-vercel": true,
      "build-deploy": true,
      "monitor-fix": true
    },
    "steps_completed": 6,
    "total_steps": 6,
    "tool_calls": {
      "Bash": 45,
      "Read": 12,
      "Write": 8,
      "TodoWrite": 7
    },
    "cost_tracking": {
      "total_input_tokens": 15420,
      "total_output_tokens": 8932,
      "total_cost_usd": 0.1804
    },
    "session_id": "session_xyz123",
    "errors": []
  },
  "logs": [...],
  "metadata": {
    "duration": 145230,
    "tokensUsed": 24352,
    "costUsd": 0.1804,
    "toolCalls": {
      "Bash": 45,
      "Read": 12,
      "Write": 8
    }
  }
}
```

## Prerequisites

The following tools must be installed and authenticated in the container environment:

1. **GitHub CLI** (`gh`)
   ```bash
   gh auth login
   ```

2. **Vercel CLI** (`vercel`)
   ```bash
   vercel login
   ```

3. **Node.js & npm** (built into container)

4. **Git** (built into container)

## Success Criteria

### NEW Projects
- ✅ GitHub repository created
- ✅ Project initialized
- ✅ Build configuration set up
- ✅ Vercel project created
- ✅ GitHub → Vercel linked
- ✅ Deployment successful
- ✅ Monitoring complete

### EXISTING Projects
- ✅ Repository cloned
- ✅ Vercel project linked
- ✅ Latest changes pulled
- ✅ Build successful
- ✅ Deployment successful
- ✅ Monitoring complete

## Configuration

The agent configuration is defined in `config.json`:

```json
{
  "id": "ai-deployment-agent",
  "name": "AI Deployment Agent",
  "version": "1.0.0",
  "description": "Automates GitHub repository setup and Vercel deployment with intelligent build error fixing",
  "maxTurns": 150,
  "defaultModel": "claude-3-5-sonnet-20241022",
  "systemPromptFile": "prompt.md",
  "requiresMCP": false
}
```

## File Structure

```
ai-deployment-agent/
├── agent.ts          # Main agent implementation (544 lines)
├── config.json       # Agent configuration and metadata
├── prompt.md         # System prompt with workflow instructions (142 lines)
└── README.md         # This file
```

## Implementation Details

### BaseAgent Integration

The agent extends the `BaseAgent` class and implements the `execute()` method:

```typescript
export default class AiDeploymentAgent extends BaseAgent {
  async execute(context: AgentContext): Promise<AgentResult> {
    // Implementation uses Claude Agent SDK query() function
    // Tracks costs, logs, and workflow progress
    // Returns structured result with deployment data
  }
}
```

### Cost Tracking

The agent tracks API usage and costs:
- Input tokens
- Output tokens
- Cache creation tokens
- Cache read tokens
- Total cost in USD (based on Claude 3.5 Sonnet pricing)

### Logging

Comprehensive logging at each step:
- Session initialization
- Tool usage tracking
- Workflow step completion
- Error detection and handling
- Cost updates

## Troubleshooting

### Common Issues

**CLI Tools Not Found:**
```bash
# Install GitHub CLI
# https://cli.github.com/

# Install Vercel CLI
npm install -g vercel

# Verify installation
gh --version
vercel --version
```

**Authentication Issues:**
```bash
gh auth login
vercel login
```

**Build Failures:**
- Check error logs in deployment output
- Verify package.json scripts
- Ensure all dependencies are installed
- Check environment variables

**Deployment Issues:**
- Check Vercel project configuration
- Verify GitHub integration
- Check environment variables
- Review Vercel logs

## Advanced Usage

### Custom Frameworks

The agent supports any framework that Vercel supports:
- Next.js
- React
- Vue
- Svelte
- Angular
- Static sites
- Node.js APIs

### Environment Variables

Pass environment variables in the request:

```json
{
  "parameters": {
    "env_vars": {
      "DATABASE_URL": "postgresql://...",
      "API_KEY": "secret",
      "NODE_ENV": "production"
    }
  }
}
```

### Build Configuration

The agent automatically detects and uses:
- `package.json` scripts
- Framework-specific build commands
- Custom build settings
- Environment-specific configurations

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the workflow steps in `prompt.md`
3. Check agent logs for detailed execution information
4. Verify CLI tool authentication status
5. Ensure all prerequisites are installed

## License

This agent is part of the Claude Agent SDK Cloudflare integration.

## Contributing

The agent is designed to be extensible. You can:
1. Add new deployment platforms
2. Enhance error detection and fixing
3. Improve monitoring capabilities
4. Add support for more frameworks
5. Extend environment analysis

## Version History

### 1.0.0 (2025-11-01)
- Initial release
- Support for NEW and EXISTING projects
- GitHub and Vercel integration
- Intelligent build error fixing
- Comprehensive monitoring and health checks
- Cost tracking and logging
- BaseAgent integration for container deployment
