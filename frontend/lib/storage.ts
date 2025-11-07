import fs from 'fs/promises';
import path from 'path';
import { Task, TasksData } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

/**
 * Ensures the data directory and file exist
 */
async function ensureDataFile(): Promise<void> {
  try {
    console.log('[Storage] Ensuring data directory exists:', DATA_DIR);
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('[Storage] Data directory created/verified');

    try {
      console.log('[Storage] Checking if data file exists:', DATA_FILE);
      await fs.access(DATA_FILE);
      console.log('[Storage] Data file already exists');
    } catch (accessError) {
      // File doesn't exist, create it with empty tasks
      console.log('[Storage] Data file does not exist, creating with empty tasks');
      await fs.writeFile(DATA_FILE, JSON.stringify({ tasks: [] }, null, 2));
      console.log('[Storage] Data file created successfully');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Storage] Error ensuring data file:', {
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
export async function readTasks(): Promise<Task[]> {
  try {
    console.log('[Storage] Reading tasks from:', DATA_FILE);
    await ensureDataFile();
    console.log('[Storage] Data file ensured, reading file...');
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    console.log('[Storage] File read successfully, parsing JSON...');
    const parsed: TasksData = JSON.parse(data);
    console.log('[Storage] Tasks parsed successfully:', { count: parsed.tasks?.length || 0 });
    return parsed.tasks || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Storage] Error reading tasks:', {
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
export async function writeTasks(tasks: Task[]): Promise<void> {
  try {
    await ensureDataFile();
    const data: TasksData = { tasks };
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing tasks:', error);
    throw error;
  }
}

/**
 * Finds a task by ID
 */
export async function findTaskById(id: string): Promise<Task | null> {
  const tasks = await readTasks();
  return tasks.find(task => task.id === id) || null;
}

/**
 * Updates a specific task
 */
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const tasks = await readTasks();
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await writeTasks(tasks);
  return tasks[index];
}

/**
 * Deletes a task by ID
 */
export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await readTasks();
  const filtered = tasks.filter(task => task.id !== id);

  if (filtered.length === tasks.length) return false;

  await writeTasks(filtered);
  return true;
}
