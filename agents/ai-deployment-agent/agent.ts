/**
 * AI Deployment Agent
 * Adapter for Claude Agent SDK Cloudflare integration
 *
 * Automates GitHub repository setup and Vercel deployment with intelligent build error fixing
 */

import { BaseAgent, AgentContext, AgentResult, AgentLogEntry } from '../base-agent.js';
import { query, type Options as ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility - define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DeploymentData {
  project_name: string;
  github_url?: string;
  framework?: string;
  env_vars?: Record<string, string>;
  mode: 'NEW' | 'EXISTING' | 'UNKNOWN';
  session_id: string | null;
  message_count: number;
  tool_calls: Record<string, number>;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  errors: string[];
  deployment_url?: string;
  repository_url?: string;
  build_time?: number;
  cost_tracking: {
    total_input_tokens: number;
    total_output_tokens: number;
    total_cache_creation_tokens: number;
    total_cache_read_tokens: number;
    total_cost_usd: number;
  };
  workflow_steps: {
    prime: boolean;
    'detect-project': boolean;
    'setup-github': boolean;
    'setup-vercel': boolean;
    'build-deploy': boolean;
    'monitor-fix': boolean;
  };
}

interface Message {
  type?: string;
  role?: string;
  content?: any;
  message?: any;
  subtype?: string;
  data?: any;
  session_id?: string;
  model?: string;
  tools?: string[];
  stop_reason?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

interface ContentBlock {
  type: string;
  text?: string;
  thinking?: string;
  signature?: string;
  name?: string;
  id?: string;
  input?: Record<string, any>;
  tool_use_id?: string;
  content?: any;
  is_error?: boolean;
}

export default class AiDeploymentAgent extends BaseAgent {
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
      console.log(`[AiDeploymentAgent] [${level.toUpperCase()}] ${message}`, data || '');
    };

    try {
      console.log('[AiDeploymentAgent] ===== EXECUTE START =====');
      console.log('[AiDeploymentAgent] Context:', {
        taskId: context.taskId,
        prompt: context.prompt?.substring(0, 100),
        hasApiKey: !!context.apiKey,
        model: context.model,
        baseUrl: context.baseUrl
      });

      addLog('info', 'Starting AI Deployment Agent', { taskId: context.taskId });

      // Parse parameters
      const projectName = context.parameters?.project_name || context.parameters?.projectName || 'ai-deployment-project';
      const githubUrl = context.parameters?.github_url || context.parameters?.githubUrl;
      const framework = context.parameters?.framework;
      const envVars = context.parameters?.env_vars || context.parameters?.envVars;

      addLog('info', `Deployment project: ${projectName}`, {
        projectName,
        githubUrl,
        framework,
        hasEnvVars: !!envVars
      });

      // Get prompt file path
      const promptFilePath = path.join(__dirname, 'prompt.md');
      const absolutePromptFilePath = path.resolve(promptFilePath);

      // Construct deployment prompt
      const deploymentPrompt = `You are an AI Deployment Agent. Your task is to:

1. Execute the complete 6-step deployment workflow for: "${context.prompt}"
2. Project details:
   - Project Name: ${projectName}
   ${githubUrl ? `- GitHub URL: ${githubUrl}` : '- Mode: NEW project (no existing repository)'}
   ${framework ? `- Framework: ${framework}` : ''}
   ${envVars ? `- Environment Variables: ${Object.keys(envVars).length} variables provided` : ''}

3. Follow ALL steps in sequence:
   - Step 1: Environment Analysis (verify gh, vercel, npm, git)
   - Step 2: Project Detection (determine NEW vs EXISTING)
   - Step 3: GitHub Setup (create/clone repository)
   - Step 4: Vercel Setup (create/link project)
   - Step 5: Build & Deploy (with intelligent error fixing)
   - Step 6: Monitor & Fix (health checks and fixes)

4. Use TodoWrite to track progress through all 6 steps
5. Apply automatic fixes for any build or deployment errors
6. Return the final deployment URL and status

Start the workflow now.`;

      addLog('info', 'Configured deployment workflow');

      // Configure agent
      console.log('[AiDeploymentAgent] Configuring Claude Agent SDK options...');
      const agentOptions: ClaudeAgentOptions = {
        maxTurns: this.config.maxTurns || 150,
        permissionMode: 'bypassPermissions',
        systemPrompt: `You are an AI Deployment Agent workflow executor. Your ONLY job is to complete ALL 6 deployment workflow steps. ` +
          `Read the file at: ${absolutePromptFilePath} ` +
          `Then follow ALL the instructions in that file exactly. ` +
          `CRITICAL: You MUST execute ALL 6 steps: prime (environment analysis), detect-project, setup-github, setup-vercel, build-deploy, AND monitor-fix. ` +
          `DO NOT stop until monitor-fix is completed. ` +
          `Apply automatic fixes for any errors encountered. ` +
          `The deployment project is: ${context.prompt} ` +
          `Project name: ${projectName}${githubUrl ? ` | GitHub URL: ${githubUrl}` : ''}`
      };

      console.log('[AiDeploymentAgent] Agent options configured:', {
        maxTurns: agentOptions.maxTurns,
        permissionMode: agentOptions.permissionMode,
        systemPromptLength: typeof agentOptions.systemPrompt === 'string' ? agentOptions.systemPrompt.length : 'preset'
      });

      // Deployment data storage
      const deploymentData: DeploymentData = {
        project_name: projectName,
        github_url: githubUrl,
        framework,
        env_vars: envVars,
        mode: 'UNKNOWN',
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
        },
        workflow_steps: {
          prime: false,
          'detect-project': false,
          'setup-github': false,
          'setup-vercel': false,
          'build-deploy': false,
          'monitor-fix': false
        }
      };

      addLog('info', 'Starting deployment session');
      console.log('[AiDeploymentAgent] Calling query() from Claude Agent SDK...');

      // Execute deployment workflow
      console.log('='.repeat(80));
      console.log('AI DEPLOYMENT AGENT - AUTOMATED GITHUB & VERCEL DEPLOYMENT');
      console.log('='.repeat(80));
      console.log(`Project: ${projectName}`);
      console.log(`Mode: ${githubUrl ? 'EXISTING' : 'NEW'}`);
      console.log(`Started: ${new Date().toLocaleString()}`);
      console.log('='.repeat(80));
      console.log('\n[STARTING DEPLOYMENT SESSION]');
      console.log('-'.repeat(70));

      try {
        for await (const message of query({ prompt: deploymentPrompt, options: agentOptions })) {
          deploymentData.message_count++;

          // Capture session initialization
          if (message.type === 'system' && message.subtype === 'init') {
            deploymentData.session_id = message.session_id || null;

            console.log('\n[SESSION INITIALIZED]');
            console.log(`Session ID: ${deploymentData.session_id}`);
            console.log(`Model: ${message.model || 'N/A'}`);

            const tools = message.tools || [];
            console.log(`Available Tools: ${tools.length}`);

            console.log('-'.repeat(70));

            addLog('info', 'Session initialized', {
              sessionId: deploymentData.session_id,
              model: message.model,
              toolCount: tools.length
            });
            continue;
          }

          // Log message details
          console.log(`\n[MESSAGE #${deploymentData.message_count}]`);
          const messageType = message.type || 'Message';
          console.log(`Type: ${messageType}`);

          // Track cost
          if (message.type === 'result' && message.usage) {
            const usage = message.usage;
            const stepInputTokens = usage.input_tokens || 0;
            const stepOutputTokens = usage.output_tokens || 0;
            const stepCacheCreation = usage.cache_creation_input_tokens || 0;
            const stepCacheRead = usage.cache_read_input_tokens || 0;

            // Calculate cost (Sonnet 3.5 pricing)
            const inputCost = (stepInputTokens / 1_000_000) * 3.0;
            const outputCost = (stepOutputTokens / 1_000_000) * 15.0;
            const cacheCreationCost = (stepCacheCreation / 1_000_000) * 3.75;
            const cacheReadCost = (stepCacheRead / 1_000_000) * 0.30;
            const stepCost = inputCost + outputCost + cacheCreationCost + cacheReadCost;

            // Update totals
            deploymentData.cost_tracking.total_input_tokens += stepInputTokens;
            deploymentData.cost_tracking.total_output_tokens += stepOutputTokens;
            deploymentData.cost_tracking.total_cache_creation_tokens += stepCacheCreation;
            deploymentData.cost_tracking.total_cache_read_tokens += stepCacheRead;
            deploymentData.cost_tracking.total_cost_usd += stepCost;

            // Display cost tracking
            console.log('\n💰 COST TRACKING');
            console.log(`Input: ${stepInputTokens.toLocaleString()} | Output: ${stepOutputTokens.toLocaleString()}`);
            console.log(`Step Cost: $${stepCost.toFixed(4)} | Total: $${deploymentData.cost_tracking.total_cost_usd.toFixed(4)}`);

            addLog('info', 'Cost update', {
              inputTokens: stepInputTokens,
              outputTokens: stepOutputTokens,
              stepCost: stepCost,
              totalCost: deploymentData.cost_tracking.total_cost_usd
            });
          }

          // Process message content
          if (message.type === 'assistant' && message.message?.content) {
            const content = message.message.content;

            if (Array.isArray(content)) {
              console.log(`[BLOCKS]: ${content.length}`);

              for (let i = 0; i < content.length; i++) {
                const block = content[i] as ContentBlock;
                console.log(`\n--- Block ${i + 1}/${content.length} ---`);

                if (block.type === 'text' && block.text) {
                  console.log('  [TEXTBLOCK]');
                  const preview = block.text.substring(0, 200).replace(/\n/g, ' ');
                  console.log(`  Preview: ${preview}${block.text.length > 200 ? '...' : ''}`);

                  // Extract deployment URL if present
                  const urlMatch = block.text.match(/https:\/\/[a-z0-9-]+\.vercel\.app/i);
                  if (urlMatch) {
                    deploymentData.deployment_url = urlMatch[0];
                    addLog('success', `Deployment URL found: ${urlMatch[0]}`);
                  }

                  // Extract GitHub URL if present
                  const githubMatch = block.text.match(/https:\/\/github\.com\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+/);
                  if (githubMatch) {
                    deploymentData.repository_url = githubMatch[0];
                    addLog('success', `Repository URL found: ${githubMatch[0]}`);
                  }

                  // Detect project mode
                  if (block.text.toLowerCase().includes('mode: new') || block.text.toLowerCase().includes('new project')) {
                    deploymentData.mode = 'NEW';
                  } else if (block.text.toLowerCase().includes('mode: existing') || block.text.toLowerCase().includes('existing project')) {
                    deploymentData.mode = 'EXISTING';
                  }
                } else if (block.type === 'thinking' && block.thinking) {
                  console.log('  [THINKINGBLOCK]');
                  const preview = block.thinking.substring(0, 150).replace(/\n/g, ' ');
                  console.log(`  Preview: ${preview}${block.thinking.length > 150 ? '...' : ''}`);
                } else if (block.type === 'tool_use' && block.name) {
                  console.log('  [TOOLUSEBLOCK]');
                  console.log(`  Tool: ${block.name}`);
                  console.log(`  ID: ${block.id}`);

                  // Track tool usage
                  const toolName = block.name;
                  if (!deploymentData.tool_calls[toolName]) {
                    deploymentData.tool_calls[toolName] = 0;
                  }
                  deploymentData.tool_calls[toolName]++;

                  // Show tool input details
                  if (block.input) {
                    console.log(`  Input Keys: ${Object.keys(block.input).join(', ')}`);

                    // Track workflow step progress via Bash commands
                    if (toolName === 'Bash' && block.input.command) {
                      const command = block.input.command as string;
                      console.log(`  Command: ${command.substring(0, 80)}...`);

                      if (command.includes('gh --version') || command.includes('vercel --version')) {
                        deploymentData.workflow_steps.prime = true;
                        console.log('  ✅ WORKFLOW STEP 1/6: PRIME (Environment Analysis)');
                      } else if (command.includes('gh repo view') || command.includes('git ls-remote')) {
                        deploymentData.workflow_steps['detect-project'] = true;
                        console.log('  ✅ WORKFLOW STEP 2/6: DETECT-PROJECT');
                      } else if (command.includes('gh repo create') || command.includes('git clone')) {
                        deploymentData.workflow_steps['setup-github'] = true;
                        console.log('  ✅ WORKFLOW STEP 3/6: SETUP-GITHUB');
                      } else if (command.includes('vercel link') || command.includes('vercel project')) {
                        deploymentData.workflow_steps['setup-vercel'] = true;
                        console.log('  ✅ WORKFLOW STEP 4/6: SETUP-VERCEL');
                      } else if (command.includes('npm install') || command.includes('vercel --prod')) {
                        deploymentData.workflow_steps['build-deploy'] = true;
                        console.log('  ✅ WORKFLOW STEP 5/6: BUILD-DEPLOY');
                      } else if (command.includes('curl') && command.includes('vercel.app')) {
                        deploymentData.workflow_steps['monitor-fix'] = true;
                        console.log('  ✅ WORKFLOW STEP 6/6: MONITOR-FIX');
                      }
                    } else if (toolName === 'TodoWrite' && block.input.todos) {
                      const todos = block.input.todos as Array<{ content: string; status: string }>;
                      console.log(`  Todo Count: ${todos.length}`);

                      const completed = todos.filter(t => t.status === 'completed').length;
                      const total = todos.length;
                      console.log(`  Progress: ${completed}/${total} completed (${((completed/total)*100).toFixed(1)}%)`);
                    }
                  }
                } else if (block.type === 'tool_result' && block.tool_use_id) {
                  console.log('  [TOOLRESULTBLOCK]');
                  console.log(`  Tool ID: ${block.tool_use_id}`);

                  if (block.is_error) {
                    const errorContent = String(block.content).substring(0, 200);
                    deploymentData.errors.push(errorContent);
                    console.log(`  Status: ❌ ERROR`);
                    console.log(`  Error: ${errorContent}`);
                  } else {
                    console.log(`  Status: ✅ SUCCESS`);
                  }
                }
              }
            }
          }

          // Message processed
        }
      } catch (queryError) {
        console.error('[AiDeploymentAgent] Error during query() execution:', queryError);
        addLog('error', 'Query execution failed', {
          error: queryError instanceof Error ? queryError.message : String(queryError)
        });
        deploymentData.errors.push(queryError instanceof Error ? queryError.message : String(queryError));
      }

      console.log('[AiDeploymentAgent] Query loop completed');

      // Calculate execution time
      deploymentData.end_time = new Date();
      deploymentData.duration = (deploymentData.end_time.getTime() - deploymentData.start_time.getTime()) / 1000;

      const duration = Date.now() - startTime;

      // Print completion summary
      console.log('\n' + '='.repeat(80));
      console.log('DEPLOYMENT EXECUTION COMPLETE');
      console.log('='.repeat(80));
      console.log(`Session ID: ${deploymentData.session_id}`);
      console.log(`Total Messages: ${deploymentData.message_count}`);
      console.log(`Duration: ${deploymentData.duration.toFixed(2)} seconds`);
      console.log(`Project Mode: ${deploymentData.mode}`);
      console.log(`Errors: ${deploymentData.errors.length}`);

      // Print workflow progress
      console.log('\nWorkflow Steps:');
      const completedSteps = Object.values(deploymentData.workflow_steps).filter(s => s).length;
      const totalSteps = Object.keys(deploymentData.workflow_steps).length;
      for (const [stepName, completed] of Object.entries(deploymentData.workflow_steps)) {
        const status = completed ? '✅' : '❌';
        console.log(`  ${status} ${stepName}`);
      }
      console.log(`\nProgress: ${completedSteps}/${totalSteps} steps (${((completedSteps/totalSteps)*100).toFixed(1)}%)`);

      if (deploymentData.deployment_url) {
        console.log(`\n🚀 Deployment URL: ${deploymentData.deployment_url}`);
      }
      if (deploymentData.repository_url) {
        console.log(`📦 Repository URL: ${deploymentData.repository_url}`);
      }

      if (Object.keys(deploymentData.tool_calls).length > 0) {
        console.log('\nTool Usage:');
        const sortedTools = Object.entries(deploymentData.tool_calls).sort((a, b) => b[1] - a[1]);
        for (const [toolName, count] of sortedTools.slice(0, 10)) {
          console.log(`  ${toolName}: ${count} calls`);
        }
      }

      // Print cost summary
      const costData = deploymentData.cost_tracking;
      if (costData.total_input_tokens > 0) {
        console.log('\n💰 COST SUMMARY');
        console.log('-'.repeat(80));
        console.log(`Input Tokens: ${costData.total_input_tokens.toLocaleString()}`);
        console.log(`Output Tokens: ${costData.total_output_tokens.toLocaleString()}`);
        if (costData.total_cache_creation_tokens > 0) {
          console.log(`Cache Creation: ${costData.total_cache_creation_tokens.toLocaleString()}`);
        }
        if (costData.total_cache_read_tokens > 0) {
          console.log(`Cache Read: ${costData.total_cache_read_tokens.toLocaleString()}`);
        }
        console.log(`\n💵 TOTAL COST: $${costData.total_cost_usd.toFixed(4)} USD`);
        console.log('-'.repeat(80));
      }

      console.log('='.repeat(80));

      // Format response
      const isSuccess = deploymentData.errors.length === 0 && completedSteps === totalSteps;
      const response = `AI Deployment ${isSuccess ? 'Complete!' : 'Finished with issues'}\n\nProject: ${projectName}\nMode: ${deploymentData.mode}\nSteps Completed: ${completedSteps}/${totalSteps}\n\n${deploymentData.deployment_url ? `🚀 Deployment URL: ${deploymentData.deployment_url}\n` : ''}${deploymentData.repository_url ? `📦 Repository: ${deploymentData.repository_url}\n` : ''}\nSession ID: ${deploymentData.session_id}\nDuration: ${deploymentData.duration?.toFixed(2)}s\nTotal Cost: $${deploymentData.cost_tracking.total_cost_usd.toFixed(4)}\n\n${deploymentData.errors.length > 0 ? `⚠️ Errors encountered: ${deploymentData.errors.length}\n` : '✅ No errors!'}`;

      addLog(isSuccess ? 'success' : 'warning', 'Deployment completed', {
        mode: deploymentData.mode,
        stepsCompleted: completedSteps,
        totalSteps: totalSteps,
        duration: deploymentData.duration,
        cost: deploymentData.cost_tracking.total_cost_usd,
        hasErrors: deploymentData.errors.length > 0
      });

      console.log('[AiDeploymentAgent] ===== EXECUTE SUCCESS =====');
      console.log('[AiDeploymentAgent] Result:', {
        success: isSuccess,
        mode: deploymentData.mode,
        stepsCompleted: completedSteps,
        sessionId: deploymentData.session_id,
        duration: deploymentData.duration,
        totalCost: deploymentData.cost_tracking.total_cost_usd,
        logCount: logs.length,
        errorCount: deploymentData.errors.length
      });

      const result = {
        success: isSuccess,
        response,
        data: {
          project_name: projectName,
          mode: deploymentData.mode,
          deployment_url: deploymentData.deployment_url,
          repository_url: deploymentData.repository_url,
          workflow_steps: deploymentData.workflow_steps,
          steps_completed: completedSteps,
          total_steps: totalSteps,
          tool_calls: deploymentData.tool_calls,
          cost_tracking: deploymentData.cost_tracking,
          session_id: deploymentData.session_id,
          errors: deploymentData.errors
        },
        logs,
        metadata: {
          duration,
          tokensUsed: deploymentData.cost_tracking.total_input_tokens + deploymentData.cost_tracking.total_output_tokens,
          costUsd: deploymentData.cost_tracking.total_cost_usd,
          toolCalls: deploymentData.tool_calls
        }
      };

      console.log('[AiDeploymentAgent] Returning result object');
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error('[AiDeploymentAgent] ===== EXECUTE FAILED =====');
      console.error('[AiDeploymentAgent] Top-level error caught:', error);
      console.error('[AiDeploymentAgent] Error message:', errorMessage);

      addLog('error', 'Deployment failed', { error: errorMessage });

      const errorResult = {
        success: false,
        error: errorMessage,
        logs,
        metadata: {
          duration
        }
      };

      console.log('[AiDeploymentAgent] Returning error result');
      return errorResult;
    }
  }
}
