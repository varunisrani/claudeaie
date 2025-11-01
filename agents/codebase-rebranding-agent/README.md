# Codebase Rebranding Agent

Automates complete codebase rebranding with intelligent analysis and systematic replacement. Handles company names, domains, colors, assets, and repository creation through a comprehensive 6-step workflow.

## Overview

The Codebase Rebranding Agent is a sophisticated automation tool that executes complete codebase rebranding from one brand identity to another. It combines intelligent analysis, systematic replacement, and comprehensive validation to ensure high-quality results.

## Features

- **Complete Automation**: 6-step workflow from repository cloning to new repository creation
- **Intelligent Analysis**: AI-powered brand element detection and mapping
- **Systematic Replacement**: Context-aware updates with backup and rollback capability
- **Comprehensive Validation**: Build verification, syntax checking, link validation
- **GitHub Integration**: Uses GitHub CLI for repository operations
- **Cost Tracking**: Real-time token usage and cost monitoring
- **Progress Tracking**: TodoWrite integration for workflow visibility

## Workflow Steps

### Step 1: Clone and Analyze Repository
- Clones target repository
- Analyzes file structure and technology stack
- Creates comprehensive repository metadata
- Identifies all file types and configurations

### Step 2: Analyze Brand Elements
- Scans codebase for brand references
- Identifies company names, domains, emails
- Detects colors, assets, and social media handles
- Creates comprehensive brand inventory
- Performs risk assessment

### Step 3: Generate Rebranding Plan
- Collects new brand information from user
- Creates replacement mapping (old → new)
- Generates execution strategy with priorities
- Plans phased approach for safe execution

### Step 4: Apply Systematic Changes
- Creates backup before changes
- Applies replacements in priority order:
  1. Configuration files
  2. Source code
  3. Documentation
  4. Assets
  5. Metadata
- Tracks all changes in detailed log
- Commits changes to git

### Step 5: Validate Deployment
- Validates syntax and build
- Checks for remaining old references
- Validates links and URLs
- Creates comprehensive validation report
- Ensures zero errors before delivery

### Step 6: Create New Repository
- Creates new GitHub repository
- Updates git remote configuration
- Creates initial release
- Generates delivery documentation
- Provides complete rebranding summary

## Usage

### Basic Example

```typescript
// Using the container API
const response = await fetch('http://localhost:8787/api/agent/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'codebase-rebranding-agent',
    prompt: 'Rebrand my repository https://github.com/oldcompany/app from OldCompany to NewCompany with domain newcompany.com',
    apiKey: 'your-anthropic-api-key'
  })
});
```

### Example Prompts

#### Complete Company Rebranding
```
Rebrand my repository https://github.com/oldcompany/app from OldCompany to NewCompany with domain newcompany.com
```

#### Domain Migration
```
Change my domain from oldcompany.com to newcompany.com across all files and configurations
```

#### Visual Identity Update
```
Update company colors from #FF5733 to #3B82F6 and replace all logos with new branding
```

#### Email Address Updates
```
Update all email addresses from @oldcompany.com to @newcompany.com
```

## Prerequisites

- **GitHub CLI** (`gh`) installed and authenticated
- Git installed and configured
- Access to the repository to rebrand
- GitHub account with repository creation permissions

### GitHub CLI Setup

```bash
# Install GitHub CLI
# Visit: https://cli.github.com/

# Authenticate
gh auth login

# Verify authentication
gh auth status
```

## Configuration

The agent configuration is in `config.json`:

```json
{
  "id": "codebase-rebranding-agent",
  "name": "Codebase Rebranding Agent",
  "maxTurns": 150,
  "defaultModel": "claude-sonnet-4-5-20250929"
}
```

## Output Files

The agent generates several output files during execution:

### repo-metadata.json
```json
{
  "repository_url": "https://github.com/oldcompany/app",
  "clone_path": "/path/to/repo",
  "total_files": 150,
  "file_types": { "javascript": 45, "typescript": 30 },
  "technologies": ["react", "nodejs"]
}
```

### brand-inventory.json
```json
{
  "company_names": { "OldCompany": 45, "oldcompany": 23 },
  "domains": { "oldcompany.com": 67 },
  "emails": { "contact@oldcompany.com": 5 },
  "total_references": 198
}
```

