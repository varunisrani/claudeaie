# Reverse Engineering Docs Agent - Integration Guide

This guide shows how to use the Reverse Engineering Documentation Generator Agent in the Claude Agent SDK Cloudflare container environment.

## Quick Start

### 1. Build the Container

```bash
cd container
npm install
npm run build
```

This will compile all TypeScript files including the reverse-engineering-docs-agent.

### 2. Start the Container

```bash
export ANTHROPIC_API_KEY=your-api-key-here
npm start
```

The container will automatically load the reverse-engineering-docs-agent along with all other agents.

### 3. Verify Agent is Loaded

```bash
curl http://localhost:8080/agents
```

You should see the reverse-engineering-docs-agent in the list:

```json
{
  "agents": [
    {
      "id": "reverse-engineering-docs-agent",
      "name": "Reverse Engineering Docs Generator",
      "description": "Analyzes GitHub repositories and generates comprehensive documentation",
      "capabilities": ["code-generation", "code-review", "data-analysis", "file-operations"],
      "tags": ["documentation", "reverse-engineering", "github", "analysis", "markdown", "architecture"]
    }
  ]
}
```

## Using the Agent

### Via HTTP API

#### Example 1: Analyze a Repository

```bash
curl -X POST http://localhost:8080/run \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "reverse-engineering-docs-agent",
    "taskId": "doc-gen-1",
    "prompt": "https://github.com/facebook/react",
    "parameters": {
      "githubUrl": "https://github.com/facebook/react",
      "purpose": "Document React architecture and component system"
    }
  }'
```

#### Example 2: Analyze a Smaller Repository

```bash
curl -X POST http://localhost:8080/run \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "reverse-engineering-docs-agent",
    "taskId": "doc-gen-2",
    "prompt": "https://github.com/axios/axios",
    "parameters": {
      "githubUrl": "https://github.com/axios/axios",
      "purpose": "Generate documentation for HTTP client library"
    }
  }'
```

### Via TypeScript SDK

```typescript
import { AgentRegistry } from './container/agents/registry.js';
import * as path from 'path';

const agentsDir = path.join(__dirname, 'container', 'agents');
const registry = new AgentRegistry(agentsDir);

await registry.loadAllAgents();

const agent = registry.getAgent('reverse-engineering-docs-agent');

const result = await agent.execute({
  taskId: 'doc-gen-1',
  prompt: 'https://github.com/axios/axios',
  parameters: {
    githubUrl: 'https://github.com/axios/axios',
    purpose: 'Generate comprehensive documentation'
  },
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-5-20250929'
});

console.log(result.response);
```

## Response Format

### Success Response

