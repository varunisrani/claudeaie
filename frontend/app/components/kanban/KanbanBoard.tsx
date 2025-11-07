'use client';

import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useKanbanStore } from '@/lib/store';
import { Task, TaskStatus } from '@/lib/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { TaskDialog } from './TaskDialog';

export function KanbanBoard() {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, moveTask } = useKanbanStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    console.log('[KanbanBoard] Component mounted, fetching tasks...');
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    console.log('[KanbanBoard] Tasks updated:', { count: tasks.length, tasks });
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('[KanbanBoard] Drag started:', { taskId: event.active.id });
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('[KanbanBoard] Drag ended:', { taskId: active.id, targetColumn: over?.id });

    if (!over) {
      console.log('[KanbanBoard] Drag cancelled - no target');
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      console.log('[KanbanBoard] Moving task:', { taskId, from: task.status, to: newStatus });
      moveTask(taskId, newStatus);
    } else {
      console.log('[KanbanBoard] Task not moved:', { sameColumn: task?.status === newStatus });
    }

    setActiveTask(null);
  };

  const handleCreateTask = () => {
    console.log('[KanbanBoard] Create task button clicked - opening dialog');
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    console.log('[KanbanBoard] Edit task clicked:', { taskId: task.id, title: task.title });
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log('[KanbanBoard] Delete task requested:', { taskId });
    if (confirm('Are you sure you want to delete this task?')) {
      console.log('[KanbanBoard] Delete confirmed, deleting task...');
      try {
        await deleteTask(taskId);
        console.log('[KanbanBoard] Task deleted successfully');
      } catch (error) {
        console.error('[KanbanBoard] Delete task error:', error);
      }
    } else {
      console.log('[KanbanBoard] Delete cancelled by user');
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const isEdit = !!editingTask;
    console.log('[KanbanBoard] Saving task:', {
      isEdit,
      taskId: editingTask?.id,
      taskData
    });

    try {
      if (editingTask) {
        console.log('[KanbanBoard] Updating existing task:', editingTask.id);
        await updateTask(editingTask.id, taskData);
        console.log('[KanbanBoard] Task updated successfully');
      } else {
        console.log('[KanbanBoard] Creating new task');
        await createTask(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'logs' | 'agentResponse' | 'agentStatus'>);
        console.log('[KanbanBoard] Task created successfully');
      }
    } catch (error) {
      console.error('[KanbanBoard] Save task error:', error);
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Agent Kanban Board</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage tasks and assign them to the Claude Agent
          </p>
        </div>
        <Button onClick={handleCreateTask} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-3 sm:gap-6 pb-4">
          <KanbanColumn
            title="To Do"
            status="todo"
            tasks={todoTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <KanbanColumn
            title="In Progress"
            status="in-progress"
            tasks={inProgressTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <KanbanColumn
            title="Completed"
            status="completed"
            tasks={completedTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-50">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}
