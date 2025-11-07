'use client';

import { Task, TaskStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function KanbanColumn({ title, status, tasks, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  console.log('[KanbanColumn] Column rendering:', {
    title,
    status,
    taskCount: tasks.length,
    isOver
  });

  const getColumnColor = () => {
    switch (status) {
      case 'todo':
        return 'border-t-4 border-t-gray-500';
      case 'in-progress':
        return 'border-t-4 border-t-blue-500';
      case 'completed':
        return 'border-t-4 border-t-green-500';
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 min-w-[260px] sm:min-w-[300px] flex flex-col h-full">
      <div className="mb-3 sm:mb-4 flex-shrink-0">
        <h2 className="font-semibold text-sm sm:text-lg">{title}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{tasks.length} tasks</p>
      </div>

      <Card
        ref={setNodeRef}
        className={`p-3 sm:p-4 flex-1 overflow-y-auto ${getColumnColor()} ${
          isOver ? 'bg-muted/50 ring-2 ring-primary' : ''
        } transition-colors`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 sm:space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-6 sm:py-12 text-muted-foreground">
                <p className="text-xs sm:text-sm">No tasks yet</p>
                <p className="text-xs mt-1 sm:mt-2">Drag tasks here or create a new one</p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </div>
        </SortableContext>
      </Card>
    </div>
  );
}
