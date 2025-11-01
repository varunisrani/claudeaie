import { KanbanBoard } from './components/kanban/KanbanBoard';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <KanbanBoard />
    </div>
  );
}
