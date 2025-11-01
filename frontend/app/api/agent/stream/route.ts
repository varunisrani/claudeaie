import { NextResponse } from 'next/server';
import { findTaskById } from '@/lib/storage';

/**
 * GET /api/agent/stream?taskId=xxx
 * Server-Sent Events (SSE) endpoint for streaming logs
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json(
      { error: 'Missing taskId parameter' },
      { status: 400 }
    );
  }

  const task = await findTaskById(taskId);

  if (!task) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    );
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send existing logs
      for (const log of task.logs) {
        const data = `data: ${JSON.stringify(log)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      // Poll for new logs every second
      const interval = setInterval(async () => {
        const updatedTask = await findTaskById(taskId);

        if (!updatedTask) {
          clearInterval(interval);
          controller.close();
          return;
        }

        // Check if task is completed
        if (updatedTask.agentStatus === 'success' || updatedTask.agentStatus === 'error') {
          // Send final logs
          const newLogs = updatedTask.logs.slice(task.logs.length);
          for (const log of newLogs) {
            const data = `data: ${JSON.stringify(log)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
