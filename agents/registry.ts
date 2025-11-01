import { BaseAgent, AgentConfig } from './base-agent';
import * as fs from 'fs';
import * as path from 'path';

export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();
  private configs: Map<string, AgentConfig> = new Map();

  constructor(private agentsDir: string) {}

  // Load all agents from the agents directory
  async loadAllAgents(): Promise<void> {
    console.log(`[AgentRegistry] Loading agents from: ${this.agentsDir}`);

    try {
      const entries = fs.readdirSync(this.agentsDir, { withFileTypes: true });
      const dirs = entries.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'));

      console.log(`[AgentRegistry] Found ${dirs.length} potential agent directories`);

      for (const dir of dirs) {
        try {
          await this.loadAgent(dir.name);
        } catch (error) {
          console.error(`[AgentRegistry] Failed to load agent ${dir.name}:`, error);
        }
      }

      console.log(`[AgentRegistry] Successfully loaded ${this.agents.size} agents`);
    } catch (error) {
      console.error('[AgentRegistry] Error loading agents:', error);
    }
  }

  // Load a specific agent by folder name
  async loadAgent(agentId: string): Promise<void> {
    const agentPath = path.join(this.agentsDir, agentId);
    const configPath = path.join(agentPath, 'config.json');
    const agentFilePath = path.join(agentPath, 'agent.js'); // Compiled JS file

    console.log(`[AgentRegistry] Loading agent: ${agentId}`);

    // Check if config exists
    if (!fs.existsSync(configPath)) {
      throw new Error(`Agent config not found: ${configPath}`);
    }

    // Load config
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config: AgentConfig = JSON.parse(configData);

    // Check if compiled agent file exists
    if (!fs.existsSync(agentFilePath)) {
      throw new Error(`Agent implementation not found: ${agentFilePath}`);
    }

    // Dynamically import agent implementation
    const agentModule = await import(agentFilePath);
    const AgentClass = agentModule.default || agentModule.Agent;

    if (!AgentClass) {
      throw new Error(`No default export found in ${agentFilePath}`);
    }

    const agent = new AgentClass(config);

    this.agents.set(agentId, agent);
    this.configs.set(agentId, config);

    console.log(`[AgentRegistry] ✓ Loaded agent: ${config.name} (${agentId})`);
  }

  // Get agent by ID
  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  // Get agent config by ID
  getConfig(agentId: string): AgentConfig | undefined {
    return this.configs.get(agentId);
  }

  // List all available agents
  listAgents(): AgentConfig[] {
    return Array.from(this.configs.values());
  }

  // Search agents by capability or tag
  searchAgents(query: {
    capability?: AgentCapability;
    tag?: string;
    name?: string;
  }): AgentConfig[] {
    return this.listAgents().filter(config => {
      if (query.capability && !config.capabilities.includes(query.capability)) {
        return false;
      }
      if (query.tag && !config.tags.includes(query.tag)) {
        return false;
      }
      if (query.name && !config.name.toLowerCase().includes(query.name.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  // Check if an agent exists
  hasAgent(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  // Get total count of loaded agents
  getAgentCount(): number {
    return this.agents.size;
  }
}

type AgentCapability =
  | 'web-research'
  | 'code-generation'
  | 'code-review'
  | 'data-analysis'
  | 'task-execution'
  | 'file-operations'
  | 'api-integration';
