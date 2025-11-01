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
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
      await fs.access(DATA_FILE);
    } catch {
      // File doesn't exist, create it with empty tasks
      await fs.writeFile(DATA_FILE, JSON.stringify({ tasks: [] }, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
    throw error;
  }
}

/**
 * Reads all tasks from the JSON file
 */
export async function readTasks(): Promise<Task[]> {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed: TasksData = JSON.parse(data);
    return parsed.tasks || [];
  } catch (error) {
    console.error('Error reading tasks:', error);
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
