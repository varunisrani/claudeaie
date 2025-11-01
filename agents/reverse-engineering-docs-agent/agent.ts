/**
 * Reverse Engineering Documentation Generator Agent
 * Adapter for Claude Agent SDK Cloudflare integration
 *
 * Analyzes GitHub repositories and generates comprehensive documentation
 */

import { BaseAgent, AgentContext, AgentResult, AgentLogEntry } from '../base-agent.js';
import { query, type Options as ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility - define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse GitHub URL to extract owner and repo name
 */
function parseGithubUrl(url: string): { owner: string; repo: string } {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/,
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?\?.*/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      let owner = match[1];
      let repo = match[2];
      // Remove .git suffix if present
      repo = repo.replace('.git', '');
      return { owner, repo };
    }
  }

  throw new Error(`Invalid GitHub URL format: ${url}`);
}

/**
 * Validate GitHub URL format
 */
function validateGithubUrl(url: string): boolean {
  const githubPatterns = [
    /^https?:\/\/github\.com\/[^/]+\/[^/]+\/?$/,
    /^https?:\/\/github\.com\/[^/]+\/[^/]+\.git$/,
    /^https?:\/\/github\.com\/[^/]+\/[^/]+\/?\?.*/,
    /^git@github\.com:[^/]+\/[^/]+\.git$/,
  ];

  return githubPatterns.some((pattern) => pattern.test(url));
}

interface DocGenerationData {
  githubUrl: string;
  purpose: string;
  owner: string;
  repo: string;
  session_id: string | null;
  message_count: number;
  tool_calls: Record<string, number>;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  errors: string[];
  files_generated: string[];
  workflow_steps_completed: string[];
  cost_tracking: {
    total_input_tokens: number;
    total_output_tokens: number;
    total_cache_creation_tokens: number;
    total_cache_read_tokens: number;
    total_cost_usd: number;
  };
}

export default class ReverseEngineeringDocsAgent extends BaseAgent {
  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const logs: AgentLogEntry[] = [];

