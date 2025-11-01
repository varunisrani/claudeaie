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
    fetchTasks();
  }, [fetchTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      moveTask(taskId, newStatus);
    }

    setActiveTask(null);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'logs' | 'agentResponse' | 'agentStatus'>);
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Agent Kanban Board</h1>
          <p className="text-muted-foreground">
            Manage tasks and assign them to the Claude Agent
          </p>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
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
