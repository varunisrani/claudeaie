import { KanbanBoard } from './components/kanban/KanbanBoard';

export default function Home() {
  console.log('[Home] Page loading - Web app starting...');
  console.log('[Home] Timestamp:', new Date().toISOString());

  return (
    <div className="bg-background p-4 sm:p-6 flex flex-col h-screen">
      <KanbanBoard />
    </div>
  );
}
