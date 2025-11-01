/**
 * Kiro Complete Workflow Agent
 * Adapter for Claude Agent SDK Cloudflare integration
 *
 * Executes complete software development workflow from requirements to implementation
 */

import { BaseAgent, AgentContext, AgentResult, AgentLogEntry } from '../base-agent.js';
import { query, type Options as ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility - define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TodoItem {
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  activeForm: string;
}

interface WorkflowData {
  project_description: string;
  spec_name: string;
  session_id: string | null;
  message_count: number;
  tool_calls: Record<string, number>;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  errors: string[];
  files_created: string[];
  todos: TodoItem[];
  cost_tracking: {
    total_input_tokens: number;
    total_output_tokens: number;
    total_cache_creation_tokens: number;
    total_cache_read_tokens: number;
    total_cost_usd: number;
  };
}

export default class KiroAgent extends BaseAgent {
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
      console.log(`[KiroAgent] [${level.toUpperCase()}] ${message}`, data || '');
    };

    try {
      console.log('[KiroAgent] ===== EXECUTE START =====');
      console.log('[KiroAgent] Context:', {
        taskId: context.taskId,
        prompt: context.prompt?.substring(0, 100),
        hasApiKey: !!context.apiKey,
        model: context.model,
        baseUrl: context.baseUrl
      });

      addLog('info', 'Starting Kiro Complete Workflow Agent', { taskId: context.taskId });

      // Parse project description
      const projectDescription = context.parameters?.description || context.prompt;

      // Generate spec name (remove quotes and special characters)
      const cleanPrompt = projectDescription.trim().replace(/['"]/g, '').toLowerCase();
      const words = cleanPrompt.split(/\s+/);
      const filteredWords = words.filter((w: string) => w.length > 3 && !['the', 'and', 'for', 'with'].includes(w));
      const specName = filteredWords.length > 0 ? filteredWords.slice(0, 3).join('-') : 'custom-spec';

      addLog('info', `Generated spec name: ${specName}`, { projectDescription, specName });

      // Get prompt file path
      const promptFilePath = path.join(__dirname, 'prompt.md');
      const absolutePromptFilePath = path.resolve(promptFilePath);

      // Construct workflow prompt
      const workflowPrompt = `You are a Kiro workflow executor.

Project: ${projectDescription}
Spec Name: ${specName}

Start executing the Kiro workflow immediately following ALL instructions in the prompt file.`;

      addLog('info', 'Configured agent for complete workflow execution');

      // Configure agent
      console.log('[KiroAgent] Configuring Claude Agent SDK options...');
      const agentOptions: ClaudeAgentOptions = {
        maxTurns: this.config.maxTurns || 150,
        permissionMode: 'bypassPermissions',
        systemPrompt: `You are a Kiro workflow executor. Your ONLY job is to complete ALL 6 Kiro workflow steps. ` +
          `Read the file at: ${absolutePromptFilePath} ` +
          `Then follow ALL the instructions in that file exactly. ` +
          `CRITICAL: You MUST execute ALL 6 steps: Prime → Spec Init → Spec Requirements → Spec Design → Spec Tasks → Spec Implementation. ` +
          `DO NOT stop until Spec Implementation is completed with ALL files created. ` +
          `The project is: ${projectDescription} ` +
          `The spec name is: ${specName}`
      };

      console.log('[KiroAgent] Agent options configured:', {
        maxTurns: agentOptions.maxTurns,
        permissionMode: agentOptions.permissionMode,
        systemPromptLength: typeof agentOptions.systemPrompt === 'string' ? agentOptions.systemPrompt.length : 'preset'
      });

      // Workflow data storage
      const workflowData: WorkflowData = {
        project_description: projectDescription,
        spec_name: specName,
        session_id: null,
        message_count: 0,
        tool_calls: {},
        start_time: new Date(),
        errors: [],
        files_created: [],
        todos: [],
        cost_tracking: {
          total_input_tokens: 0,
          total_output_tokens: 0,
          total_cache_creation_tokens: 0,
          total_cache_read_tokens: 0,
          total_cost_usd: 0.0
        }
      };

      addLog('info', 'Starting workflow session');
      console.log('[KiroAgent] Calling query() from Claude Agent SDK...');

      // Execute workflow query
      console.log('='.repeat(80));
      console.log('KIRO COMPLETE WORKFLOW AGENT');
      console.log('='.repeat(80));
      console.log(`Project: ${projectDescription}`);
      console.log(`Spec Name: ${specName}`);
      console.log(`Started: ${new Date().toLocaleString()}`);
      console.log('='.repeat(80));
      console.log('\n[STARTING WORKFLOW SESSION]');
      console.log('-'.repeat(70));

      try {
        for await (const message of query({ prompt: workflowPrompt, options: agentOptions })) {
          workflowData.message_count++;

          // Capture session initialization
          if (message.type === 'system' && 'subtype' in message && message.subtype === 'init') {
            workflowData.session_id = message.session_id || null;

            console.log('\n[SESSION INITIALIZED]');
            console.log(`Session ID: ${workflowData.session_id}`);
            console.log(`Model: ${message.model || 'N/A'}`);
            console.log(`Available Tools: ${message.tools?.length || 0}`);
            console.log('-'.repeat(70));

            addLog('info', 'Session initialized', {
              sessionId: workflowData.session_id,
              model: message.model,
              toolCount: message.tools?.length || 0
            });
            continue;
          }

          // Log message details
          console.log(`\n[MESSAGE #${workflowData.message_count}]`);
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
              workflowData.cost_tracking.total_input_tokens += stepInputTokens;
              workflowData.cost_tracking.total_output_tokens += stepOutputTokens;
              workflowData.cost_tracking.total_cache_creation_tokens += stepCacheCreation;
              workflowData.cost_tracking.total_cache_read_tokens += stepCacheRead;
              workflowData.cost_tracking.total_cost_usd += stepCost;

              // Display cost tracking
              console.log('\n' + '='.repeat(70));
              console.log(`COST TRACKING - STEP ${workflowData.message_count}`);
              console.log('='.repeat(70));
              console.log(`  Input Tokens:  ${stepInputTokens.toLocaleString()}`);
              console.log(`  Output Tokens: ${stepOutputTokens.toLocaleString()}`);
              if (stepCacheCreation > 0) {
                console.log(`  Cache Creation: ${stepCacheCreation.toLocaleString()}`);
              }
              if (stepCacheRead > 0) {
                console.log(`  Cache Read: ${stepCacheRead.toLocaleString()}`);
              }
              console.log(`  Step Cost: $${stepCost.toFixed(4)}`);
              console.log(`  Running Total: $${workflowData.cost_tracking.total_cost_usd.toFixed(4)}`);
              console.log('='.repeat(70));

              addLog('info', 'Cost update', {
                inputTokens: stepInputTokens,
                outputTokens: stepOutputTokens,
                stepCost: stepCost,
                totalCost: workflowData.cost_tracking.total_cost_usd
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
                  console.log(`  Thinking Length: ${block.thinking.length} characters`);
                  const preview = block.thinking.substring(0, 150).replace(/\n/g, ' ');
                  console.log(`  Preview: ${preview}${block.thinking.length > 150 ? '...' : ''}`);

                } else if (block.type === 'tool_use') {
                  console.log('  [TOOLUSEBLOCK]');
                  console.log(`  Tool: ${block.name}`);
                  console.log(`  ID: ${block.id}`);

                  // Track tool usage
                  const toolName = block.name;
                  if (!workflowData.tool_calls[toolName]) {
                    workflowData.tool_calls[toolName] = 0;
                  }
                  workflowData.tool_calls[toolName]++;

                  // Show tool input details
                  if (block.input) {
                    console.log(`  Input Keys: ${Object.keys(block.input).join(', ')}`);

                    if (toolName === 'TodoWrite') {
                      // Track todo progress
                      const todos = block.input.todos as TodoItem[] || [];
                      workflowData.todos = todos;

                      console.log(`  Todo Count: ${todos.length}`);

                      if (todos.length === 10) {
                        console.log('  [CORRECT TODO LIST - 10 ITEMS]');
                      }

                      // Calculate progress
                      if (todos.length > 0) {
                        const completed = todos.filter(t => t.status === 'completed').length;
                        const inProgress = todos.filter(t => t.status === 'in_progress').length;
                        const pending = todos.filter(t => t.status === 'pending').length;
                        const total = todos.length;

                        console.log(`  Progress: ${completed}/${total} completed, ${inProgress} in progress`);
                        console.log('  [TODO PROGRESS]:');
                        console.log('  ' + '-'.repeat(70));

                        for (let j = 0; j < todos.length; j++) {
                          const todo = todos[j];
                          const statusIcon = todo.status === 'completed' ? '[DONE]' :
                                           todo.status === 'in_progress' ? '[WIP]' : '[TODO]';
                          let todoContent = todo.content ?? 'Unknown task';
                          if (todoContent.length > 80) {
                            todoContent = todoContent.substring(0, 77) + '...';
                          }
                          console.log(`  ${(j + 1).toString().padStart(2)}. ${statusIcon} ${todoContent}`);
                        }

                        console.log('  ' + '-'.repeat(70));

                        if (total > 0) {
                          const completionPercent = (completed / total) * 100;
                          console.log(`  Completion: ${completionPercent.toFixed(1)}%`);
                        }

                        addLog('info', 'Todo progress update', {
                          completed,
                          inProgress,
                          pending,
                          total,
                          completionPercent: total > 0 ? (completed / total) * 100 : 0
                        });
                      }

                    } else if (toolName === 'Write') {
                      const filePath = block.input.file_path || 'unknown';
                      const blockContent = String(block.input.content || '');
                      console.log(`  File: ${filePath}`);
                      console.log(`  Content Length: ${blockContent.length} characters`);

                      // Track file creation
                      workflowData.files_created.push(filePath);

                      // Highlight workflow step files
                      if (filePath.includes('prime-analysis.md')) {
                        console.log('  [STEP 1 - PRIME ANALYSIS FILE CREATED]');
                        addLog('success', 'Prime analysis document created', { file: filePath });
                      } else if (filePath.includes('spec.md')) {
                        console.log('  [STEP 2 - SPEC INIT FILE CREATED]');
                        addLog('success', 'Spec file created', { file: filePath });
                      } else if (filePath.includes('requirements.md')) {
                        console.log('  [STEP 3 - REQUIREMENTS FILE CREATED]');
                        addLog('success', 'Requirements document created', { file: filePath });
                      } else if (filePath.includes('design.md')) {
                        console.log('  [STEP 4 - DESIGN FILE CREATED]');
                        addLog('success', 'Design document created', { file: filePath });
                      } else if (filePath.includes('tasks.md')) {
                        console.log('  [STEP 5 - TASKS FILE CREATED]');
                        addLog('success', 'Tasks document created', { file: filePath });
                      } else if (filePath.includes('src/') || filePath.includes('lib/') ||
                                 filePath.includes('tests/') || filePath.includes('README.md')) {
                        console.log('  [STEP 6 - IMPLEMENTATION FILE CREATED]');
                        addLog('success', 'Implementation file created', { file: filePath });
                      }

                    } else if (toolName === 'Read') {
                      const filePath = block.input.file_path || 'unknown';
                      console.log(`  File: ${filePath}`);

                    } else if (toolName === 'Bash') {
                      const command = block.input.command || 'unknown';
                      console.log(`  Command: ${command}`);
                    }
                  }

                } else if (block.type === 'tool_result' && 'tool_use_id' in block) {
                  console.log('  [TOOLRESULTBLOCK]');
                  console.log(`  Tool ID: ${block.tool_use_id}`);

                  // Check for errors
                  if ('is_error' in block && block.is_error) {
                    console.log('  Status: ERROR');
                    workflowData.errors.push(block.tool_use_id);
                    addLog('error', 'Tool execution error', { toolId: block.tool_use_id });
                  } else {
                    console.log('  Status: SUCCESS');
                  }

                  // Show result details
                  if ('content' in block && block.content) {
                    const contentStr = String(block.content);
                    console.log(`  Result Length: ${contentStr.length} characters`);
                  }

                } else {
                  console.log(`  Type: ${block.type} (Unknown)`);
                }
              }
            }
          }
        }
      } catch (queryError) {
        console.error('[KiroAgent] Error during query() execution:', queryError);
        console.error('[KiroAgent] Error type:', queryError instanceof Error ? queryError.constructor.name : typeof queryError);
        console.error('[KiroAgent] Error message:', queryError instanceof Error ? queryError.message : String(queryError));

        addLog('error', 'Query execution failed', {
          error: queryError instanceof Error ? queryError.message : String(queryError),
          errorType: queryError instanceof Error ? queryError.constructor.name : typeof queryError
        });

        workflowData.errors.push(queryError instanceof Error ? queryError.message : String(queryError));
      }

      console.log('[KiroAgent] Query loop completed');

      // Calculate execution time
      workflowData.end_time = new Date();
      workflowData.duration = (workflowData.end_time.getTime() - workflowData.start_time.getTime()) / 1000;

      const duration = Date.now() - startTime;

      // Print completion summary
      console.log('\n' + '='.repeat(80));
      console.log('WORKFLOW EXECUTION COMPLETE');
      console.log('='.repeat(80));
      console.log(`Session ID: ${workflowData.session_id}`);
      console.log(`Total Messages: ${workflowData.message_count}`);
      console.log(`Duration: ${workflowData.duration.toFixed(2)} seconds`);
      console.log(`Files Created: ${workflowData.files_created.length}`);
      console.log(`Errors: ${workflowData.errors.length}`);

      if (workflowData.files_created.length > 0) {
        console.log('\nFiles Created:');
        for (const file of workflowData.files_created) {
          console.log(`  - ${file}`);
        }
      }

      if (Object.keys(workflowData.tool_calls).length > 0) {
        console.log('\nTool Usage:');
        const sortedTools = Object.entries(workflowData.tool_calls).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [toolName, count] of sortedTools) {
          console.log(`  ${toolName}: ${count} calls`);
        }
      }

      // Print cost summary
      const costData = workflowData.cost_tracking;
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

      // Check workflow completion
      const todosCompleted = workflowData.todos.filter(t => t.status === 'completed').length;
      const todosTotal = workflowData.todos.length;
      const completionPercent = todosTotal > 0 ? (todosCompleted / todosTotal) * 100 : 0;

      console.log('\nWorkflow Status:');
      console.log(`Todos Completed: ${todosCompleted}/${todosTotal} (${completionPercent.toFixed(1)}%)`);
      console.log('='.repeat(80));

      // Format response
      const response = `Kiro Workflow Complete!\n\nProject: ${projectDescription}\nSpec Name: ${specName}\n\nFiles Created: ${workflowData.files_created.length}\nWorkflow Progress: ${todosCompleted}/${todosTotal} tasks (${completionPercent.toFixed(1)}%)\n\nSession ID: ${workflowData.session_id}\nDuration: ${workflowData.duration.toFixed(2)}s\nTotal Cost: $${workflowData.cost_tracking.total_cost_usd.toFixed(4)}\n\nTool Usage:\n${Object.entries(workflowData.tool_calls).map(([tool, count]) => `  - ${tool}: ${count} calls`).join('\n')}\n\nCreated Files:\n${workflowData.files_created.map(f => `  - ${f}`).join('\n')}`;

      addLog('success', 'Workflow completed', {
        filesCreated: workflowData.files_created.length,
        todosCompleted,
        todosTotal,
        completionPercent,
        duration: workflowData.duration,
        cost: workflowData.cost_tracking.total_cost_usd
      });

      console.log('[KiroAgent] ===== EXECUTE SUCCESS =====');
      console.log('[KiroAgent] Result:', {
        filesCreated: workflowData.files_created.length,
        sessionId: workflowData.session_id,
        duration: workflowData.duration,
        totalCost: workflowData.cost_tracking.total_cost_usd,
        logCount: logs.length,
        errorCount: workflowData.errors.length
      });

      const result = {
        success: true,
        response,
        data: {
          project_description: projectDescription,
          spec_name: specName,
          files_created: workflowData.files_created,
          todos_completed: todosCompleted,
          todos_total: todosTotal,
          completion_percent: completionPercent,
          tool_calls: workflowData.tool_calls,
          cost_tracking: workflowData.cost_tracking,
          session_id: workflowData.session_id
        },
        logs,
        metadata: {
          duration,
          tokensUsed: workflowData.cost_tracking.total_input_tokens + workflowData.cost_tracking.total_output_tokens,
          costUsd: workflowData.cost_tracking.total_cost_usd,
          toolCalls: workflowData.tool_calls
        }
      };

      console.log('[KiroAgent] Returning result object');
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error('[KiroAgent] ===== EXECUTE FAILED =====');
      console.error('[KiroAgent] Top-level error caught:', error);
      console.error('[KiroAgent] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[KiroAgent] Error message:', errorMessage);
      console.error('[KiroAgent] Error stack:', error instanceof Error ? error.stack : 'No stack');

      addLog('error', 'Workflow failed', { error: errorMessage });

      const errorResult = {
        success: false,
        error: errorMessage,
        logs,
        metadata: {
          duration
        }
      };

      console.log('[KiroAgent] Returning error result');
      return errorResult;
    }
  }
}