    const addLog = (level: AgentLogEntry['level'], message: string, data?: any) => {
      const logEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        level,
        message,
        data
      };
      logs.push(logEntry);
      console.log(`[ReverseEngineeringDocsAgent] [${level.toUpperCase()}] ${message}`, data || '');
    };

    try {
      console.log('[ReverseEngineeringDocsAgent] ===== EXECUTE START =====');
      console.log('[ReverseEngineeringDocsAgent] Context:', {
        taskId: context.taskId,
        prompt: context.prompt?.substring(0, 100),
        hasApiKey: !!context.apiKey,
        model: context.model,
        baseUrl: context.baseUrl
      });

      addLog('info', 'Starting Reverse Engineering Documentation Generator', { taskId: context.taskId });

      // Parse parameters
      const githubUrl = context.parameters?.githubUrl || context.parameters?.url || context.prompt;
      const purpose = context.parameters?.purpose || context.parameters?.goal || 'Generate comprehensive documentation and architecture analysis';

      if (!githubUrl) {
        throw new Error('GitHub URL is required. Please provide a GitHub repository URL.');
      }

      addLog('info', `Target repository: ${githubUrl}`, { githubUrl, purpose });

      // Validate GitHub URL
      if (!validateGithubUrl(githubUrl)) {
        throw new Error(`Invalid GitHub URL format: ${githubUrl}. Expected format: https://github.com/owner/repo`);
      }

      // Parse GitHub URL
      let owner: string;
      let repo: string;

      try {
        const parsed = parseGithubUrl(githubUrl);
        owner = parsed.owner;
        repo = parsed.repo;
        addLog('info', `Parsed GitHub URL: owner=${owner}, repo=${repo}`);
      } catch (error) {
        throw new Error(`Failed to parse GitHub URL: ${error}`);
      }

      // Get prompt file path
      const promptFilePath = path.join(__dirname, 'prompt.md');
      const absolutePromptFilePath = path.resolve(promptFilePath);

      // Construct documentation generation prompt
      const docGenPrompt = `You are a Reverse Engineering Documentation Generator.

GitHub URL: ${githubUrl}
Purpose: ${purpose}
Repository Owner: ${owner}
Repository Name: ${repo}

Your task is to analyze this GitHub repository and generate comprehensive documentation following the complete 6-step workflow.

Execute ALL steps:
1. Prime: Analyze repository structure
2. Clone: Clone the repository locally
3. Analyze: Deep dive into codebase
4. Generate: Create all 13 documentation files
5. Format: Format documentation properly
6. Finalize: Add diagrams and cross-references

Generate ALL 13 markdown files in REVERSE_ENGINEERING_DOCS/ folder.`;

      addLog('info', 'Configured reverse engineering workflow');

      // Configure agent
      console.log('[ReverseEngineeringDocsAgent] Configuring Claude Agent SDK options...');
      const agentOptions: ClaudeAgentOptions = {
        maxTurns: this.config.maxTurns || 200,
        permissionMode: 'bypassPermissions',
        systemPrompt: `You are a Reverse Engineering Documentation Generator. Your ONLY job is to complete ALL 6 workflow steps. ` +
          `Read the file at: ${absolutePromptFilePath} ` +
          `Then follow ALL the instructions in that file exactly. ` +
          `CRITICAL: You MUST execute ALL steps: prime, clone, analyze, generate, format, AND finalize. ` +
          `DO NOT stop until all 13 markdown documentation files are generated. ` +
          `The GitHub URL is: ${githubUrl} ` +
          `The purpose is: ${purpose} ` +
          `The repository owner is: ${owner} ` +
          `The repository name is: ${repo}`
      };

      console.log('[ReverseEngineeringDocsAgent] Agent options configured:', {
        maxTurns: agentOptions.maxTurns,
        permissionMode: agentOptions.permissionMode,
        systemPromptLength: typeof agentOptions.systemPrompt === 'string' ? agentOptions.systemPrompt.length : 'preset'
      });

      // Documentation generation data storage
      const docData: DocGenerationData = {
        githubUrl,
        purpose,
        owner,
        repo,
        session_id: null,
        message_count: 0,
        tool_calls: {},
        start_time: new Date(),
        errors: [],
        files_generated: [],
        workflow_steps_completed: [],
        cost_tracking: {
          total_input_tokens: 0,
          total_output_tokens: 0,
          total_cache_creation_tokens: 0,
          total_cache_read_tokens: 0,
          total_cost_usd: 0.0
        }
      };

      addLog('info', 'Starting documentation generation session');
      console.log('[ReverseEngineeringDocsAgent] Calling query() from Claude Agent SDK...');

      // Execute documentation generation
      console.log('='.repeat(80));
      console.log('REVERSE ENGINEERING DOCUMENTATION GENERATOR');
      console.log('='.repeat(80));
      console.log(`GitHub URL: ${githubUrl}`);
      console.log(`Purpose: ${purpose}`);
      console.log(`Owner: ${owner}`);
      console.log(`Repository: ${repo}`);
      console.log(`Started: ${new Date().toLocaleString()}`);
      console.log('='.repeat(80));
      console.log('\n[STARTING DOCUMENTATION GENERATION]');
      console.log('-'.repeat(70));

      try {
        for await (const message of query({ prompt: docGenPrompt, options: agentOptions })) {
          docData.message_count++;

          // Capture session initialization
          if (message.type === 'system' && 'subtype' in message && message.subtype === 'init') {
            docData.session_id = message.session_id || null;

            console.log('\n[SESSION INITIALIZED]');
            console.log(`Session ID: ${docData.session_id}`);
            console.log(`Model: ${message.model || 'N/A'}`);
            console.log(`Available Tools: ${message.tools?.length || 0}`);
            console.log('-'.repeat(70));

            addLog('info', 'Session initialized', {
              sessionId: docData.session_id,
              model: message.model,
              toolCount: message.tools?.length || 0
            });
            continue;
          }

          // Log message details
          console.log(`\n[MESSAGE #${docData.message_count}]`);
          const messageType = message.type || 'Message';
          console.log(`Type: ${messageType}`);

          // Track cost with detailed display
          if (message.type === 'result' && 'usage' in message) {
            const usage = message.usage;
            if (usage) {
              const stepInputTokens = usage.input_tokens || 0;
              const stepOutputTokens = usage.output_tokens || 0;
              const stepCacheCreation = usage.cache_creation_input_tokens || 0;
              const stepCacheRead = usage.cache_read_input_tokens || 0;

              // Calculate cost (Sonnet 4.5 pricing)
              const inputCost = (stepInputTokens / 1_000_000) * 3.0;
              const outputCost = (stepOutputTokens / 1_000_000) * 15.0;
              const cacheCreationCost = (stepCacheCreation / 1_000_000) * 3.75;
              const cacheReadCost = (stepCacheRead / 1_000_000) * 0.30;
              const stepCost = inputCost + outputCost + cacheCreationCost + cacheReadCost;

              // Update totals
              docData.cost_tracking.total_input_tokens += stepInputTokens;
              docData.cost_tracking.total_output_tokens += stepOutputTokens;
              docData.cost_tracking.total_cache_creation_tokens += stepCacheCreation;
              docData.cost_tracking.total_cache_read_tokens += stepCacheRead;
              docData.cost_tracking.total_cost_usd += stepCost;

              // Display cost tracking
              console.log('\n' + '='.repeat(70));
              console.log(`COST TRACKING - STEP ${docData.message_count}`);
              console.log('='.repeat(70));
              console.log(`  Input Tokens:     ${stepInputTokens.toLocaleString()}`);
              console.log(`  Output Tokens:    ${stepOutputTokens.toLocaleString()}`);
              if (stepCacheCreation > 0) {
                console.log(`  Cache Creation:   ${stepCacheCreation.toLocaleString()}`);
              }
              if (stepCacheRead > 0) {
                console.log(`  Cache Read:       ${stepCacheRead.toLocaleString()}`);
              }
              console.log(`  Step Cost:        $${stepCost.toFixed(4)}`);
              console.log(`  Running Total:    $${docData.cost_tracking.total_cost_usd.toFixed(4)}`);
              console.log('='.repeat(70));

              addLog('info', 'Cost update', {
                inputTokens: stepInputTokens,
                outputTokens: stepOutputTokens,
                stepCost: stepCost,
                totalCost: docData.cost_tracking.total_cost_usd
              });
            }
          }

          // Process message content for detailed logging
          if (message.type === 'assistant' && 'message' in message && message.message.content) {
            const content = message.message.content;

            if (Array.isArray(content)) {
              console.log(`[BLOCKS]: ${content.length}`);

              for (let i = 0; i < content.length; i++) {
                const block = content[i];
                console.log(`\n--- Block ${i + 1}/${content.length} ---`);

                if (block.type === 'text' && block.text) {
                  console.log('  [TEXTBLOCK]');
                  console.log(`  Length: ${block.text.length} characters`);
                  const preview = block.text.substring(0, 200).replace(/\n/g, ' ');
                  console.log(`  Preview: ${preview}${block.text.length > 200 ? '...' : ''}`);
                } else if (block.type === 'thinking' && 'thinking' in block) {
                  console.log('  [THINKINGBLOCK]');
                  console.log(`  Length: ${block.thinking.length} characters`);
                } else if (block.type === 'tool_use') {
                  console.log('  [TOOLUSEBLOCK]');
                  console.log(`  Tool: ${block.name}`);
                  console.log(`  ID: ${block.id}`);

                  // Track tool usage
                  const toolName = block.name;
                  if (!docData.tool_calls[toolName]) {
                    docData.tool_calls[toolName] = 0;
                  }
                  docData.tool_calls[toolName]++;

                  // Show tool input details
                  if (block.input) {
                    if (toolName === 'Read') {
                      const filePath = block.input.file_path || 'unknown';
                      console.log(`  File: ${filePath}`);

                      // Track workflow step reading
                      if (filePath.includes('prompt.md')) {
                        console.log('  [READING WORKFLOW INSTRUCTIONS]');
                      }
                    } else if (toolName === 'Write') {
                      const filePath = block.input.file_path || 'unknown';
                      const contentLen = String(block.input.content || '').length;
                      console.log(`  File: ${filePath}`);
                      console.log(`  Content: ${contentLen} chars`);

                      // Track generated documentation files
                      if (filePath.endsWith('.md') && filePath.includes('REVERSE_ENGINEERING_DOCS')) {
                        docData.files_generated.push(filePath);
                        const filename = path.basename(filePath);
                        console.log(`  [DOCUMENTATION GENERATED]: ${filename}`);
                        addLog('success', `Generated documentation: ${filename}`, { filePath });
                      }
                    } else if (toolName === 'Bash') {
                      const command = block.input.command || 'unknown';
                      console.log(`  Command: ${command.substring(0, 100)}...`);

                      // Track specific operations
                      if (command.includes('git clone')) {
                        console.log('  [CLONING REPOSITORY]');
                        docData.workflow_steps_completed.push('clone');
                        addLog('info', 'Cloning repository', { command });
                      } else if (command.includes('mkdir') && command.includes('REVERSE_ENGINEERING_DOCS')) {
                        console.log('  [CREATING DOCUMENTATION FOLDER]');
                        addLog('info', 'Creating documentation folder');
                      }
                    } else if (toolName === 'TodoWrite') {
                      // Track todo progress
                      const todos = block.input.todos || [];
                      console.log(`  Todo Count: ${todos.length}`);

                      if (todos.length > 0) {
                        const completed = todos.filter((t: any) => t.status === 'completed').length;
                        const total = todos.length;
                        console.log(`  Progress: ${completed}/${total} completed`);

                        if (total > 0) {
                          const completionPercent = (completed / total) * 100;
                          console.log(`  Completion: ${completionPercent.toFixed(1)}%`);
                        }
                      }
                    }
                  }
                } else if (block.type === 'tool_result' && 'tool_use_id' in block) {
                  console.log('  [TOOLRESULTBLOCK]');
                  console.log(`  Tool ID: ${block.tool_use_id}`);

                  // Check for errors
                  if ('is_error' in block && block.is_error) {
                    console.log('  Status: ERROR');
                    docData.errors.push(String(block.content || 'Unknown error'));
                  } else {
                    console.log('  Status: SUCCESS');
                  }
                }
              }
            }
          }
        }
      } catch (queryError) {
        console.error('[ReverseEngineeringDocsAgent] Error during query() execution:', queryError);
        addLog('error', 'Query execution failed', {
          error: queryError instanceof Error ? queryError.message : String(queryError)
        });
        docData.errors.push(queryError instanceof Error ? queryError.message : String(queryError));
      }

      console.log('[ReverseEngineeringDocsAgent] Query loop completed');

      // Calculate execution time
      docData.end_time = new Date();
      docData.duration = (docData.end_time.getTime() - docData.start_time.getTime()) / 1000;

      const duration = Date.now() - startTime;

      // Print completion summary
      console.log('\n' + '='.repeat(80));
      console.log('DOCUMENTATION GENERATION COMPLETE');
      console.log('='.repeat(80));
      console.log(`GitHub URL: ${githubUrl}`);
      console.log(`Repository: ${owner}/${repo}`);
      console.log(`Session ID: ${docData.session_id}`);
      console.log(`Total Messages: ${docData.message_count}`);
      console.log(`Duration: ${docData.duration.toFixed(2)} seconds`);
      console.log(`Documentation Files Generated: ${docData.files_generated.length}`);
      console.log(`Workflow Steps Completed: ${docData.workflow_steps_completed.length}`);
      console.log(`Errors: ${docData.errors.length}`);

      if (docData.files_generated.length > 0) {
        console.log('\nGenerated Documentation Files:');
        for (const filePath of docData.files_generated) {
          const filename = path.basename(filePath);
          console.log(`  - ${filename}`);
        }
      }

      if (Object.keys(docData.tool_calls).length > 0) {
        console.log('\nTool Usage:');
        const sortedTools = Object.entries(docData.tool_calls).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [toolName, count] of sortedTools) {
          console.log(`  ${toolName}: ${count} calls`);
        }
      }

      // Print cost summary
      const costData = docData.cost_tracking;
      if (costData.total_input_tokens > 0) {
        console.log('\nCOST SUMMARY');
        console.log('-'.repeat(80));
        console.log(`Input Tokens: ${costData.total_input_tokens.toLocaleString()}`);
        console.log(`Output Tokens: ${costData.total_output_tokens.toLocaleString()}`);
        if (costData.total_cache_creation_tokens > 0) {
          console.log(`Cache Creation Tokens: ${costData.total_cache_creation_tokens.toLocaleString()}`);
        }
        if (costData.total_cache_read_tokens > 0) {
          console.log(`Cache Read Tokens: ${costData.total_cache_read_tokens.toLocaleString()}`);
        }
        console.log(`\nTotal Token Usage: ${(costData.total_input_tokens + costData.total_output_tokens).toLocaleString()}`);
        console.log(`TOTAL COST: $${costData.total_cost_usd.toFixed(4)} USD`);
        console.log('-'.repeat(80));
      }

      console.log('='.repeat(80));

      // Format response
      const response = `Reverse Engineering Documentation Generation Complete!

GitHub URL: ${githubUrl}
Repository: ${owner}/${repo}
Purpose: ${purpose}

Documentation Files Generated: ${docData.files_generated.length}/13
Workflow Steps Completed: ${docData.workflow_steps_completed.join(', ')}

Session ID: ${docData.session_id}
Duration: ${docData.duration.toFixed(2)}s
Total Cost: $${docData.cost_tracking.total_cost_usd.toFixed(4)}

Generated Files:
${docData.files_generated.map(f => `  - ${path.basename(f)}`).join('\n')}

Tool Usage:
${Object.entries(docData.tool_calls).map(([tool, count]) => `  - ${tool}: ${count} calls`).join('\n')}`;

      addLog('success', 'Documentation generation completed', {
        filesGenerated: docData.files_generated.length,
        duration: docData.duration,
        cost: docData.cost_tracking.total_cost_usd
      });

      console.log('[ReverseEngineeringDocsAgent] ===== EXECUTE SUCCESS =====');

      const result = {
        success: true,
        response,
        data: {
          githubUrl,
          owner,
          repo,
          purpose,
          files_generated: docData.files_generated,
          workflow_steps_completed: docData.workflow_steps_completed,
          tool_calls: docData.tool_calls,
          cost_tracking: docData.cost_tracking,
          session_id: docData.session_id
        },
        logs,
        metadata: {
          duration,
          tokensUsed: docData.cost_tracking.total_input_tokens + docData.cost_tracking.total_output_tokens,
          costUsd: docData.cost_tracking.total_cost_usd,
          toolCalls: docData.tool_calls
        }
      };

      console.log('[ReverseEngineeringDocsAgent] Returning result object');
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error('[ReverseEngineeringDocsAgent] ===== EXECUTE FAILED =====');
      console.error('[ReverseEngineeringDocsAgent] Error:', errorMessage);

      addLog('error', 'Documentation generation failed', { error: errorMessage });

      const errorResult = {
        success: false,
        error: errorMessage,
        logs,
        metadata: {
          duration
        }
      };

      console.log('[ReverseEngineeringDocsAgent] Returning error result');
      return errorResult;
    }
  }
}
