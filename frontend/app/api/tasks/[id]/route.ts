import { NextResponse } from 'next/server';
import { getStorageProvider } from '@/lib/storage-interface';
import { Task } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/tasks/[id]
 * Updates an existing task
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const updates: Partial<Task> = await request.json();
    const storage = getStorageProvider();

    const task = await storage.updateTask(id, updates);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id]
 * Updates a task (alias for PUT)
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  return PUT(request, { params });
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a task
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const storage = getStorageProvider();
    const success = await storage.deleteTask(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