### rebranding-plan.json
```json
{
  "company_name": {
    "OldCompany": "NewCompany",
    "oldcompany": "newcompany"
  },
  "domain": {
    "oldcompany.com": "newcompany.com"
  }
}
```

### validation-report.json
```json
{
  "timestamp": "2025-11-01T12:45:00Z",
  "syntax_valid": true,
  "build_passed": true,
  "old_references_remaining": 0,
  "validation_passed": true
}
```

### rebranding-summary.md
Complete summary of all changes made, new repository information, and next steps.

## Error Handling

### Common Issues

**GitHub CLI Not Found**
```bash
# Install from: https://cli.github.com/
gh --version
```

**Authentication Errors**
```bash
gh auth login
gh auth status
```

**Permission Errors**
```bash
# Ensure you have permissions to:
# - Clone the source repository
# - Create new repositories
# - Push to repositories
```

### Safety Measures

- **Automatic Backup**: Creates backup branch before changes
- **Validation**: Comprehensive testing before delivery
- **Rollback Capability**: Can restore from backup if needed
- **Progressive Application**: Changes applied in safe order
- **Risk Assessment**: Identifies high-risk changes upfront

## Tool Usage

The agent uses these tools during execution:

- **TodoWrite**: Track workflow progress
- **Bash**: Git operations, GitHub CLI, grep searches
- **Grep**: Search for brand references
- **Read**: Read files for analysis
- **Edit**: Apply brand replacements
- **Write**: Create output files
- **AskUserQuestion**: Collect missing information

## Cost Tracking

The agent provides real-time cost tracking:

```
COST SUMMARY
Input Tokens: 125,000
Output Tokens: 45,000
Total Tokens: 170,000
TOTAL COST: $0.4200 USD
```

Cost is calculated based on Claude Sonnet 4.5 pricing:
- Input: $3.00 per million tokens
- Output: $15.00 per million tokens
- Cache creation: $3.75 per million tokens
- Cache read: $0.30 per million tokens

## Success Criteria

A successful rebranding includes:

- ✓ All 6 workflow steps completed
- ✓ Repository cloned and analyzed
- ✓ Brand elements comprehensively identified
- ✓ Rebranding plan generated with user input
- ✓ All changes applied systematically
- ✓ Validation passed with zero old references
- ✓ New repository created on GitHub
- ✓ Complete documentation provided

## Limitations

- Requires GitHub CLI authentication
- Cannot rebrand binary files (images, compiled assets)
- Limited to Git-based repositories
- Requires manual asset replacement for logos/images
- Cannot update external services (DNS, email servers)

## Next Steps After Rebranding

1. Review the new repository
2. Test application functionality
3. Update external services:
   - DNS records
   - Email server configuration
   - SSL certificates
   - CDN settings
4. Deploy to production
5. Communicate changes to users/stakeholders
6. Archive old repository

## Architecture

The agent follows the BaseAgent pattern:

```typescript
export default class CodebaseRebrandingAgent extends BaseAgent {
  async execute(context: AgentContext): Promise<AgentResult> {
    // Execute 6-step workflow
    // Track costs and progress
    // Return comprehensive results
  }
}
```

## Integration

This agent is part of the Claude Agent SDK Cloudflare project and integrates seamlessly with the container environment:

```typescript
// Container automatically loads agents from agents/ directory
// Access via API:
POST /api/agent/execute
{
  "agentId": "codebase-rebranding-agent",
  "prompt": "Your rebranding task here",
  "apiKey": "your-api-key"
}
```

## Development

### File Structure
```
codebase-rebranding-agent/
├── agent.ts          # Main agent implementation
├── config.json       # Agent configuration
├── prompt.md         # Complete workflow instructions
└── README.md         # This file
```

### Extending the Agent

To add custom rebranding logic:

1. Edit `prompt.md` to add new workflow steps
2. Update `agent.ts` to track new metrics
3. Modify `config.json` if needed (maxTurns, etc.)
4. Test thoroughly with sample repositories

## Support

For issues or questions:

1. Check the [Error Handling](#error-handling) section
2. Verify GitHub CLI authentication
3. Review the workflow steps in `prompt.md`
4. Check container logs for detailed execution traces

## License

Part of the Claude Agent SDK Cloudflare project.

## Version

1.0.0 - Initial release with complete 6-step workflow automation
