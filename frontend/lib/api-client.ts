/**
 * API Client for Next.js web app
 * Handles all API requests to Next.js API routes
 */

/**
 * Make API request to Next.js API routes
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  console.log('[apiClient] Request to endpoint:', endpoint, {
    method: options.method || 'GET',
    hasBody: !!options.body
  });

  try {
    const response = await fetch(`/api${endpoint}`, options);
    console.log('[apiClient] Fetch response:', { status: response.status, ok: response.ok });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[apiClient] Fetch error:', error);
    throw error;
  }
}

/**
 * Execute agent task
 */
export async function executeAgent(params: {
  taskId: string;
  prompt: string;
  agentId?: string;
}) {
  return apiRequest('/agent/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

/**
 * Stream agent execution
 */
export async function streamAgent(params: {
  taskId: string;
  prompt: string;
  agentId?: string;
}) {
  // Use streaming endpoint
  const response = await fetch('/api/agent/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response;
}

/**
 * Get agent logs
 */
export async function getAgentLogs(taskId: string) {
  return apiRequest(`/agent/logs?taskId=${taskId}`);
}

/**
 * Get list of agents
 */
export async function getAgents() {
  return apiRequest('/agents');
}

/**
 * Get list of tasks
 */
export async function getTasks() {
  return apiRequest('/tasks');
}

/**
 * Create new task
 */
export async function createTask(task: any) {
  return apiRequest('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
}

/**
 * Update task
 */
export async function updateTask(taskId: string, updates: any) {
  return apiRequest(`/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

/**
 * Delete task
 */
export async function deleteTask(taskId: string) {
  return apiRequest(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export const apiClient = {
  executeAgent,
  streamAgent,
  getAgentLogs,
  getAgents,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
