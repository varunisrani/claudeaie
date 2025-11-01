/**
 * Frontend Code Analysis Agent
 * Adapter for Claude Agent SDK Cloudflare integration
 *
 * Analyzes React/Vue/Angular/Next.js applications and generates comprehensive Playwright test plans
 */

import { BaseAgent, AgentContext, AgentResult, AgentLogEntry } from '../base-agent.js';
import { query, type Options as ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility - define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AnalysisData {
  frontendFolder: string;
  outputFolder: string;
  filesAnalyzed: string[];
  componentsFound: string[];
  pagesFound: string[];
  documentsGenerated: string[];
  session_id: string | null;
  message_count: number;
  tool_calls: Record<string, number>;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  errors: string[];
  cost_tracking: {
    total_input_tokens: number;
    total_output_tokens: number;
    total_cache_creation_tokens: number;
    total_cache_read_tokens: number;
    total_cost_usd: number;
  };
}

export default class FrontendCodeAnalysisAgent extends BaseAgent {
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
      console.log(`[FrontendCodeAnalysisAgent] [${level.toUpperCase()}] ${message}`, data || '');
    };

    try {
      console.log('[FrontendCodeAnalysisAgent] ===== EXECUTE START =====');
      console.log('[FrontendCodeAnalysisAgent] Context:', {
        taskId: context.taskId,
        prompt: context.prompt?.substring(0, 100),
        hasApiKey: !!context.apiKey,
        model: context.model,
        baseUrl: context.baseUrl
      });

      addLog('info', 'Starting Frontend Code Analysis Agent', { taskId: context.taskId });

      // Parse parameters
      const frontendFolder = context.parameters?.frontendFolder || context.parameters?.path || '';
      const outputFolder = context.parameters?.outputFolder || 'test_plan_output';

      if (!frontendFolder) {
        throw new Error('Frontend folder path is required. Please provide frontendFolder parameter.');
      }

      addLog('info', `Analyzing frontend folder: ${frontendFolder}`, { frontendFolder, outputFolder });

      // Get prompt file path and commands directory
      const promptFilePath = path.join(__dirname, 'prompt.md');
      const absolutePromptFilePath = path.resolve(promptFilePath);
      const commandsDir = path.join(__dirname, 'commands');
      const absoluteCommandsDir = path.resolve(commandsDir);

      // Resolve frontend folder path
      const frontendFolderAbs = path.resolve(frontendFolder);

      // Construct analysis prompt
      const analysisPrompt = `You are a Frontend Code Analysis & Test Plan Generation Agent.

FRONTEND FOLDER TO ANALYZE: ${frontendFolderAbs}

YOUR MISSION:
1. Analyze the frontend codebase structure and components
2. Map all pages, routes, and user flows
3. Identify interactive elements and components
4. Generate comprehensive test plans for Playwright agents
5. Create detailed testing specifications

Output Folder: ${outputFolder}

Read the instructions from the prompt file and execute the complete analysis workflow.`;

      addLog('info', 'Configured agent for frontend analysis');

      // Configure agent with system prompt
      console.log('[FrontendCodeAnalysisAgent] Configuring Claude Agent SDK options...');
      const agentOptions: ClaudeAgentOptions = {
        maxTurns: this.config.maxTurns || 100,
        permissionMode: 'bypassPermissions',
        systemPrompt: (
          `You are a Frontend Code Analysis & Test Plan Generation Agent. ` +
          `FRONTEND FOLDER: ${frontendFolderAbs} ` +
          `Read the prompt file at: ${absolutePromptFilePath} ` +
          `The prompt file will instruct you to read command files from: ${absoluteCommandsDir} ` +
          `Read each command file in sequence (step1 through step5) and follow ALL instructions exactly. ` +
          `CRITICAL STEPS: ` +
          `1. Analyze frontend codebase structure in: ${frontendFolderAbs} ` +
          `2. Map pages, routes, and user flows ` +
          `3. Identify components and interactive elements ` +
          `4. Create comprehensive test plan for Playwright agents ` +
          `YOU MUST generate complete ANALYSIS DOCUMENTS and TEST PLANS ` +
          `Output to: ${outputFolder} ` +
          `DO NOT stop until complete analysis and test plan is generated.`
        )
      };

      console.log('[FrontendCodeAnalysisAgent] Agent options configured:', {
        maxTurns: agentOptions.maxTurns,
        permissionMode: agentOptions.permissionMode,
        systemPromptLength: typeof agentOptions.systemPrompt === 'string' ? agentOptions.systemPrompt.length : 'preset'
      });

      // Analysis data storage
      const analysisData: AnalysisData = {
        frontendFolder: frontendFolderAbs,
        outputFolder,
        filesAnalyzed: [],
        componentsFound: [],
        pagesFound: [],
        documentsGenerated: [],
        session_id: null,
        message_count: 0,
        tool_calls: {},
        start_time: new Date(),
        errors: [],
        cost_tracking: {
          total_input_tokens: 0,
          total_output_tokens: 0,
          total_cache_creation_tokens: 0,
          total_cache_read_tokens: 0,
          total_cost_usd: 0.0
        }
      };

      addLog('info', 'Starting analysis session');
      console.log('[FrontendCodeAnalysisAgent] Calling query() from Claude Agent SDK...');

      // Execute analysis query
      console.log('='.repeat(80));
      console.log('FRONTEND CODE ANALYSIS & TEST PLAN GENERATION AGENT');
      console.log('='.repeat(80));
      console.log(`Frontend Folder: ${frontendFolderAbs}`);
      console.log(`Output Folder: ${outputFolder}`);
      console.log(`Started: ${new Date().toLocaleString()}`);
      console.log('='.repeat(80));
      console.log('\n[STARTING ANALYSIS SESSION]');
      console.log('-'.repeat(70));

      try {
        for await (const message of query({ prompt: analysisPrompt, options: agentOptions })) {
          analysisData.message_count++;

          // Capture session initialization
          if (message.type === 'system' && 'subtype' in message && message.subtype === 'init') {
            analysisData.session_id = message.session_id || null;

            console.log('\n[SESSION INITIALIZED]');
            console.log(`Session ID: ${analysisData.session_id}`);
            console.log(`Model: ${message.model || 'N/A'}`);
            console.log(`Available Tools: ${message.tools?.length || 0}`);
            console.log('-'.repeat(70));

            addLog('info', 'Session initialized', {
              sessionId: analysisData.session_id,
              model: message.model,
              toolCount: message.tools?.length || 0
            });
            continue;
          }

          // Log message details
          console.log(`\n[MESSAGE #${analysisData.message_count}]`);
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
              analysisData.cost_tracking.total_input_tokens += stepInputTokens;
              analysisData.cost_tracking.total_output_tokens += stepOutputTokens;
              analysisData.cost_tracking.total_cache_creation_tokens += stepCacheCreation;
              analysisData.cost_tracking.total_cache_read_tokens += stepCacheRead;
              analysisData.cost_tracking.total_cost_usd += stepCost;

              // Display cost tracking
              console.log('\n' + '='.repeat(70));
              console.log(`COST TRACKING - STEP ${analysisData.message_count}`);
              console.log('='.repeat(70));
              console.log(`Input Tokens: ${stepInputTokens.toLocaleString()}`);
              console.log(`Output Tokens: ${stepOutputTokens.toLocaleString()}`);
              if (stepCacheCreation > 0) {
                console.log(`Cache Creation: ${stepCacheCreation.toLocaleString()}`);
              }
              if (stepCacheRead > 0) {
                console.log(`Cache Read: ${stepCacheRead.toLocaleString()}`);
              }
              console.log(`Step Cost: $${stepCost.toFixed(4)}`);
              console.log(`Total Cost: $${analysisData.cost_tracking.total_cost_usd.toFixed(4)}`);
              console.log('='.repeat(70));

              addLog('info', 'Cost update', {
                inputTokens: stepInputTokens,
                outputTokens: stepOutputTokens,
                stepCost: stepCost,
                totalCost: analysisData.cost_tracking.total_cost_usd
              });
            }
          }

          // Process message content for tracking
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
                } else if (block.type === 'tool_use') {
                  console.log('  [TOOLUSEBLOCK]');
                  console.log(`  Tool: ${block.name}`);
                  console.log(`  ID: ${block.id}`);

                  // Track tool usage
                  const toolName = block.name;
                  if (!analysisData.tool_calls[toolName]) {
                    analysisData.tool_calls[toolName] = 0;
                  }
                  analysisData.tool_calls[toolName]++;

                  // Track file operations
                  if (block.input) {
                    if (toolName === 'Read') {
                      const filePath = block.input.file_path || 'unknown';
                      console.log(`  File: ${filePath}`);
                      analysisData.filesAnalyzed.push(filePath);

                      if (filePath.includes('.tsx') || filePath.includes('.jsx') || filePath.includes('.vue')) {
                        analysisData.componentsFound.push(filePath);
                      }
                      if (filePath.includes('routes') || filePath.includes('router') || filePath.includes('page')) {
                        analysisData.pagesFound.push(filePath);
                      }
                    } else if (toolName === 'Write') {
                      const filePath = block.input.file_path || 'unknown';
                      console.log(`  File: ${filePath}`);
                      if (filePath.endsWith('.md')) {
                        console.log('  [GENERATING DOCUMENT]');
                        analysisData.documentsGenerated.push(filePath);
                        addLog('success', `Generated document: ${path.basename(filePath)}`);
                      }
                    } else if (toolName === 'TodoWrite') {
                      const todos = block.input.todos || [];
                      if (todos.length > 0) {
                        const completed = todos.filter((t: any) => t.status === 'completed').length;
                        console.log(`  Todo Progress: ${completed}/${todos.length} completed`);
                      }
                    }
                  }
                } else if (block.type === 'tool_result' && 'tool_use_id' in block) {
                  console.log('  [TOOLRESULTBLOCK]');
                  console.log(`  Tool ID: ${block.tool_use_id}`);
                  if ('is_error' in block && block.is_error) {
                    console.log('  Status: ERROR');
                    analysisData.errors.push(block.tool_use_id);
                  } else {
                    console.log('  Status: SUCCESS');
                  }
                }
              }
            }
          }
        }
      } catch (queryError) {
        console.error('[FrontendCodeAnalysisAgent] Error during query() execution:', queryError);
        console.error('[FrontendCodeAnalysisAgent] Error type:', queryError instanceof Error ? queryError.constructor.name : typeof queryError);
        console.error('[FrontendCodeAnalysisAgent] Error message:', queryError instanceof Error ? queryError.message : String(queryError));

        addLog('error', 'Query execution failed', {
          error: queryError instanceof Error ? queryError.message : String(queryError),
          errorType: queryError instanceof Error ? queryError.constructor.name : typeof queryError
        });

        analysisData.errors.push(queryError instanceof Error ? queryError.message : String(queryError));
      }

      console.log('[FrontendCodeAnalysisAgent] Query loop completed');

      // Calculate execution time
      analysisData.end_time = new Date();
      analysisData.duration = (analysisData.end_time.getTime() - analysisData.start_time.getTime()) / 1000;

      const duration = Date.now() - startTime;

      // Print completion summary
      console.log('\n' + '='.repeat(80));
      console.log('FRONTEND CODE ANALYSIS COMPLETE');
      console.log('='.repeat(80));
      console.log(`Session ID: ${analysisData.session_id}`);
      console.log(`Total Messages: ${analysisData.message_count}`);
      console.log(`Duration: ${analysisData.duration.toFixed(2)} seconds`);
      console.log(`Files Analyzed: ${analysisData.filesAnalyzed.length}`);
      console.log(`Components Found: ${analysisData.componentsFound.length}`);
      console.log(`Pages Found: ${analysisData.pagesFound.length}`);
      console.log(`Documents Generated: ${analysisData.documentsGenerated.length}`);
      console.log(`Errors: ${analysisData.errors.length}`);

      if (Object.keys(analysisData.tool_calls).length > 0) {
        console.log('\nTool Usage:');
        const sortedTools = Object.entries(analysisData.tool_calls).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [toolName, count] of sortedTools) {
          console.log(`  ${toolName}: ${count} calls`);
        }
      }

      // Print cost summary
      const costData = analysisData.cost_tracking;
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

      console.log('\nGenerated Documents:');
      if (analysisData.documentsGenerated.length > 0) {
        analysisData.documentsGenerated.forEach((doc, idx) => {
          console.log(`  ${idx + 1}. ${path.basename(doc)}`);
        });
      } else {
        console.log('  No documents generated yet');
      }

      console.log('='.repeat(80));

      // Format response
      const response = `Frontend Code Analysis Complete!\n\nFrontend Folder: ${frontendFolderAbs}\nOutput Folder: ${outputFolder}\n\nAnalysis Results:\n- Files Analyzed: ${analysisData.filesAnalyzed.length}\n- Components Found: ${analysisData.componentsFound.length}\n- Pages Found: ${analysisData.pagesFound.length}\n- Documents Generated: ${analysisData.documentsGenerated.length}\n\nGenerated Documents:\n${analysisData.documentsGenerated.map(d => `  - ${path.basename(d)}`).join('\n')}\n\nSession ID: ${analysisData.session_id}\nDuration: ${analysisData.duration.toFixed(2)}s\nTotal Cost: $${analysisData.cost_tracking.total_cost_usd.toFixed(4)}\n\nTool Usage:\n${Object.entries(analysisData.tool_calls).map(([tool, count]) => `  - ${tool}: ${count} calls`).join('\n')}`;

      addLog('success', 'Analysis completed', {
        filesAnalyzed: analysisData.filesAnalyzed.length,
        documentsGenerated: analysisData.documentsGenerated.length,
        duration: analysisData.duration,
        cost: analysisData.cost_tracking.total_cost_usd
      });

      console.log('[FrontendCodeAnalysisAgent] ===== EXECUTE SUCCESS =====');
      console.log('[FrontendCodeAnalysisAgent] Result:', {
        filesAnalyzed: analysisData.filesAnalyzed.length,
        documentsGenerated: analysisData.documentsGenerated.length,
        sessionId: analysisData.session_id,
        duration: analysisData.duration,
        totalCost: analysisData.cost_tracking.total_cost_usd,
        logCount: logs.length,
        errorCount: analysisData.errors.length
      });

      const result = {
        success: true,
        response,
        data: {
          frontendFolder: frontendFolderAbs,
          outputFolder,
          filesAnalyzed: analysisData.filesAnalyzed.length,
          componentsFound: analysisData.componentsFound.length,
          pagesFound: analysisData.pagesFound.length,
          documentsGenerated: analysisData.documentsGenerated,
          tool_calls: analysisData.tool_calls,
          cost_tracking: analysisData.cost_tracking,
          session_id: analysisData.session_id
        },
        logs,
        metadata: {
          duration,
          tokensUsed: analysisData.cost_tracking.total_input_tokens + analysisData.cost_tracking.total_output_tokens,
          costUsd: analysisData.cost_tracking.total_cost_usd,
          toolCalls: analysisData.tool_calls
        }
      };

      console.log('[FrontendCodeAnalysisAgent] Returning result object');
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error('[FrontendCodeAnalysisAgent] ===== EXECUTE FAILED =====');
      console.error('[FrontendCodeAnalysisAgent] Top-level error caught:', error);
      console.error('[FrontendCodeAnalysisAgent] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[FrontendCodeAnalysisAgent] Error message:', errorMessage);
      console.error('[FrontendCodeAnalysisAgent] Error stack:', error instanceof Error ? error.stack : 'No stack');

      addLog('error', 'Analysis failed', { error: errorMessage });

      const errorResult = {
        success: false,
        error: errorMessage,
        logs,
        metadata: {
          duration
        }
      };

      console.log('[FrontendCodeAnalysisAgent] Returning error result');
      return errorResult;
    }
  }
}
