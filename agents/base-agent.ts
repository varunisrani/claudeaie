// Agent capability types
export type AgentCapability =
  | 'web-research'
  | 'code-generation'
  | 'code-review'
  | 'data-analysis'
  | 'task-execution'
  | 'file-operations'
  | 'api-integration';

// Agent configuration metadata
export interface AgentConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  longDescription?: string;
  author?: string;
  capabilities: AgentCapability[];
  tags: string[];
  icon?: string;
  color?: string;
  maxTurns?: number;
  defaultModel?: string;
  systemPromptFile?: string;
  requiresMCP?: boolean;
  mcpServers?: string[];
}

// Agent execution context
export interface AgentContext {
  taskId: string;
  prompt: string;
  parameters?: Record<string, any>;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  environment?: Record<string, string>;
}

// Agent log entry
export interface AgentLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

// Agent execution result
export interface AgentResult {
  success: boolean;
  response?: string;
  data?: any;
  error?: string;
  logs: AgentLogEntry[];
  metadata: {
    duration: number;
    tokensUsed?: number;
    costUsd?: number;
    toolCalls?: Record<string, number>;
  };
}

// Base agent abstract class
export abstract class BaseAgent {
  constructor(public config: AgentConfig) {}

  // Main execution method - must be implemented by each agent
  abstract execute(context: AgentContext): Promise<AgentResult>;

  // Optional: Validate input parameters
  validateInput?(parameters: Record<string, any>): boolean;

  // Optional: Prepare system prompt
  getSystemPrompt?(parameters: Record<string, any>): string;
}
