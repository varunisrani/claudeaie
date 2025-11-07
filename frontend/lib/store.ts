import { create } from 'zustand';
import { Task, TaskStatus } from './types';
import { apiClient } from './api-client';
import { v4 as uuidv4 } from 'uuid';

interface KanbanStore {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;

  // Actions
  setTasks: (tasks: Task[]) => void;
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'logs' | 'agentResponse' | 'agentStatus'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, newStatus: TaskStatus) => Promise<void>;
  assignToAgent: (id: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  tasks: [],
  selectedTask: null,
  isLoading: false,

  setTasks: (tasks) => {
    console.log('[Store] Setting tasks manually:', { count: tasks.length });
    set({ tasks });
  },

  fetchTasks: async () => {
    console.log('[Store] Fetching tasks...');
    set({ isLoading: true });
    try {
      const data = await apiClient.getTasks();
      console.log('[Store] Fetched tasks:', { count: data.tasks?.length || 0 });
      set({ tasks: data.tasks || [] });
    } catch (error) {
      console.error('[Store] Error fetching tasks:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    console.log('[Store] Creating task:', { title: taskData.title, agentId: taskData.agentId });
    try {
      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        agentResponse: null,
        agentStatus: 'idle',
        logs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('[Store] New task object:', { id: newTask.id, agentId: newTask.agentId });

      const data = await apiClient.createTask(newTask);
      console.log('[Store] Task created successfully:', { id: data.task.id });
      set({ tasks: [...get().tasks, data.task] });
    } catch (error) {
      console.error('[Store] Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    console.log('[Store] Updating task:', { id, updates });
    try {
      const data = await apiClient.updateTask(id, updates);
      console.log('[Store] Task updated successfully:', { id });
      set({
        tasks: get().tasks.map(task =>
          task.id === id ? data.task : task
        )
      });

      // Update selected task if it's the one being updated
      if (get().selectedTask?.id === id) {
        set({ selectedTask: data.task });
      }
    } catch (error) {
      console.error('[Store] Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await apiClient.deleteTask(id);
      set({
        tasks: get().tasks.filter(task => task.id !== id),
        selectedTask: get().selectedTask?.id === id ? null : get().selectedTask
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  moveTask: async (id, newStatus) => {
    console.log('[Store] moveTask called:', { taskId: id, newStatus });
    const task = get().tasks.find(t => t.id === id);
    if (!task) {
      console.warn('[Store] Task not found for move:', id);
      return;
    }

    console.log('[Store] Moving task from', task.status, 'to', newStatus);

    // Optimistic update
    set({
      tasks: get().tasks.map(t =>
        t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
    });
    console.log('[Store] Optimistic update applied');

    try {
      await get().updateTask(id, { status: newStatus });
      console.log('[Store] Task move persisted successfully');
    } catch (error) {
      console.error('[Store] Error moving task, reverting:', error);
      // Revert on error
      set({
        tasks: get().tasks.map(t =>
          t.id === id ? { ...t, status: task.status } : t
        )
      });
      console.log('[Store] Reverted task to original status:', task.status);
    }
  },

  assignToAgent: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) {
      console.error('[Store] Task not found for agent assignment:', id);
      return;
    }

    console.log('[Store] ===== Starting Agent Assignment =====');
    console.log('[Store] Task details:', {
      id,
      title: task.title,
      agentId: task.agentId,
      currentStatus: task.status
    });

    try {
      // Update task status to running and move to in-progress
      console.log('[Store] Setting task to running status...');
      await get().updateTask(id, {
        assignedTo: 'agent',
        agentStatus: 'running',
        status: 'in-progress'
      });

      // Call agent execution endpoint
      console.log('[Store] Calling agent execution endpoint:', {
        taskId: id,
        agentId: task.agentId,
        promptPreview: `${task.title.substring(0, 50)}...`
      });

      const data = await apiClient.executeAgent({
        taskId: id,
        agentId: task.agentId,
        prompt: `${task.title}\n\n${task.description}`
      });

      console.log('[Store] Agent execution result:', {
        success: data.success,
        hasResponse: !!data.response,
        responsePreview: data.response?.substring(0, 100)
      });

      // Update task with agent response and move to completed
      console.log('[Store] Updating task with agent response...');
      await get().updateTask(id, {
        agentResponse: data.response,
        agentStatus: data.success ? 'success' : 'error',
        status: 'completed'
      });

      console.log('[Store] ===== Agent Assignment Complete =====');
    } catch (error) {
      console.error('[Store] ===== Agent Assignment Failed =====');
      console.error('[Store] Error assigning to agent:', error);
      await get().updateTask(id, {
        agentStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  setSelectedTask: (task) => set({ selectedTask: task })
}));
