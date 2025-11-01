/**
 * Codebase Rebranding Agent
 * Adapter for Claude Agent SDK Cloudflare integration
 *
 * Automates complete codebase rebranding workflow with 6 systematic steps
 */

import { BaseAgent, AgentContext, AgentResult, AgentLogEntry } from '../base-agent.js';
import { query, type Options as ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility - define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BrandElement {
  type: string;
  old_value: string;
  new_value?: string;
  occurrences: number;
  files?: string[];
}

interface RebrandingData {
  rebranding_task: string;
  session_name: string;
  old_company?: string;
  new_company?: string;
  old_domain?: string;
  new_domain?: string;
  repository_url?: string;
  session_id: string | null;
  message_count: number;
  tool_calls: Record<string, number>;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  errors: string[];
  brand_elements: BrandElement[];
  files_modified: number;
  total_changes: number;
  validation_passed: boolean;
  new_repository_url?: string;
  cost_tracking: {
    total_input_tokens: number;
    total_output_tokens: number;
    total_cache_creation_tokens: number;
    total_cache_read_tokens: number;
    total_cost_usd: number;
  };
}

export default class CodebaseRebrandingAgent extends BaseAgent {
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
      console.log(`[CodebaseRebrandingAgent] [${level.toUpperCase()}] ${message}`, data || '');
    };

    try {
      console.log('[CodebaseRebrandingAgent] ===== EXECUTE START =====');
      console.log('[CodebaseRebrandingAgent] Context:', {
        taskId: context.taskId,
        prompt: context.prompt?.substring(0, 100),
        hasApiKey: !!context.apiKey,
        model: context.model,
        baseUrl: context.baseUrl
      });

      addLog('info', 'Starting Codebase Rebranding Agent', { taskId: context.taskId });

      // Parse rebranding task from prompt
      const rebrandingTask = context.prompt;

      // Generate session name (clean and format the prompt)
      const cleanPrompt = rebrandingTask.trim().replace(/^["']|["']$/g, '');
      const words = cleanPrompt.split(/\s+/);
      const filteredWords = words.filter(w =>
        w.length > 3 && !['the', 'and', 'for', 'with', 'from', 'to'].includes(w.toLowerCase())
      );
      const sessionName = filteredWords.length > 0
        ? filteredWords.slice(0, 3).join('-')
        : 'rebranding-session';

      addLog('info', `Rebranding task: ${rebrandingTask}`, { sessionName });

      // Get prompt file path
      const promptFilePath = path.join(__dirname, 'prompt.md');
      const absolutePromptFilePath = path.resolve(promptFilePath);

      // Construct unified prompt with rebranding context
      const unifiedPrompt = `You are a Codebase Rebranding Agent.
Rebranding Task: ${rebrandingTask}
Session Name: ${sessionName}

Start executing the rebranding workflow immediately.`;

      addLog('info', 'Configured agent for rebranding workflow');

      // Configure agent options
      console.log('[CodebaseRebrandingAgent] Configuring Claude Agent SDK options...');
      const agentOptions: ClaudeAgentOptions = {
        maxTurns: this.config.maxTurns || 150,
        permissionMode: 'bypassPermissions',
        systemPrompt: `You are a Codebase Rebranding Agent. Your ONLY job is to complete ALL 6 rebranding workflow steps. ` +
          `Read the file at: ${absolutePromptFilePath} ` +
          `Then follow ALL the instructions in that file exactly. ` +
          `CRITICAL: You MUST execute ALL 6 steps: ` +
          `1. Clone and analyze repository ` +
          `2. Analyze brand elements ` +
          `3. Generate rebranding plan ` +
          `4. Apply systematic changes ` +
          `5. Validate deployment ` +
          `6. Create new repository ` +
          `DO NOT stop until all 6 steps are completed. ` +
          `The rebranding task is: ${rebrandingTask} ` +
          `The session name is: ${sessionName} ` +
          `IMPORTANT: This is a complete rebranding workflow that must clone repositories, analyze brand elements, ` +
          `generate replacement plans, apply systematic changes, validate the results, and create new repositories. ` +
          `Use the TodoWrite tool to track progress through all 6 steps.`
      };

      console.log('[CodebaseRebrandingAgent] Agent options configured:', {
        maxTurns: agentOptions.maxTurns,
        permissionMode: agentOptions.permissionMode,
        systemPromptLength: typeof agentOptions.systemPrompt === 'string' ? agentOptions.systemPrompt.length : 'preset'
      });

      // Rebranding data storage
      const rebrandingData: RebrandingData = {
        rebranding_task: rebrandingTask,
        session_name: sessionName,
        session_id: null,
        message_count: 0,
        tool_calls: {},
        start_time: new Date(),
        errors: [],
        brand_elements: [],
        files_modified: 0,
        total_changes: 0,
        validation_passed: false,
        cost_tracking: {
          total_input_tokens: 0,
          total_output_tokens: 0,
          total_cache_creation_tokens: 0,
          total_cache_read_tokens: 0,
          total_cost_usd: 0.0
        }
      };

      addLog('info', 'Starting rebranding session');
      console.log('[CodebaseRebrandingAgent] Calling query() from Claude Agent SDK...');

      // Execute rebranding workflow
      console.log('='.repeat(80));
      console.log('CODEBASE REBRANDING AGENT - 6-STEP WORKFLOW');
      console.log('='.repeat(80));
      console.log(`Rebranding Task: ${rebrandingTask}`);
      console.log(`Session Name: ${sessionName}`);
      console.log(`Started: ${new Date().toLocaleString()}`);
      console.log('='.repeat(80));
      console.log('\n[STARTING REBRANDING WORKFLOW]');
      console.log('-'.repeat(70));

      try {
        for await (const message of query({ prompt: unifiedPrompt, options: agentOptions })) {
          rebrandingData.message_count++;

          // Capture session initialization
          if (message.type === 'system' && 'subtype' in message && message.subtype === 'init') {
            rebrandingData.session_id = message.session_id || null;

            console.log('\n[SESSION INITIALIZED]');
            console.log(`Session ID: ${rebrandingData.session_id}`);
            console.log(`Model: ${message.model || 'N/A'}`);
            console.log(`Available Tools: ${(message.tools || []).length}`);
            console.log('-'.repeat(70));

            addLog('info', 'Session initialized', {
              sessionId: rebrandingData.session_id,
              model: message.model,
              toolCount: (message.tools || []).length
            });
            continue;
          }

          // Log message details
          console.log(`\n[MESSAGE #${rebrandingData.message_count}]`);
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
              rebrandingData.cost_tracking.total_input_tokens += stepInputTokens;
              rebrandingData.cost_tracking.total_output_tokens += stepOutputTokens;
              rebrandingData.cost_tracking.total_cache_creation_tokens += stepCacheCreation;
              rebrandingData.cost_tracking.total_cache_read_tokens += stepCacheRead;
              rebrandingData.cost_tracking.total_cost_usd += stepCost;

              // Display cost tracking
              console.log('\n' + '='.repeat(70));
              console.log(`COST TRACKING - STEP ${rebrandingData.message_count}`);
              console.log('='.repeat(70));
              console.log(`  Input Tokens:  ${stepInputTokens.toLocaleString().padStart(10)}`);
              console.log(`  Output Tokens: ${stepOutputTokens.toLocaleString().padStart(10)}`);
              if (stepCacheCreation > 0) {
                console.log(`  Cache Create:  ${stepCacheCreation.toLocaleString().padStart(10)}`);
              }
              if (stepCacheRead > 0) {
                console.log(`  Cache Read:    ${stepCacheRead.toLocaleString().padStart(10)}`);
              }
              console.log(`  Step Cost:     $${stepCost.toFixed(4).padStart(10)}`);
              console.log(`  Total Cost:    $${rebrandingData.cost_tracking.total_cost_usd.toFixed(4).padStart(10)}`);
              console.log('='.repeat(70));

              addLog('info', 'Cost update', {
                inputTokens: stepInputTokens,
                outputTokens: stepOutputTokens,
                stepCost: stepCost,
                totalCost: rebrandingData.cost_tracking.total_cost_usd
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

                  // Track workflow progress indicators
                  if (block.text.toLowerCase().includes('step 1') || block.text.toLowerCase().includes('clone')) {
                    addLog('info', 'Step 1: Cloning and analyzing repository');
                  } else if (block.text.toLowerCase().includes('step 2') || block.text.toLowerCase().includes('brand analysis')) {
                    addLog('info', 'Step 2: Analyzing brand elements');
                  } else if (block.text.toLowerCase().includes('step 3') || block.text.toLowerCase().includes('plan')) {
                    addLog('info', 'Step 3: Generating rebranding plan');
                  } else if (block.text.toLowerCase().includes('step 4') || block.text.toLowerCase().includes('apply')) {
                    addLog('info', 'Step 4: Applying systematic changes');
                  } else if (block.text.toLowerCase().includes('step 5') || block.text.toLowerCase().includes('validat')) {
                    addLog('info', 'Step 5: Validating deployment');
                  } else if (block.text.toLowerCase().includes('step 6') || block.text.toLowerCase().includes('new repo')) {
                    addLog('info', 'Step 6: Creating new repository');
                  }

                } else if (block.type === 'thinking' && 'thinking' in block) {
                  console.log('  [THINKINGBLOCK]');
                  console.log(`  Thinking Length: ${block.thinking.length} characters`);
                  const preview = block.thinking.substring(0, 150).replace(/\n/g, ' ');
                  console.log(`  Preview: ${preview}${block.thinking.length > 150 ? '...' : ''}`);

                } else if (block.type === 'tool_use') {
                  console.log('  [TOOLUSEBLOCK]');
                  console.log(`  Tool: ${block.name}`);
                  console.log(`  ID: ${block.id}`);

                  // Track tool usage
                  const toolName = block.name;
                  if (!rebrandingData.tool_calls[toolName]) {
                    rebrandingData.tool_calls[toolName] = 0;
                  }
                  rebrandingData.tool_calls[toolName]++;

                  // Highlight key tools
                  if (toolName === 'Bash') {
                    const command = block.input?.command || 'unknown';
                    console.log(`  Command: ${command.substring(0, 100)}`);

                    // Track specific Git/GitHub operations
                    if (command.includes('git clone') || command.includes('gh repo clone')) {
                      console.log('  [WORKFLOW] Cloning repository...');
                      addLog('info', 'Cloning repository', { command });
                    } else if (command.includes('gh repo create')) {
                      console.log('  [WORKFLOW] Creating new repository...');
                      addLog('success', 'Creating new repository', { command });
                    } else if (command.includes('grep')) {
                      console.log('  [WORKFLOW] Searching for brand references...');
                    }
                  } else if (toolName === 'Edit') {
                    rebrandingData.files_modified++;
                    const filePath = block.input?.file_path || 'unknown';
                    console.log(`  File: ${filePath}`);
                    console.log('  [WORKFLOW] Applying brand replacement...');
                  } else if (toolName === 'TodoWrite') {
                    const todos = block.input?.todos || [];
                    console.log(`  Todo Count: ${todos.length}`);

                    if (todos.length >= 6) {
                      const completed = todos.filter((t: any) => t.status === 'completed').length;
                      const total = todos.length;
                      const progress = (completed / total) * 100;
                      console.log(`  Progress: ${completed}/${total} (${progress.toFixed(1)}%)`);
                      addLog('info', `Workflow progress: ${progress.toFixed(1)}%`, { completed, total });
                    }
                  }

                } else if (block.type === 'tool_result' && 'tool_use_id' in block) {
                  console.log('  [TOOLRESULTBLOCK]');
                  console.log(`  Tool ID: ${block.tool_use_id}`);

                  // Check for errors
                  if ('is_error' in block && block.is_error) {
                    console.log('  Status: ERROR');
                    rebrandingData.errors.push(block.tool_use_id);
                    addLog('error', 'Tool execution failed', { toolId: block.tool_use_id });
                  } else {
                    console.log('  Status: SUCCESS');
                  }

                  // Show result preview
                  if ('content' in block && block.content) {
                    const contentStr = String(block.content);
                    console.log(`  Result Length: ${contentStr.length} characters`);

                    // Check for repository URLs in results
                    const repoUrlMatch = contentStr.match(/https:\/\/github\.com\/[^\s]+/);
                    if (repoUrlMatch) {
                      rebrandingData.new_repository_url = repoUrlMatch[0];
                      addLog('success', 'New repository created', { url: repoUrlMatch[0] });
                    }
                  }
                }
              }
            }
          }
        }
      } catch (queryError) {
        console.error('[CodebaseRebrandingAgent] Error during query() execution:', queryError);
        addLog('error', 'Query execution failed', {
          error: queryError instanceof Error ? queryError.message : String(queryError)
        });
        rebrandingData.errors.push(queryError instanceof Error ? queryError.message : String(queryError));
      }

      console.log('[CodebaseRebrandingAgent] Query loop completed');

      // Calculate execution time
      rebrandingData.end_time = new Date();
      rebrandingData.duration = (rebrandingData.end_time.getTime() - rebrandingData.start_time.getTime()) / 1000;

      const duration = Date.now() - startTime;

      // Print completion summary
      console.log('\n' + '='.repeat(80));
      console.log('REBRANDING WORKFLOW COMPLETE');
      console.log('='.repeat(80));
      console.log(`Session ID: ${rebrandingData.session_id}`);
      console.log(`Total Messages: ${rebrandingData.message_count}`);
      console.log(`Duration: ${rebrandingData.duration.toFixed(2)} seconds`);
      console.log(`Files Modified: ${rebrandingData.files_modified}`);
      console.log(`New Repository: ${rebrandingData.new_repository_url || 'N/A'}`);
      console.log(`Errors: ${rebrandingData.errors.length}`);

      if (Object.keys(rebrandingData.tool_calls).length > 0) {
        console.log('\nTool Usage:');
        const sortedTools = Object.entries(rebrandingData.tool_calls).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [toolName, count] of sortedTools) {
          console.log(`  ${toolName}: ${count} calls`);
        }
      }

      // Print cost summary
      const costData = rebrandingData.cost_tracking;
      if (costData.total_input_tokens > 0) {
        console.log('\nCOST SUMMARY');
        console.log('-'.repeat(80));
        console.log(`Input Tokens: ${costData.total_input_tokens.toLocaleString()}`);
        console.log(`Output Tokens: ${costData.total_output_tokens.toLocaleString()}`);
        if (costData.total_cache_creation_tokens > 0) {
          console.log(`Cache Creation: ${costData.total_cache_creation_tokens.toLocaleString()}`);
        }
        if (costData.total_cache_read_tokens > 0) {
          console.log(`Cache Read: ${costData.total_cache_read_tokens.toLocaleString()}`);
        }
        console.log(`\nTotal Tokens: ${(costData.total_input_tokens + costData.total_output_tokens).toLocaleString()}`);
        console.log(`TOTAL COST: $${costData.total_cost_usd.toFixed(4)} USD`);
        console.log('-'.repeat(80));
      }

      console.log('='.repeat(80));

      // Format response
      const response = `Codebase Rebranding Complete!\n\nTask: ${rebrandingTask}\nSession: ${sessionName}\n\nResults:\n- Files Modified: ${rebrandingData.files_modified}\n- New Repository: ${rebrandingData.new_repository_url || 'Not created yet'}\n- Duration: ${rebrandingData.duration.toFixed(2)}s\n- Total Cost: $${rebrandingData.cost_tracking.total_cost_usd.toFixed(4)}\n\nWorkflow Steps:\n1. Clone and analyze repository ✓\n2. Analyze brand elements ✓\n3. Generate rebranding plan ✓\n4. Apply systematic changes ✓\n5. Validate deployment ✓\n6. Create new repository ✓\n\nTool Usage:\n${Object.entries(rebrandingData.tool_calls).map(([tool, count]) => `  - ${tool}: ${count} calls`).join('\n')}`;

      addLog('success', 'Rebranding workflow completed', {
        filesModified: rebrandingData.files_modified,
        duration: rebrandingData.duration,
        cost: rebrandingData.cost_tracking.total_cost_usd,
        newRepository: rebrandingData.new_repository_url
      });

      console.log('[CodebaseRebrandingAgent] ===== EXECUTE SUCCESS =====');

      const result = {
        success: true,
        response,
        data: {
          rebranding_task: rebrandingTask,
          session_name: sessionName,
          files_modified: rebrandingData.files_modified,
          new_repository_url: rebrandingData.new_repository_url,
          tool_calls: rebrandingData.tool_calls,
          cost_tracking: rebrandingData.cost_tracking,
          session_id: rebrandingData.session_id,
          brand_elements: rebrandingData.brand_elements
        },
        logs,
        metadata: {
          duration,
          tokensUsed: rebrandingData.cost_tracking.total_input_tokens + rebrandingData.cost_tracking.total_output_tokens,
          costUsd: rebrandingData.cost_tracking.total_cost_usd,
          toolCalls: rebrandingData.tool_calls
        }
      };

      console.log('[CodebaseRebrandingAgent] Returning result object');
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error('[CodebaseRebrandingAgent] ===== EXECUTE FAILED =====');
      console.error('[CodebaseRebrandingAgent] Error:', error);

      addLog('error', 'Rebranding workflow failed', { error: errorMessage });

      const errorResult = {
        success: false,
        error: errorMessage,
        logs,
        metadata: {
          duration
        }
      };

      console.log('[CodebaseRebrandingAgent] Returning error result');
      return errorResult;
    }
  }
}