```json
{
  "success": true,
  "response": "Reverse Engineering Documentation Generation Complete!\n\nGitHub URL: https://github.com/axios/axios\nRepository: axios/axios\n...",
  "data": {
    "githubUrl": "https://github.com/axios/axios",
    "owner": "axios",
    "repo": "axios",
    "purpose": "Generate comprehensive documentation",
    "files_generated": [
      "/tmp/REVERSE_ENGINEERING_DOCS/README.md",
      "/tmp/REVERSE_ENGINEERING_DOCS/01_PROJECT_OVERVIEW.md",
      "/tmp/REVERSE_ENGINEERING_DOCS/02_ARCHITECTURE.md",
      ...
    ],
    "workflow_steps_completed": ["prime", "clone", "analyze", "generate", "format", "finalize"],
    "tool_calls": {
      "Read": 5,
      "Write": 13,
      "Bash": 8,
      "TodoWrite": 12
    },
    "cost_tracking": {
      "total_input_tokens": 125000,
      "total_output_tokens": 45000,
      "total_cache_creation_tokens": 0,
      "total_cache_read_tokens": 0,
      "total_cost_usd": 0.8234
    },
    "session_id": "session-abc123"
  },
  "logs": [
    {
      "id": "1234567890-0.123",
      "timestamp": "2025-11-01T12:00:00.000Z",
      "level": "info",
      "message": "Starting Reverse Engineering Documentation Generator",
      "data": {
        "taskId": "doc-gen-1"
      }
    }
  ],
  "metadata": {
    "duration": 245670,
    "tokensUsed": 170000,
    "costUsd": 0.8234,
    "toolCalls": {
      "Read": 5,
      "Write": 13,
      "Bash": 8,
      "TodoWrite": 12
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid GitHub URL format: not-a-url",
  "logs": [
    {
      "id": "1234567890-0.123",
      "timestamp": "2025-11-01T12:00:00.000Z",
      "level": "error",
      "message": "Documentation generation failed",
      "data": {
        "error": "Invalid GitHub URL format: not-a-url"
      }
    }
  ],
  "metadata": {
    "duration": 1234
  }
}
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `githubUrl` | string | Yes | - | GitHub repository URL (https://github.com/owner/repo) |
| `purpose` | string | No | "Generate comprehensive documentation and architecture analysis" | Analysis goal or focus area |

## Output Files

The agent generates 13 markdown files in a `REVERSE_ENGINEERING_DOCS/` directory:

1. **README.md** - Index and navigation
2. **01_PROJECT_OVERVIEW.md** - Project summary and tech stack
3. **02_ARCHITECTURE.md** - System architecture with diagrams
4. **03_API_DOCUMENTATION.md** - Complete API reference
5. **04_FRONTEND_ANALYSIS.md** - Frontend structure and components
6. **05_BACKEND_ANALYSIS.md** - Backend architecture and logic
7. **06_DATABASE_SCHEMA.md** - Database design and relationships
8. **07_COMPONENTS.md** - Component documentation
9. **08_FEATURES.md** - Feature mapping and functionality
10. **09_DEPENDENCIES.md** - Dependency analysis
11. **10_HOW_IT_WORKS.md** - System flow explanations
12. **11_SETUP_GUIDE.md** - Local setup instructions
13. **12_REVERSE_ENGINEERING_STRATEGY.md** - Recreation guide
14. **13_WHITE_LABEL_GUIDE.md** - White-labeling strategy

## Workflow Steps

The agent executes a 6-step workflow:

1. **Prime** - Analyze repository structure and tech stack
2. **Clone** - Clone repository to temporary directory
3. **Analyze** - Deep dive into codebase structure
4. **Generate** - Create all 13 documentation files
5. **Format** - Format documentation with proper structure
6. **Finalize** - Add diagrams and cross-references

## Cost Estimation

Typical costs for different repository sizes:

| Repository Size | Estimated Tokens | Estimated Cost |
|-----------------|------------------|----------------|
| Small (< 1000 files) | 50,000 - 100,000 | $0.20 - $0.50 |
| Medium (1000-5000 files) | 100,000 - 200,000 | $0.50 - $1.20 |
| Large (5000-10000 files) | 200,000 - 300,000 | $1.20 - $2.00 |
| Very Large (> 10000 files) | 300,000+ | $2.00+ |

## Troubleshooting

### Agent Not Found

If you get "Agent not found: reverse-engineering-docs-agent":

1. Ensure the container is built: `npm run build`
2. Check agent exists: `ls agents/reverse-engineering-docs-agent/`
3. Verify compiled files: `ls container/dist/agents/reverse-engineering-docs-agent/`
4. Restart the container

### Invalid GitHub URL

The agent accepts these formats:
- `https://github.com/owner/repo`
- `https://github.com/owner/repo.git`
- `http://github.com/owner/repo` (will be upgraded to HTTPS)

### Git Not Available

If you get "git: command not found":

1. Install Git on the container host
2. Ensure Git is in PATH
3. Test: `git --version`

### Repository Not Accessible

For private repositories:
- The agent currently works best with public repositories
- For private repos, ensure Git credentials are configured

## Docker Deployment

### Build Docker Image

```bash
docker build -t claude-agent-sdk-cloudflare .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e ANTHROPIC_API_KEY=your-api-key \
  claude-agent-sdk-cloudflare
```

### Test Agent

```bash
curl -X POST http://localhost:8080/run \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "reverse-engineering-docs-agent",
    "prompt": "https://github.com/axios/axios",
    "parameters": {
      "githubUrl": "https://github.com/axios/axios"
    }
  }'
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | - | Anthropic API key for Claude |
| `MODEL` | No | claude-sonnet-4-5-20250929 | Claude model to use |
| `PORT` | No | 8080 | Container port |

## Advanced Usage

### Custom System Prompt

You can customize the system prompt by editing `prompt.md` and rebuilding:

```bash
nano agents/reverse-engineering-docs-agent/prompt.md
npm run build
npm start
```

### Custom Configuration

Edit `config.json` to change agent behavior:

```json
{
  "maxTurns": 200,  // Increase for larger repos
  "defaultModel": "claude-sonnet-4-5-20250929"
}
```

### Accessing Generated Documentation

The documentation is generated in a temporary directory. To access it:

1. Mount a volume when running the container:
```bash
docker run -v /host/docs:/tmp/REVERSE_ENGINEERING_DOCS ...
```

2. Or copy files from the container:
```bash
docker cp container_id:/tmp/REVERSE_ENGINEERING_DOCS ./docs
```

## Best Practices

1. **Start Small** - Test with small repositories first
2. **Set Purpose** - Provide specific analysis goals for focused documentation
3. **Monitor Costs** - Watch token usage for large repositories
4. **Review Output** - Verify all 13 files are generated
5. **Public Repos** - Use public repositories for best results

## Support

For issues or questions:
- Check logs in the response object
- Verify GitHub URL format
- Ensure Git is installed
- Check network connectivity
- Review cost limits

## License

Part of the Claude Agent SDK Cloudflare project.
