# Reverse Engineering Documentation Generator Agent

Analyzes any GitHub repository and generates comprehensive documentation with 13+ markdown files covering architecture, API, components, database schema, features, setup guide, and white-labeling strategy.

## Features

- **Automated Repository Analysis**: Clones and analyzes any GitHub repository
- **Comprehensive Documentation**: Generates 13+ markdown files covering all aspects
- **Architecture Diagrams**: Includes Mermaid diagrams for visualization
- **Complete Workflow**: 6-step process from cloning to finalization
- **Cross-Referenced**: All documentation files are properly linked
- **Cost Tracking**: Real-time token usage and cost analysis

## Usage

### Basic Usage

```typescript
import ReverseEngineeringDocsAgent from './agents/reverse-engineering-docs-agent/agent.js';
import config from './agents/reverse-engineering-docs-agent/config.json';

const agent = new ReverseEngineeringDocsAgent(config);

const result = await agent.execute({
  taskId: 'doc-gen-1',
  prompt: 'https://github.com/owner/repo',
  parameters: {
    githubUrl: 'https://github.com/owner/repo',
    purpose: 'Generate comprehensive documentation'
  },
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-5-20250929'
});

console.log(result.response);
console.log(`Generated ${result.data.files_generated.length} documentation files`);
```

### Via Container API

```bash
curl -X POST http://localhost:8787/api/agents/execute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "agentId": "reverse-engineering-docs-agent",
    "prompt": "https://github.com/facebook/react",
    "parameters": {
      "githubUrl": "https://github.com/facebook/react",
      "purpose": "Document React architecture and component system"
    }
  }'
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `githubUrl` | string | Yes | GitHub repository URL (https://github.com/owner/repo) |
| `purpose` | string | No | Analysis goal or focus area (default: comprehensive documentation) |

## Workflow Steps

The agent executes a complete 6-step workflow:

### 1. Prime - Repository Analysis
- Parse GitHub URL
- Validate Git availability
- Identify tech stack
- Analyze repository structure

### 2. Clone - Repository Cloning
- Clone repository to temporary directory
- Verify clone success
- Get repository statistics

### 3. Analyze - Codebase Analysis
- Deep dive into project structure
- Analyze dependencies
- Map component relationships
- Identify API endpoints
- Analyze database schema

### 4. Generate - Documentation Generation
Creates 13 markdown files:
- `README.md` - Documentation index
- `01_PROJECT_OVERVIEW.md` - Project summary
- `02_ARCHITECTURE.md` - System architecture
- `03_API_DOCUMENTATION.md` - Complete API reference
- `04_FRONTEND_ANALYSIS.md` - Frontend structure
- `05_BACKEND_ANALYSIS.md` - Backend architecture
- `06_DATABASE_SCHEMA.md` - Database design
- `07_COMPONENTS.md` - Component documentation
- `08_FEATURES.md` - Feature mapping
- `09_DEPENDENCIES.md` - Dependency analysis
- `10_HOW_IT_WORKS.md` - System flows
- `11_SETUP_GUIDE.md` - Local setup instructions
- `12_REVERSE_ENGINEERING_STRATEGY.md` - Recreation guide
- `13_WHITE_LABEL_GUIDE.md` - White-labeling strategy

### 5. Format - Documentation Formatting
- Ensure proper markdown syntax
- Add consistent headers
- Format code blocks
- Create internal links

### 6. Finalize - Enhancement
- Add Mermaid diagrams
- Add cross-references
- Validate all links
- Generate final summary

## Output Structure

```
REVERSE_ENGINEERING_DOCS/
├── README.md
├── 01_PROJECT_OVERVIEW.md
├── 02_ARCHITECTURE.md
├── 03_API_DOCUMENTATION.md
├── 04_FRONTEND_ANALYSIS.md
├── 05_BACKEND_ANALYSIS.md
├── 06_DATABASE_SCHEMA.md
├── 07_COMPONENTS.md
├── 08_FEATURES.md
├── 09_DEPENDENCIES.md
├── 10_HOW_IT_WORKS.md
├── 11_SETUP_GUIDE.md
├── 12_REVERSE_ENGINEERING_STRATEGY.md
└── 13_WHITE_LABEL_GUIDE.md
```

## Example Result

```json
{
  "success": true,
  "response": "Reverse Engineering Documentation Generation Complete!\n\nGitHub URL: https://github.com/facebook/react\nRepository: facebook/react\nPurpose: Document React architecture\n\nDocumentation Files Generated: 13/13\nWorkflow Steps Completed: prime, clone, analyze, generate, format, finalize\n\nDuration: 245.67s\nTotal Cost: $0.8234",
  "data": {
    "githubUrl": "https://github.com/facebook/react",
    "owner": "facebook",
    "repo": "react",
    "files_generated": [
      "/tmp/REVERSE_ENGINEERING_DOCS/README.md",
      "/tmp/REVERSE_ENGINEERING_DOCS/01_PROJECT_OVERVIEW.md",
      ...
    ],
    "workflow_steps_completed": ["prime", "clone", "analyze", "generate", "format", "finalize"],
    "cost_tracking": {
      "total_input_tokens": 125000,
      "total_output_tokens": 45000,
      "total_cost_usd": 0.8234
    }
  }
}
```

## Features

### Mermaid Diagrams
The agent automatically generates Mermaid diagrams for:
- System architecture
- Data flow sequences
- Entity-Relationship diagrams (for databases)

### Cross-References
All documentation files include proper cross-references using markdown links, making navigation seamless.

### Real-Time Progress
The agent provides real-time updates during execution:
- Step progress indicators
- File generation notifications
- Token usage and cost tracking

## Configuration

See `config.json` for agent metadata:

```json
{
  "id": "reverse-engineering-docs-agent",
  "name": "Reverse Engineering Docs Generator",
  "maxTurns": 200,
  "defaultModel": "claude-sonnet-4-5-20250929"
}
```

## Cost Estimation

Typical cost for analyzing a medium-sized repository (5000-10000 files):
- Input tokens: ~100,000-150,000
- Output tokens: ~40,000-60,000
- Estimated cost: $0.60-$1.20 USD

## Requirements

- Git must be available on the system
- Network access to clone GitHub repositories
- Sufficient disk space for repository cloning
- ANTHROPIC_API_KEY environment variable

## Error Handling

The agent handles common errors:
- Invalid GitHub URL format
- Repository not accessible
- Git not available
- Network connectivity issues
- Insufficient permissions

## Best Practices

1. **URL Format**: Use HTTPS format (https://github.com/owner/repo)
2. **Purpose**: Provide specific analysis goals for focused documentation
3. **Public Repos**: Works best with public repositories
4. **Repository Size**: Large repositories (>100MB) may take longer

## Limitations

- Only supports GitHub repositories
- Requires Git to be installed
- Public repositories work best
- Very large repositories may timeout
- Generated documentation is in English

## Support

For issues or questions:
1. Check the logs in the result object
2. Verify GitHub URL format
3. Ensure Git is installed and accessible
4. Check network connectivity

## License

Part of the Claude Agent SDK Cloudflare project.
