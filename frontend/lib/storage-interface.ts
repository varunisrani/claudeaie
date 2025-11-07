import { Task } from './types';

export interface StorageProvider {
  readTasks(): Promise<Task[]>;
  writeTasks(tasks: Task[]): Promise<void>;
  findTaskById(id: string): Promise<Task | null>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  createTask(task: Task): Promise<Task>;
}

export type StorageType = 'local' | 'supabase';

let storageProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    const storageType = (process.env.NEXT_PUBLIC_TASK_STORAGE || 'local') as StorageType;

    if (storageType === 'supabase') {
      const { createSupabaseStorage } = require('./storage-supabase');
      storageProvider = createSupabaseStorage();
    } else {
      const { createLocalStorage } = require('./storage-local');
      storageProvider = createLocalStorage();
    }
  }
  return storageProvider!;
}

export function resetStorageProvider() {
  storageProvider = null;
}
