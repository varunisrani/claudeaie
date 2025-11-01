import { NextResponse } from 'next/server';
import { readTasks, writeTasks } from '@/lib/storage';
import { Task } from '@/lib/types';

/**
 * GET /api/tasks
 * Returns all tasks
 */
export async function GET() {
  try {
    const tasks = await readTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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

    const tasks = await readTasks();
    tasks.push(task);
    await writeTasks(tasks);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
