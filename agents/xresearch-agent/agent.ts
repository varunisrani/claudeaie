/**
 * X (Twitter) Research Agent
 * Adapter for Claude Agent SDK Cloudflare integration
 *
 * Wraps the executeXResearch function to work with BaseAgent interface
 */

import { BaseAgent, AgentContext, AgentResult, AgentLogEntry } from '../base-agent.js';
import { query, type Options as ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility - define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Tweet {
  tweet_text?: string;
  author?: string;
  likes?: number;
  retweets?: number;
  replies?: number;
  url?: string;
  timestamp?: string;
  tweet_id?: string;
  [key: string]: any;
}

interface ResearchData {
  topic: string;
  target_count: number;
  tweets: Tweet[];
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

export default class XResearchAgent extends BaseAgent {
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
      console.log(`[XResearchAgent] [${level.toUpperCase()}] ${message}`, data || '');
    };

    try {
      console.log('[XResearchAgent] ===== EXECUTE START =====');
      console.log('[XResearchAgent] Context:', {
        taskId: context.taskId,
        prompt: context.prompt?.substring(0, 100),
        hasApiKey: !!context.apiKey,
        model: context.model,
        baseUrl: context.baseUrl
      });

      addLog('info', 'Starting X Research Agent', { taskId: context.taskId });

      // Parse parameters
      const topic = context.parameters?.topic || context.prompt;
      const tweetCount = context.parameters?.tweetCount || context.parameters?.count || 100;

      addLog('info', `Research topic: ${topic}`, { topic, tweetCount });

      // Get prompt file path
      const promptFilePath = path.join(__dirname, 'prompt.md');
      const absolutePromptFilePath = path.resolve(promptFilePath);

      // Construct research prompt
      const researchPrompt = `You are an X (Twitter) research agent. Your task is to:

1. Use the Rube MCP tools to search X (Twitter) for tweets about: "${topic}"
2. Collect at least ${tweetCount} relevant tweets
3. For each tweet, extract:
   - Tweet text/content
   - Author username
   - Engagement metrics (likes, retweets, replies)
   - Tweet URL
   - Timestamp
4. Return the results in a structured format

Search comprehensively using different queries and approaches to get diverse results.
Focus on quality, relevance, and variety of perspectives.`;

      addLog('info', 'Configured agent with MCP support');

      // Configure agent with MCP
      console.log('[XResearchAgent] Configuring Claude Agent SDK options...');
      const agentOptions: ClaudeAgentOptions = {
        maxTurns: this.config.maxTurns || 100,
        permissionMode: 'bypassPermissions',
        systemPrompt: `You are an X (Twitter) research agent using Rube MCP. Your ONLY job is to collect ${tweetCount}+ tweets. ` +
          `Read the file at: ${absolutePromptFilePath} ` +
          `Then follow ALL the instructions in that file exactly. ` +
          `CRITICAL: You MUST use Rube MCP tools to search X/Twitter and collect REAL tweets. ` +
          `DO NOT return fake or simulated data. If MCP tools are unavailable, inform the user. ` +
          `The research topic is: ${topic} ` +
          `The target count is: ${tweetCount}`
      };

      console.log('[XResearchAgent] Agent options configured:', {
        maxTurns: agentOptions.maxTurns,
        permissionMode: agentOptions.permissionMode,
        systemPromptLength: typeof agentOptions.systemPrompt === 'string' ? agentOptions.systemPrompt.length : 'preset'
      });

      // Research data storage
      const researchData: ResearchData = {
        topic,
        target_count: tweetCount,
        tweets: [],
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

      addLog('info', 'Starting research session');
      console.log('[XResearchAgent] Calling query() from Claude Agent SDK...');

      // Execute research query
      console.log('='.repeat(80));
      console.log('X (TWITTER) RESEARCH AGENT - POWERED BY RUBE MCP');
      console.log('='.repeat(80));
      console.log(`Research Topic: ${topic}`);
      console.log(`Target Tweets: ${tweetCount}`);
      console.log(`Started: ${new Date().toLocaleString()}`);
      console.log('='.repeat(80));
      console.log('\n[STARTING RESEARCH SESSION]');
      console.log('-'.repeat(70));

      try {
        for await (const message of query({ prompt: researchPrompt, options: agentOptions })) {
        researchData.message_count++;

        // Capture session initialization
        if (message.type === 'system' && 'subtype' in message && message.subtype === 'init') {
          researchData.session_id = message.session_id || null;

          console.log('\n[SESSION INITIALIZED]');
          console.log(`Session ID: ${researchData.session_id}`);
          console.log(`Model: ${message.model || 'N/A'}`);

          // Check for MCP tools
          const tools = message.tools || [];
          const mcpTools = tools.filter((t: any) => String(t).includes('mcp__'));
          console.log(`Available Tools: ${tools.length}`);
          console.log(`MCP Tools: ${mcpTools.length}`);

          if (mcpTools.length > 0) {
            console.log('[✓✓✓] Rube MCP tools detected!');
          } else {
            console.log('[WARNING] No MCP tools found - check authentication');
          }

          console.log('-'.repeat(70));

          addLog('info', 'Session initialized', {
            sessionId: researchData.session_id,
            model: message.model,
            toolCount: tools.length,
            mcpToolCount: mcpTools.length
          });
          continue;
        }

        // Log message details
        console.log(`\n[MESSAGE #${researchData.message_count}]`);
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
            researchData.cost_tracking.total_input_tokens += stepInputTokens;
            researchData.cost_tracking.total_output_tokens += stepOutputTokens;
            researchData.cost_tracking.total_cache_creation_tokens += stepCacheCreation;
            researchData.cost_tracking.total_cache_read_tokens += stepCacheRead;
            researchData.cost_tracking.total_cost_usd += stepCost;

            // Display cost tracking with formatting
            console.log('\n' + '='.repeat(70));
            console.log(`💰 COST TRACKING - STEP ${researchData.message_count}`);
            console.log('='.repeat(70));
            console.log(`  Message Type: ${messageType}`);
            console.log('\n  📊 TOKEN USAGE:');
            console.log(`     Input Tokens:          ${stepInputTokens.toLocaleString().padStart(10)}`);
            console.log(`     Output Tokens:         ${stepOutputTokens.toLocaleString().padStart(10)}`);
            if (stepCacheCreation > 0) {
              console.log(`     Cache Creation:        ${stepCacheCreation.toLocaleString().padStart(10)}`);
            }
            if (stepCacheRead > 0) {
              console.log(`     Cache Read:            ${stepCacheRead.toLocaleString().padStart(10)}`);
            }

            const totalTokens = stepInputTokens + stepOutputTokens;
            console.log('     ─────────────────────────────────');
            console.log(`     Total This Step:       ${totalTokens.toLocaleString().padStart(10)}`);

            console.log('\n  💵 COST BREAKDOWN:');
            console.log(`     Input Cost:            $${inputCost.toFixed(4).padStart(10)}`);
            console.log(`     Output Cost:           $${outputCost.toFixed(4).padStart(10)}`);
            if (cacheCreationCost > 0) {
              console.log(`     Cache Creation Cost:   $${cacheCreationCost.toFixed(4).padStart(10)}`);
            }
            if (cacheReadCost > 0) {
              console.log(`     Cache Read Cost:       $${cacheReadCost.toFixed(4).padStart(10)}`);
            }
            console.log('     ─────────────────────────────────');
            console.log(`     Step Total:            $${stepCost.toFixed(4).padStart(10)}`);
            console.log(`\n  📈 RUNNING TOTAL:          $${researchData.cost_tracking.total_cost_usd.toFixed(4).padStart(10)}`);
            console.log('='.repeat(70));

            addLog('info', 'Cost update', {
              inputTokens: stepInputTokens,
              outputTokens: stepOutputTokens,
              stepCost: stepCost,
              totalCost: researchData.cost_tracking.total_cost_usd
            });
          }
        }

        // Process message content for tweets and detailed logging
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

                // Try to extract tweet data from text
                if (block.text.toLowerCase().includes('"tweets"')) {
                  try {
                    const jsonMatch = block.text.match(/\{.*"tweets".*\}/s);
                    if (jsonMatch) {
                      const tweetData = JSON.parse(jsonMatch[0]);
                      const tweets = tweetData.tweets || [];
                      researchData.tweets.push(...tweets);
                      addLog('success', `Extracted ${tweets.length} tweets`, {
                        totalTweets: researchData.tweets.length
                      });
                    }
                  } catch (e) {
                    console.log(`  [WARNING] Could not parse tweet JSON: ${e}`);
                    addLog('warning', 'Could not parse tweet JSON', { error: String(e) });
                  }
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
                if (!researchData.tool_calls[toolName]) {
                  researchData.tool_calls[toolName] = 0;
                }
                researchData.tool_calls[toolName]++;

                // Highlight MCP tool usage
                if (toolName.toLowerCase().includes('mcp__') || toolName.toLowerCase().includes('rube')) {
                  console.log('  [✓✓✓] USING RUBE MCP TOOL!');
                  addLog('info', `Using MCP tool: ${toolName}`);
                }

                // Show tool input details
                if (block.input) {
                  console.log(`  Input Keys: ${Object.keys(block.input).join(', ')}`);

                  // Display relevant input for debugging
                  if (toolName === 'Read') {
                    console.log(`  File: ${block.input.file_path || 'unknown'}`);
                  } else if (toolName === 'Write') {
                    const filePath = block.input.file_path || 'unknown';
                    const contentLen = String(block.input.content || '').length;
                    console.log(`  File: ${filePath}`);
                    console.log(`  Content: ${contentLen} chars`);
                  } else if (toolName.toLowerCase().includes('search') || toolName.toLowerCase().includes('query')) {
                    const queryText = block.input.query || block.input.q || 'N/A';
                    console.log(`  Search Query: ${queryText}`);
                  } else {
                    // Show first few input keys for other tools
                    const inputKeys = Object.keys(block.input).slice(0, 3);
                    const inputPreview: Record<string, string> = {};
                    for (const key of inputKeys) {
                      inputPreview[key] = String(block.input[key]).substring(0, 100);
                    }
                    console.log(`  Input Preview: ${JSON.stringify(inputPreview)}`);
                  }
                }
              } else if (block.type === 'tool_result' && 'tool_use_id' in block) {
                console.log('  [TOOLRESULTBLOCK]');
                console.log(`  Tool ID: ${block.tool_use_id}`);

                // Check for errors
                if ('is_error' in block && block.is_error) {
                  console.log('  Status: ❌ ERROR');
                  researchData.errors.push(block.tool_use_id);
                } else {
                  console.log('  Status: ✓ SUCCESS');
                }

                // Show result details
                if ('content' in block && block.content) {
                  const contentStr = String(block.content);
                  console.log(`  Result Length: ${contentStr.length} characters`);

                  // Try to parse tweet data from results
                  if (contentStr.toLowerCase().includes('tweet')) {
                    console.log('  [!!!] Tweet data in tool result!');
                    const resultPreview = contentStr.substring(0, 300);
                    console.log(`  Preview: ${resultPreview}...`);
                  }
                }
              } else {
                console.log(`  Type: ${block.type} (Unknown)`);
              }
            }
          }
        }
      }
      } catch (queryError) {
        console.error('[XResearchAgent] Error during query() execution:', queryError);
        console.error('[XResearchAgent] Error type:', queryError instanceof Error ? queryError.constructor.name : typeof queryError);
        console.error('[XResearchAgent] Error message:', queryError instanceof Error ? queryError.message : String(queryError));
        console.error('[XResearchAgent] Error stack:', queryError instanceof Error ? queryError.stack : 'No stack');

        addLog('error', 'Query execution failed', {
          error: queryError instanceof Error ? queryError.message : String(queryError),
          errorType: queryError instanceof Error ? queryError.constructor.name : typeof queryError
        });

        researchData.errors.push(queryError instanceof Error ? queryError.message : String(queryError));
      }

      console.log('[XResearchAgent] Query loop completed');

      // Calculate execution time
      researchData.end_time = new Date();
      researchData.duration = (researchData.end_time.getTime() - researchData.start_time.getTime()) / 1000;

      const duration = Date.now() - startTime;

      // Print completion summary
      console.log('\n' + '='.repeat(80));
      console.log('RESEARCH EXECUTION COMPLETE');
      console.log('='.repeat(80));
      console.log(`Session ID: ${researchData.session_id}`);
      console.log(`Total Messages: ${researchData.message_count}`);
      console.log(`Duration: ${researchData.duration.toFixed(2)} seconds`);
      console.log(`Tweets Collected: ${researchData.tweets.length}`);
      console.log(`Errors: ${researchData.errors.length}`);

      if (Object.keys(researchData.tool_calls).length > 0) {
        console.log('\nTool Usage:');
        const sortedTools = Object.entries(researchData.tool_calls).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [toolName, count] of sortedTools) {
          const indicator = (toolName.toLowerCase().includes('mcp__') || toolName.toLowerCase().includes('rube')) ? '[MCP]' : '';
          console.log(`  ${toolName}: ${count} calls ${indicator}`);
        }
      }

      // Print cost summary
      const costData = researchData.cost_tracking;
      if (costData.total_input_tokens > 0) {
        console.log('\n💰 COST SUMMARY');
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
        console.log(`💵 TOTAL COST: $${costData.total_cost_usd.toFixed(4)} USD`);
        console.log('-'.repeat(80));
      }

      console.log('='.repeat(80));

      // Format response
      const response = `X Research Complete!\n\nTopic: ${topic}\nTarget: ${tweetCount} tweets\nCollected: ${researchData.tweets.length} tweets\n\nSession ID: ${researchData.session_id}\nDuration: ${researchData.duration.toFixed(2)}s\nTotal Cost: $${researchData.cost_tracking.total_cost_usd.toFixed(4)}\n\nTool Usage:\n${Object.entries(researchData.tool_calls).map(([tool, count]) => `  - ${tool}: ${count} calls`).join('\n')}`;

      addLog('success', 'Research completed', {
        tweetsCollected: researchData.tweets.length,
        duration: researchData.duration,
        cost: researchData.cost_tracking.total_cost_usd
      });

      console.log('[XResearchAgent] ===== EXECUTE SUCCESS =====');
      console.log('[XResearchAgent] Result:', {
        tweetsCollected: researchData.tweets.length,
        sessionId: researchData.session_id,
        duration: researchData.duration,
        totalCost: researchData.cost_tracking.total_cost_usd,
        logCount: logs.length,
        errorCount: researchData.errors.length
      });

      const result = {
        success: true,
        response,
        data: {
          topic,
          total_tweets: researchData.tweets.length,
          tweets: researchData.tweets,
          tool_calls: researchData.tool_calls,
          cost_tracking: researchData.cost_tracking,
          session_id: researchData.session_id
        },
        logs,
        metadata: {
          duration,
          tokensUsed: researchData.cost_tracking.total_input_tokens + researchData.cost_tracking.total_output_tokens,
          costUsd: researchData.cost_tracking.total_cost_usd,
          toolCalls: researchData.tool_calls
        }
      };

      console.log('[XResearchAgent] Returning result object');
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error('[XResearchAgent] ===== EXECUTE FAILED =====');
      console.error('[XResearchAgent] Top-level error caught:', error);
      console.error('[XResearchAgent] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[XResearchAgent] Error message:', errorMessage);
      console.error('[XResearchAgent] Error stack:', error instanceof Error ? error.stack : 'No stack');

      addLog('error', 'Research failed', { error: errorMessage });

      const errorResult = {
        success: false,
        error: errorMessage,
        logs,
        metadata: {
          duration
        }
      };

      console.log('[XResearchAgent] Returning error result');
      return errorResult;
    }
  }
}
