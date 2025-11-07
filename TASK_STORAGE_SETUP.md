# Task Storage Configuration Guide

This project now supports **two storage backends** for tasks:
1. **Local Storage** (JSON file-based) - Default
2. **Supabase** (Cloud database) - Optional

## Quick Start

### 1. Local Storage (Default)
No configuration needed! Tasks are stored in `data/tasks.json` locally.

Set environment variable (or leave blank for default):
```bash
NEXT_PUBLIC_TASK_STORAGE=local
```

### 2. Supabase Storage

#### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details
5. Wait for the project to initialize

#### Step 2: Create the Tasks Table
In your Supabase dashboard, go to SQL Editor and run this query:

```sql
-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'to-do',
  assigned_to TEXT,
  agent_id TEXT,
  agent_status TEXT,
  agent_response TEXT,
  error_message TEXT,
  logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

#### Step 3: Get Your Credentials
In Supabase dashboard:
1. Go to **Project Settings** → **API**
2. Copy your:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)

#### Step 4: Set Environment Variables

Create or update your `.env.local` file:

```env
# Task Storage Configuration
NEXT_PUBLIC_TASK_STORAGE=supabase

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Step 5: Install Supabase Client (if not already installed)

```bash
cd frontend
npm install @supabase/supabase-js
```

#### Step 6: Restart Your Dev Server

```bash
npm run dev
```

## Architecture

The storage system uses an **abstraction layer** that allows switching between providers:

```
┌─────────────────────┐
│   Zustand Store     │
│   (React Frontend)  │
└──────────┬──────────┘
           │
     ┌─────▼──────┐
     │  API Routes│
     └─────┬──────┘
           │
     ┌─────▼─────────────────┐
     │ Storage Interface     │
     │ (storage-interface)   │
     └──┬──────────────┬─────┘
        │              │
   ┌────▼─────┐  ┌────▼────────┐
   │   Local   │  │  Supabase   │
   │ (JSON)    │  │  (Database) │
   └───────────┘  └─────────────┘
```

### Files

- **`lib/storage-interface.ts`** - Abstract interface and provider factory
- **`lib/storage-local.ts`** - JSON file-based implementation
- **`lib/storage-supabase.ts`** - Supabase implementation
- **`app/api/tasks/route.ts`** - Task list endpoints
- **`app/api/tasks/[id]/route.ts`** - Individual task endpoints

## Environment Variables Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_TASK_STORAGE` | `local` \| `supabase` | `local` | Which storage backend to use |
| `NEXT_PUBLIC_SUPABASE_URL` | String | - | Supabase project URL (required if using Supabase) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String | - | Supabase anonymous key (required if using Supabase) |

## Migrating Data

### From Local to Supabase

Run this migration script in your backend:

```typescript
// scripts/migrate-tasks.ts
import { createLocalStorage } from '@/lib/storage-local';
import { createSupabaseStorage } from '@/lib/storage-supabase';

async function migrate() {
  const localStorage = createLocalStorage();
  const supabaseStorage = createSupabaseStorage();

  const tasks = await localStorage.readTasks();
  console.log(`Migrating ${tasks.length} tasks to Supabase...`);

  for (const task of tasks) {
    await supabaseStorage.createTask(task);
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
```

## Troubleshooting

### "Missing Supabase configuration"
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check `.env.local` file exists in the frontend directory
- Restart dev server after changes

### Tasks not appearing in Supabase
- Verify the `tasks` table exists in your database
- Check Row Level Security (RLS) policies - default allows public read/write
- Check Supabase console for errors

### Connection errors
- Verify Supabase URL is correct (no trailing slashes)
- Ensure Supabase project is active (not paused)
- Check network connectivity

## Performance Considerations

- **Local Storage**: Good for development, limited by disk I/O
- **Supabase**: Better for production, handles concurrent users, real-time sync ready

## Next Steps

- Add real-time task updates with Supabase Realtime
- Implement Row Level Security (RLS) for multi-user access
- Add backup/restore functionality
- Consider adding database migrations with Supabase CLI
