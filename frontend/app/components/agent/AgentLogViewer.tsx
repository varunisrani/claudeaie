'use client';

import { useEffect, useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogEntry, LogLevel } from '@/lib/types';
import { format } from 'date-fns';

interface AgentLogViewerProps {
  taskId: string | null;
  initialLogs?: LogEntry[];
}

export function AgentLogViewer({ taskId, initialLogs = [] }: AgentLogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!taskId) {
      setLogs(initialLogs);
      return;
    }

    const eventSource = new EventSource(`/api/agent/stream?taskId=${taskId}`);

    eventSource.onmessage = (event) => {
      const log: LogEntry = JSON.parse(event.data);
      setLogs(prev => [...prev, log]);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [taskId]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogBadge = (level: LogLevel) => {
    switch (level) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">Warning</Badge>;
      case 'info':
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agent Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4" ref={scrollRef}>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No logs yet</p>
              <p className="text-xs mt-1">Logs will appear here when the agent starts executing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 border-b pb-2 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), 'HH:mm:ss')}
                    </span>
                    {getLogBadge(log.level)}
                  </div>
                  <p className="text-sm">{log.message}</p>
                  {log.metadata && (
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
