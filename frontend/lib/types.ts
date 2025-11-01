export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskAssignee = 'user' | 'agent' | null;
export type AgentStatus = 'idle' | 'running' | 'success' | 'error';
export type LogLevel = 'info' | 'error' | 'success' | 'warning';
export type AgentCapability =
  | 'web-research'
  | 'code-generation'
  | 'code-review'
  | 'data-analysis'
  | 'task-execution'
  | 'file-operations'
  | 'api-integration';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: TaskAssignee;
  agentId?: string;
  agentResponse: string | null;
  agentStatus: AgentStatus;
  logs: LogEntry[];
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface LogEntry {
  id: string;
  taskId: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

// Enhanced log types for detailed agent execution logs
export type AgentLogType =
  | 'session_init'
  | 'message'
  | 'block_text'
  | 'block_thinking'
  | 'block_tool_use'
  | 'block_tool_result'
  | 'cost_tracking'
  | 'completion'
  | 'error'
  | 'info';

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  type: AgentLogType;
  message: string;
  data?: any;
}

export interface SessionInitLog extends AgentLogEntry {
  type: 'session_init';
  data: {
    sessionId: string;
    model: string;
    toolCount: number;
    mcpToolCount: number;
  };
}

export interface MessageLog extends AgentLogEntry {
  type: 'message';
  data: {
    messageNumber: number;
    messageType: string;
    blockCount?: number;
  };
}

export interface BlockLog extends AgentLogEntry {
  type: 'block_text' | 'block_thinking' | 'block_tool_use' | 'block_tool_result';
  data: {
    blockIndex: number;
    totalBlocks: number;
    content?: string;
    preview?: string;
    length?: number;
    toolName?: string;
    toolId?: string;
    inputKeys?: string[];
    status?: 'success' | 'error';
    isMCP?: boolean;
  };
}

export interface CostLog extends AgentLogEntry {
  type: 'cost_tracking';
  data: {
    step: number;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
    stepCost: number;
    runningTotal: number;
  };
}

export interface CompletionLog extends AgentLogEntry {
  type: 'completion';
  data: {
    sessionId: string;
    totalMessages: number;
    duration: number;
    tweetsCollected: number;
    errors: number;
    toolUsage: Record<string, number>;
    totalCost: number;
  };
}

export interface AgentExecutionRequest {
  taskId: string;
  prompt: string;
}

export interface AgentExecutionResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface DockerContainerResponse {
  success: boolean;
  response: string;
}

export interface TasksData {
  tasks: Task[];
}

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
