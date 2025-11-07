import { createClient } from '@supabase/supabase-js';
import { Task } from './types';
import { StorageProvider } from './storage-interface';

class SupabaseStorage implements StorageProvider {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[SupabaseStorage] Initialized with URL:', supabaseUrl);
  }

  /**
   * Reads all tasks from Supabase
   */
  async readTasks(): Promise<Task[]> {
    try {
      console.log('[SupabaseStorage] Reading tasks from Supabase');
      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupabaseStorage] Error reading tasks:', error);
        throw error;
      }

      const tasks = (data || []).map(row => this.rowToTask(row));
      console.log('[SupabaseStorage] Successfully read tasks:', { count: tasks.length });
      return tasks;
    } catch (error) {
      console.error('[SupabaseStorage] Error in readTasks:', error);
      return [];
    }
  }

  /**
   * Creates a new task
   */
  async createTask(task: Task): Promise<Task> {
    try {
      console.log('[SupabaseStorage] Creating task:', { id: task.id, title: task.title });
      const { data, error } = await this.supabase
        .from('tasks')
        .insert([this.taskToRow(task)])
        .select()
        .single();

      if (error) {
        console.error('[SupabaseStorage] Error creating task:', error);
        throw error;
      }

      const createdTask = this.rowToTask(data);
      console.log('[SupabaseStorage] Task created successfully:', { id: createdTask.id });
      return createdTask;
    } catch (error) {
      console.error('[SupabaseStorage] Error in createTask:', error);
      throw error;
    }
  }

  /**
   * Finds a task by ID
   */
  async findTaskById(id: string): Promise<Task | null> {
    try {
      console.log('[SupabaseStorage] Finding task by ID:', id);
      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected
        console.error('[SupabaseStorage] Error finding task:', error);
        throw error;
      }

      return data ? this.rowToTask(data) : null;
    } catch (error) {
      console.error('[SupabaseStorage] Error in findTaskById:', error);
      return null;
    }
  }

  /**
   * Updates a task
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      console.log('[SupabaseStorage] Updating task:', { id });
      const updatedData = {
        ...this.taskToRow(updates as Task),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('tasks')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[SupabaseStorage] Error updating task:', error);
        throw error;
      }

      return data ? this.rowToTask(data) : null;
    } catch (error) {
      console.error('[SupabaseStorage] Error in updateTask:', error);
      return null;
    }
  }

  /**
   * Deletes a task
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      console.log('[SupabaseStorage] Deleting task:', id);
      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[SupabaseStorage] Error deleting task:', error);
        throw error;
      }

      console.log('[SupabaseStorage] Task deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('[SupabaseStorage] Error in deleteTask:', error);
      return false;
    }
  }

  /**
   * Write tasks (bulk operation)
   */
  async writeTasks(tasks: Task[]): Promise<void> {
    try {
      console.log('[SupabaseStorage] Writing tasks (bulk):', { count: tasks.length });

      // Delete all existing tasks
      const { error: deleteError } = await this.supabase
        .from('tasks')
        .delete()
        .neq('id', ''); // Delete all

      if (deleteError) {
        console.error('[SupabaseStorage] Error deleting existing tasks:', deleteError);
        throw deleteError;
      }

      // Insert new tasks
      const { error: insertError } = await this.supabase
        .from('tasks')
        .insert(tasks.map(task => this.taskToRow(task)));

      if (insertError) {
        console.error('[SupabaseStorage] Error inserting tasks:', insertError);
        throw insertError;
      }

      console.log('[SupabaseStorage] Tasks written successfully');
    } catch (error) {
      console.error('[SupabaseStorage] Error in writeTasks:', error);
      throw error;
    }
  }

  /**
   * Convert Task object to Supabase row
   */
  private taskToRow(task: Partial<Task>): Record<string, any> {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      assigned_to: task.assignedTo,
      agent_id: task.agentId,
      agent_status: task.agentStatus,
      agent_response: task.agentResponse,
      error_message: task.errorMessage,
      logs: task.logs,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    };
  }

  /**
   * Convert Supabase row to Task object
   */
  private rowToTask(row: Record<string, any>): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      assignedTo: row.assigned_to,
      agentId: row.agent_id,
      agentStatus: row.agent_status,
      agentResponse: row.agent_response,
      errorMessage: row.error_message,
      logs: row.logs || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export function createSupabaseStorage(): StorageProvider {
  return new SupabaseStorage();
}
