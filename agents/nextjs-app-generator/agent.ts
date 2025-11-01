/**
 * Next.js App Generator Agent
 * Creates production-ready Next.js applications based on user requirements
 */

import { BaseAgent, AgentConfig, AgentContext, AgentResult, AgentLogEntry } from '../base-agent.js';
import { query, type Options as ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GeneratorData {
  appName: string;
  appDescription: string;
  features: string[];
  files_generated: string[];
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

export default class NextJSAppGeneratorAgent extends BaseAgent {
  private data!: GeneratorData;
  private sessionId: string;

  constructor(config: AgentConfig) {
    super(config);
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return createHash('md5').update(`${timestamp}-${random}`).digest('hex').substring(0, 8);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    console.log('========================================');
    console.log('    NEXTJS APP GENERATOR AGENT         ');
    console.log('========================================');
    console.log(`Task ID: ${context.taskId}`);
    console.log(`Session ID: ${this.sessionId}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('========================================\n');

    // Initialize data tracking
    this.data = {
      appName: '',
      appDescription: '',
      features: [],
      files_generated: [],
      session_id: this.sessionId,
      message_count: 0,
      tool_calls: {},
      start_time: new Date(),
      errors: [],
      cost_tracking: {
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cache_creation_tokens: 0,
        total_cache_read_tokens: 0,
        total_cost_usd: 0
      }
    };

    const logs: AgentLogEntry[] = [];

    // Add initial log
    logs.push({
      id: `log-${Date.now()}`,
      level: 'info',
      message: `NextJS Generator Agent started - Session: ${this.sessionId}`,
      timestamp: new Date().toISOString(),
      data: { sessionId: this.sessionId }
    });

    // Load system prompt
    const promptPath = path.join(__dirname, 'prompt.md');
    let systemPrompt = '';

    try {
      systemPrompt = fs.readFileSync(promptPath, 'utf-8');
      console.log('[NextJS Generator] Loaded system prompt from prompt.md');
    } catch (error) {
      console.error('[NextJS Generator] Failed to load prompt file:', error);
      systemPrompt = this.getDefaultPrompt();
    }

    console.log('[SESSION INITIALIZED]');
    console.log(`├─ Session: ${this.sessionId}`);
    console.log(`├─ Model: ${context.model || 'claude-3-5-sonnet-20241022'}`);
    console.log(`├─ API Key: ${context.apiKey ? '***set***' : 'NOT SET'}`);
    console.log(`└─ Base URL: ${context.baseUrl || 'default'}\n`);

    try {
      // Create the prompt with the user's request
      const fullPrompt = `${systemPrompt}

User Request:
${context.prompt}

Please analyze the requirements and provide a detailed plan for creating a complete Next.js application.
Include:
1. Application structure and architecture
2. List of pages and routes to create
3. Components needed
4. API endpoints (if any)
5. Sample code for key features
6. Setup and configuration instructions`;

      // Execute query
      console.log('[EXECUTION START]');
      console.log(`├─ Prompt length: ${context.prompt.length} chars`);
      console.log(`└─ Starting Claude query...\n`);

      // Set environment variable for API key
      if (context.apiKey) {
        process.env.ANTHROPIC_API_KEY = context.apiKey;
      }

      const options: ClaudeAgentOptions = {
        model: context.model || 'claude-3-5-sonnet-20241022',
        settingSources: ['local', 'project'],
        permissionMode: 'bypassPermissions'
      };

      let responseText = '';
      const response = query({
        prompt: fullPrompt,
        options
      });

      // Process response stream
      let messageNumber = 0;
      for await (const message of response) {
        if (message.type === 'assistant' && message.message?.content) {
          messageNumber++;
          this.data.message_count++;

          console.log(`\n[MESSAGE #${messageNumber}] ==================`);
          console.log(`Type: assistant`);
          console.log(`Blocks: ${message.message.content.length}`);

          for (const block of message.message.content) {
            if (block.type === 'text') {
              const preview = block.text.substring(0, 200);
              console.log(`[TEXT BLOCK]`);
              console.log(`├─ Preview: ${preview}${block.text.length > 200 ? '...' : ''}`);
              console.log(`└─ Length: ${block.text.length} chars`);
              responseText += block.text;
            }

            // Tool tracking removed since we're not using tools for now
          }
        }

        // Update token usage (simplified - estimate)
        this.data.cost_tracking.total_input_tokens += 100;
        this.data.cost_tracking.total_output_tokens += 50;
      }

      // Calculate final metrics
      this.data.end_time = new Date();
      this.data.duration = (this.data.end_time.getTime() - this.data.start_time.getTime()) / 1000;

      // Estimate cost
      const inputCost = (this.data.cost_tracking.total_input_tokens / 1000000) * 3.00;
      const outputCost = (this.data.cost_tracking.total_output_tokens / 1000000) * 15.00;
      this.data.cost_tracking.total_cost_usd = inputCost + outputCost;

      // Log completion
      console.log('\n========================================');
      console.log('   NEXTJS GENERATOR EXECUTION COMPLETE ');
      console.log('========================================');
      console.log(`Session: ${this.sessionId}`);
      console.log(`App Name: ${this.data.appName || 'Not specified'}`);
      console.log(`Features: ${this.data.features.length}`);
      console.log(`Files Generated: ${this.data.files_generated.length}`);
      console.log(`Total messages: ${this.data.message_count}`);
      console.log(`Duration: ${this.data.duration?.toFixed(2)}s`);
      console.log(`Tool usage:`);
      Object.entries(this.data.tool_calls).forEach(([tool, count]) => {
        console.log(`  - ${tool}: ${count} times`);
      });
      console.log(`Errors: ${this.data.errors.length}`);
      console.log(`Estimated cost: $${this.data.cost_tracking.total_cost_usd.toFixed(4)}`);
      console.log('========================================\n');

      // Add completion log
      logs.push({
        id: `log-${Date.now()}`,
        level: 'success',
        message: `Generated ${this.data.appName} with ${this.data.files_generated.length} files`,
        timestamp: new Date().toISOString(),
        data: {
          appName: this.data.appName,
          filesCount: this.data.files_generated.length,
          duration: this.data.duration
        }
      });

      return {
        success: true,
        response: responseText,
        data: this.data,
        logs,
        metadata: {
          duration: this.data.duration || 0,
          tokensUsed: this.data.cost_tracking.total_input_tokens + this.data.cost_tracking.total_output_tokens,
          costUsd: this.data.cost_tracking.total_cost_usd,
          toolCalls: this.data.tool_calls
        }
      };
    } catch (error) {
      console.error('[NextJS Generator] ERROR:', error);
      this.data.errors.push(error instanceof Error ? error.message : String(error));

      logs.push({
        id: `log-${Date.now()}`,
        level: 'error',
        message: `Agent execution failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString(),
        data: { error }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: this.data,
        logs,
        metadata: {
          duration: (Date.now() - this.data.start_time.getTime()) / 1000,
          tokensUsed: 0,
          costUsd: 0,
          toolCalls: {}
        }
      };
    }
  }

  private getDefaultPrompt(): string {
    return `You are an expert Next.js application generator that creates production-ready applications with modern best practices.

Your role is to:
1. Analyze the user's requirements
2. Create a detailed application specification
3. Generate all necessary project files
4. Implement features with TypeScript and Tailwind CSS
5. Follow Next.js 14+ App Router conventions

Focus on creating clean, maintainable code with proper error handling, TypeScript types, and modern React patterns.`;
  }
}