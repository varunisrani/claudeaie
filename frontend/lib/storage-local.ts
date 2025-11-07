import fs from 'fs/promises';
import path from 'path';
import { Task, TasksData } from './types';
import { StorageProvider } from './storage-interface';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

class LocalStorage implements StorageProvider {
  /**
   * Ensures the data directory and file exist
   */
  private async ensureDataFile(): Promise<void> {
    try {
      console.log('[LocalStorage] Ensuring data directory exists:', DATA_DIR);
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log('[LocalStorage] Data directory created/verified');

      try {
        console.log('[LocalStorage] Checking if data file exists:', DATA_FILE);
        await fs.access(DATA_FILE);
        console.log('[LocalStorage] Data file already exists');
      } catch (accessError) {
        // File doesn't exist, create it with empty tasks
        console.log('[LocalStorage] Data file does not exist, creating with empty tasks');
        await fs.writeFile(DATA_FILE, JSON.stringify({ tasks: [] }, null, 2));
        console.log('[LocalStorage] Data file created successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[LocalStorage] Error ensuring data file:', {
        message: errorMessage,
        dataDir: DATA_DIR,
        dataFile: DATA_FILE,
        error: error
      });
      throw error;
    }
  }

  /**
   * Reads all tasks from the JSON file
   */
  async readTasks(): Promise<Task[]> {
    try {
      console.log('[LocalStorage] Reading tasks from:', DATA_FILE);
      await this.ensureDataFile();
      console.log('[LocalStorage] Data file ensured, reading file...');
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      console.log('[LocalStorage] File read successfully, parsing JSON...');
      const parsed: TasksData = JSON.parse(data);
      console.log('[LocalStorage] Tasks parsed successfully:', { count: parsed.tasks?.length || 0 });
      return parsed.tasks || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[LocalStorage] Error reading tasks:', {
        message: errorMessage,
        dataFile: DATA_FILE,
        dataDir: DATA_DIR,
        error: error
      });
      return [];
    }
  }

  /**
   * Writes tasks to the JSON file
   */
  async writeTasks(tasks: Task[]): Promise<void> {
    try {
      await this.ensureDataFile();
      const data: TasksData = { tasks };
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[LocalStorage] Error writing tasks:', error);
      throw error;
    }
  }

  /**
   * Finds a task by ID
   */
  async findTaskById(id: string): Promise<Task | null> {
    const tasks = await this.readTasks();
    return tasks.find(task => task.id === id) || null;
  }

  /**
   * Updates a specific task
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const tasks = await this.readTasks();
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.writeTasks(tasks);
    return tasks[index];
  }

  /**
   * Deletes a task by ID
   */
  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.readTasks();
    const filtered = tasks.filter(task => task.id !== id);

    if (filtered.length === tasks.length) return false;

    await this.writeTasks(filtered);
    return true;
  }

  /**
   * Creates a new task
   */
  async createTask(task: Task): Promise<Task> {
    const tasks = await this.readTasks();
    tasks.push(task);
    await this.writeTasks(tasks);
    return task;
  }
}

export function createLocalStorage(): StorageProvider {
  return new LocalStorage();
}

// Export the instance for backward compatibility
export const localStorageInstance = new LocalStorage();
export const readTasks = () => localStorageInstance.readTasks();
export const writeTasks = (tasks: Task[]) => localStorageInstance.writeTasks(tasks);
export const findTaskById = (id: string) => localStorageInstance.findTaskById(id);
export const updateTask = (id: string, updates: Partial<Task>) => localStorageInstance.updateTask(id, updates);
export const deleteTask = (id: string) => localStorageInstance.deleteTask(id);
