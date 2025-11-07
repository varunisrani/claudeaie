import { NextResponse } from 'next/server';
import { getStorageProvider } from '@/lib/storage-interface';
import { Task } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks
 * Returns all tasks
 */
export async function GET() {
  try {
    console.log('[API] GET /api/tasks - Starting request');
    const storage = getStorageProvider();
    const tasks = await storage.readTasks();
    console.log('[API] GET /api/tasks - Successfully read tasks:', { count: tasks.length });
    return NextResponse.json({ tasks });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[API] GET /api/tasks - Error details:', {
      message: errorMessage,
      stack: errorStack,
      error: error
    });
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Creates a new task
 */
export async function POST(request: Request) {
  try {
    const task: Task = await request.json();
    const storage = getStorageProvider();
    const createdTask = await storage.createTask(task);

    return NextResponse.json({ task: createdTask }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
