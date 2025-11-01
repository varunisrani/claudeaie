'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Terminal,
  Activity,
  DollarSign,
  AlertCircle,
  Download,
  X,
  Maximize2,
  Search,
  Copy,
  CheckCircle,
  Clock,
  Zap,
  MessageSquare,
  FileCode2,
  Sparkles
} from 'lucide-react';

interface AgentLog {
  timestamp: string;
  message: string;
  type?: 'session' | 'message' | 'tool' | 'cost' | 'completion' | 'error' | 'info';
  data?: any;
}

interface AgentLogViewerProps {
  taskId: string;
  isRunning: boolean;
  open: boolean;
  onClose: () => void;
}

export function AgentLogViewer({ taskId, isRunning, open, onClose }: AgentLogViewerProps) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Poll Docker logs while task is running
  useEffect(() => {
    if (open && isRunning) {
      setIsPolling(true);
      fetchLogs();

      pollIntervalRef.current = setInterval(() => {
        fetchLogs();
      }, 2000);
    } else if (open && !isRunning) {
      setIsPolling(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      fetchLogs();
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isRunning, taskId, open]);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/agent/logs?taskId=${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('[AgentLogViewer] Error fetching logs:', error);
    }
  };

  const downloadLogs = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-logs-${taskId.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'session': return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'tool': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'cost': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'completion': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <FileCode2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogBadgeColor = (type: string) => {
    switch (type) {
      case 'session': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'message': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'tool': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cost': return 'bg-green-100 text-green-700 border-green-300';
      case 'completion': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'error': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filterType === 'all' || log.type === filterType;
    const matchesSearch = searchTerm === '' ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderLogEntry = (log: AgentLog, index: number) => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const logType = log.type || 'info';

    return (
      <div
        key={index}
        className="group relative border-l-4 border-gray-200 hover:border-gray-400 pl-4 py-3 transition-all duration-200 hover:bg-gray-50/50"
        style={{ borderLeftColor: logType === 'error' ? '#ef4444' : logType === 'completion' ? '#10b981' : undefined }}
      >
        {/* Timeline dot */}
        <div className="absolute -left-2 top-4 w-3 h-3 bg-white border-2 border-gray-300 rounded-full group-hover:border-gray-500"></div>

        {/* Log header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getLogIcon(logType)}
            <Badge variant="outline" className={`text-xs ${getLogBadgeColor(logType)}`}>
              {logType.toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-500 font-mono">{time}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
            onClick={() => copyToClipboard(log.message, index)}
          >
            {copiedIndex === index ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Log content */}
        <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-md p-3 border border-gray-100">
          {log.message}
        </div>
      </div>
    );
  };

  const logTypeCount = {
    all: logs.length,
    session: logs.filter(l => l.type === 'session').length,
    message: logs.filter(l => l.type === 'message').length,
    tool: logs.filter(l => l.type === 'tool').length,
    cost: logs.filter(l => l.type === 'cost').length,
    error: logs.filter(l => l.type === 'error').length,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] max-h-[85vh] w-full h-full p-0 gap-0 overflow-hidden flex flex-col">
        {/* Hidden title for accessibility */}
        <VisuallyHidden>
          <DialogTitle>Agent Execution Logs</DialogTitle>
        </VisuallyHidden>

        {/* Modern Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 backdrop-blur rounded-lg">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Agent Execution Logs</h2>
                <p className="text-gray-300 text-xs">
                  Task: {taskId.substring(0, 16)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-sm">
                {isRunning ? (
                  <>
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                    <span className="font-medium">Running</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-medium">Completed</span>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={downloadLogs}
                className="text-white hover:bg-white/10 h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b bg-gray-50 px-4 py-2 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(logTypeCount).map(([type, count]) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg transition-all text-sm ${
                  filterType === type
                    ? 'bg-white shadow-sm border border-gray-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {type !== 'all' && getLogIcon(type)}
                  <span className="font-medium capitalize">{type}</span>
                  <Badge variant="secondary" className="text-xs px-1.5">
                    {count}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden bg-white">
          <ScrollArea className="h-full p-4" ref={scrollRef}>
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Terminal className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm ? 'No matching logs found' : 'No logs available'}
              </h3>
              <p className="text-sm text-gray-500">
                {isRunning
                  ? 'Waiting for agent to generate logs...'
                  : searchTerm
                    ? 'Try adjusting your search term'
                    : 'Logs will appear here when the agent executes'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => renderLogEntry(log, index))}
            </div>
          )}
          </ScrollArea>
        </div>

        {/* Footer Stats */}
        <div className="border-t bg-gray-50 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Session: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                <span>{filteredLogs.length} entries</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPolling && (
                <Badge variant="outline" className="animate-pulse">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Live Updates
                  </div>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}