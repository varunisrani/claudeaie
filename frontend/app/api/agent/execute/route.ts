import { NextResponse } from 'next/server';
import { AgentExecutionRequest, AgentExecutionResponse, DockerContainerResponse } from '@/lib/types';
import { updateTask } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const DOCKER_CONTAINER_URL = 'http://localhost:8787';
const MAX_RETRIES = 3;
const TIMEOUT_MS = 120000; // 2 minutes

/**
 * Execute task with Docker container with retry logic
 */
async function executeWithRetry(
  prompt: string,
  agentId?: string,
  taskId?: string,
  maxRetries: number = MAX_RETRIES
): Promise<DockerContainerResponse> {
  let attempt = 0;

  console.log('[executeWithRetry] Starting with max retries:', maxRetries);

  while (attempt < maxRetries) {
    attempt++;
    console.log(`[executeWithRetry] Attempt ${attempt}/${maxRetries}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      console.log('[executeWithRetry] Sending request to Docker container:', {
        url: `${DOCKER_CONTAINER_URL}/run`,
        agentId: agentId || 'default',
        taskId,
        timeout: TIMEOUT_MS
      });

      const response = await fetch(`${DOCKER_CONTAINER_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          agentId,
          taskId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('[executeWithRetry] Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[executeWithRetry] Success! Response data:', {
          success: data.success,
          hasResponse: !!data.response,
          hasData: !!data.data
        });
        return data;
      }

      console.warn(`[executeWithRetry] Attempt ${attempt} failed with status ${response.status}`);
      if (attempt < maxRetries) {
        const waitTime = 1000 * attempt;
        console.log(`[executeWithRetry] Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (error) {
      console.error(`[executeWithRetry] Attempt ${attempt} error:`, error);
      if (attempt >= maxRetries) {
        console.error('[executeWithRetry] Max retries exceeded, throwing error');
        throw error;
      }
      // Wait before retrying
      const waitTime = 1000 * attempt;
      console.log(`[executeWithRetry] Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  console.error('[executeWithRetry] Max retries exceeded without success');
  throw new Error('Max retries exceeded');
}

/**
 * POST /api/agent/execute
 * Executes a task with the Docker container agent
 */
export async function POST(request: Request) {
  console.log('[API /agent/execute] ===== POST request received =====');

  try {
    const { taskId, prompt, agentId } = await request.json();
    console.log('[API /agent/execute] Request payload:', {
      taskId,
      agentId: agentId || 'none',
      promptPreview: prompt?.substring(0, 100) + '...'
    });

    if (!taskId || !prompt) {
      console.error('[API /agent/execute] Missing required fields:', { taskId: !!taskId, prompt: !!prompt });
      return NextResponse.json(
        { success: false, error: 'Missing taskId or prompt' },
        { status: 400 }
      );
    }

    // Add log entry
    const logId = uuidv4();
    const logEntry = {
      id: logId,
      taskId,
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      message: agentId ? `Starting agent execution with ${agentId}...` : 'Starting agent execution...'
    };

    console.log('[API /agent/execute] Adding initial log entry...');
    await updateTask(taskId, {
      logs: [logEntry]
    });

    // Execute with Docker container
    console.log('[API /agent/execute] Calling executeWithRetry...');
    const result = await executeWithRetry(prompt, agentId, taskId);

    console.log('[API /agent/execute] Execution result:', {
      success: result.success,
      hasResponse: !!result.response
    });

    // Add success log
    const successLog = {
      id: uuidv4(),
      taskId,
      timestamp: new Date().toISOString(),
      level: 'success' as const,
      message: 'Agent execution completed successfully'
    };

    console.log('[API /agent/execute] Adding success log...');
    await updateTask(taskId, {
      logs: [logEntry, successLog]
    });

    const response: AgentExecutionResponse = {
      success: result.success,
      response: result.response
    };

    console.log('[API /agent/execute] ===== Execution completed successfully =====');
    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /agent/execute] ===== Execution failed =====');
    console.error('[API /agent/execute] Error:', error);

    const response: AgentExecutionResponse = {
      success: false,
      error: errorMessage
    };

    return NextResponse.json(response, { status: 500 });
  }
}
