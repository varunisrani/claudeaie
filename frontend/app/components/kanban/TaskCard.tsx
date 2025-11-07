'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Play, Trash2, Edit, GripVertical, FileText } from 'lucide-react';
import { useKanbanStore } from '@/lib/store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AgentLogViewer } from './AgentLogViewer';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { setSelectedTask, assignToAgent } = useKanbanStore();
  const [showLogs, setShowLogs] = useState(false);

  // Debug: Log task status
  console.log('[TaskCard] Rendering task:', {
    id: task.id.substring(0, 8),
    title: task.title.substring(0, 30),
    agentStatus: task.agentStatus,
    assignedTo: task.assignedTo,
    hasResponse: !!task.agentResponse,
    showLogsButton: task.agentStatus === 'running' || task.agentStatus === 'success' || task.agentStatus === 'error'
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const getStatusBadge = () => {
    if (task.agentStatus === 'running') {
      return <Badge variant="default" className="bg-blue-500">Running</Badge>;
    }
    if (task.agentStatus === 'success') {
      return <Badge variant="default" className="bg-green-500">Success</Badge>;
    }
    if (task.agentStatus === 'error') {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (task.assignedTo === 'agent') {
      return <Badge variant="secondary">Agent</Badge>;
    }
    if (task.assignedTo === 'user') {
      return <Badge variant="outline">User</Badge>;
    }
    return null;
  };

  const handleAssignToAgent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[TaskCard] Assign to Agent clicked:', {
      taskId: task.id.substring(0, 8),
      currentStatus: task.agentStatus,
      willExecute: task.agentStatus !== 'running'
    });
    if (task.agentStatus !== 'running') {
      await assignToAgent(task.id);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-primary' : ''
      }`}
      onClick={() => {
        console.log('[TaskCard] Card clicked - opening task details:', { taskId: task.id, title: task.title });
        setSelectedTask(task);
      }}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing mt-1 touch-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <CardTitle className="text-sm font-medium line-clamp-2 flex-1">
              {task.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {getStatusBadge()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('[TaskCard] Edit menu item clicked:', { taskId: task.id });
                    onEdit?.(task);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleAssignToAgent}
                  disabled={task.agentStatus === 'running'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Assign to Agent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('[TaskCard] Delete menu item clicked:', { taskId: task.id });
                    onDelete?.(task.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {task.description}
        </p>

        {/* Agent execution logs button */}
        {(task.agentStatus === 'running' || task.agentStatus === 'success' || task.agentStatus === 'error') && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={(e) => {
              e.stopPropagation();
              console.log('[TaskCard] View Agent Logs clicked:', {
                taskId: task.id,
                agentStatus: task.agentStatus
              });
              setShowLogs(true);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Agent Logs
          </Button>
        )}

        {task.agentResponse && (
          <div className="mt-2 p-2 bg-muted rounded-md">
            <p className="text-xs font-medium mb-1">Agent Response:</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.agentResponse}
            </p>
          </div>
        )}
      </CardContent>

      {/* Agent log viewer modal */}
      <AgentLogViewer
        taskId={task.id}
        isRunning={task.agentStatus === 'running'}
        open={showLogs}
        onClose={() => setShowLogs(false)}
      />
    </Card>
  );
}
