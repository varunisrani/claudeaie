'use client';

import { useState, useEffect } from 'react';
import { AgentConfig } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface AgentSelectorProps {
  value?: string;
  onChange: (agentId: string) => void;
}

export function AgentSelector({ value, onChange }: AgentSelectorProps) {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/agents');
      if (!res.ok) throw new Error('Failed to fetch agents');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const selectedAgent = agents.find(a => a.id === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="agent-select">Agent</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="agent-select">
          <SelectValue placeholder={loading ? "Loading agents..." : "Select an agent"} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>Loading agents...</SelectItem>
          ) : error ? (
            <SelectItem value="error" disabled>Error: {error}</SelectItem>
          ) : agents.length === 0 ? (
            <SelectItem value="none" disabled>No agents available</SelectItem>
          ) : (
            agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                <div className="flex items-center gap-2">
                  {agent.icon && <span>{agent.icon}</span>}
                  <span>{agent.name}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {selectedAgent && (
        <div className="mt-3 p-3 bg-muted rounded-md space-y-2">
          <div className="flex items-center gap-2">
            {selectedAgent.icon && (
              <span className="text-2xl">{selectedAgent.icon}</span>
            )}
            <div>
              <h4 className="font-medium">{selectedAgent.name}</h4>
              <p className="text-xs text-muted-foreground">v{selectedAgent.version}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {selectedAgent.description}
          </p>

          {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedAgent.capabilities.map((cap) => (
                <Badge key={cap} variant="secondary" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>
          )}

          {selectedAgent.requiresMCP && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <span>⚠️</span>
              <span>Requires MCP: {selectedAgent.mcpServers?.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
