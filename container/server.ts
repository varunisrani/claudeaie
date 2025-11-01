import { query } from "@anthropic-ai/claude-agent-sdk";
import http from "node:http";
import * as path from "path";
import { fileURLToPath } from "node:url";
import { AgentRegistry } from "./agents/registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;

console.log("[Container Init] Environment variables:", {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "***set***" : "NOT SET",
  ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL || "NOT SET",
  MODEL: process.env.MODEL || "NOT SET",
});

// Initialize agent registry
const agentsDir = path.join(__dirname, "agents");
const agentRegistry = new AgentRegistry(agentsDir);

console.log("[Container Init] Loading agents...");
agentRegistry.loadAllAgents().then(() => {
  console.log(`[Container Init] ✓ Loaded ${agentRegistry.getAgentCount()} agents`);
  const agents = agentRegistry.listAgents();
  agents.forEach(agent => {
    console.log(`  - ${agent.name} (${agent.id})`);
  });
}).catch(error => {
  console.error("[Container Init] ✗ Failed to load agents:", error);
});

const server = http.createServer(async (req, res) => {
  if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200, { "content-type": "text/plain" });
    return res.end("ok");
  }

  // GET /agents - List available agents
  if (req.url === "/agents" && req.method === "GET") {
    try {
      const agents = agentRegistry.listAgents();
      console.log(`[Container /agents] Returning ${agents.length} agents`);
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ agents }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Container /agents] Error:", errorMessage);
      res.writeHead(500, { "content-type": "application/json" });
      return res.end(JSON.stringify({ error: errorMessage }));
    }
  }

  if (req.url === "/run" && req.method === "POST") {
    let body = "";
    try {
      console.log("[Container /run] Received POST request");

      for await (const chunk of req) {
        body += chunk;
      }

      console.log("[Container /run] Request body:", body);
      const { prompt, agentId, taskId, parameters } = JSON.parse(body || "{}") as {
        prompt?: string;
        agentId?: string;
        taskId?: string;
        parameters?: Record<string, any>;
      };

      if (!prompt) {
        console.log("[Container /run] Error: No prompt provided");
        res.writeHead(400, { "content-type": "application/json" });
        return res.end(JSON.stringify({ error: "No prompt provided" }));
      }

      if (!process.env.ANTHROPIC_API_KEY) {
        console.log("[Container /run] Error: ANTHROPIC_API_KEY not set");
        res.writeHead(500, { "content-type": "application/json" });
        return res.end(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }));
      }

      // Check if agentId is provided - use agent system
      if (agentId) {
        console.log(`[Container /run] ===== AGENT EXECUTION START =====`);
        console.log(`[Container /run] Using agent: ${agentId}`);
        console.log(`[Container /run] Task ID: ${taskId}`);
        console.log(`[Container /run] Prompt preview: ${prompt.substring(0, 100)}...`);

        const agent = agentRegistry.getAgent(agentId);
        if (!agent) {
          console.log(`[Container /run] ERROR: Agent not found: ${agentId}`);
          console.log(`[Container /run] Available agents:`, agentRegistry.listAgents().map(a => a.id));
          res.writeHead(404, { "content-type": "application/json" });
          return res.end(JSON.stringify({ error: `Agent not found: ${agentId}` }));
        }

        const agentConfig = agentRegistry.getConfig(agentId);
        console.log(`[Container /run] Executing agent: ${agentConfig?.name}`);
        console.log(`[Container /run] Agent config:`, {
          name: agentConfig?.name,
          version: agentConfig?.version,
          requiresMCP: agentConfig?.requiresMCP,
          mcpServers: agentConfig?.mcpServers
        });

        const agentContext = {
          taskId: taskId || `task-${Date.now()}`,
          prompt,
          parameters,
          apiKey: process.env.ANTHROPIC_API_KEY!,
          model: process.env.MODEL,
          baseUrl: process.env.ANTHROPIC_BASE_URL
        };

        console.log(`[Container /run] Agent context:`, {
          taskId: agentContext.taskId,
          hasApiKey: !!agentContext.apiKey,
          model: agentContext.model,
          baseUrl: agentContext.baseUrl,
          hasParameters: !!agentContext.parameters
        });

        try {
          console.log(`[Container /run] Calling agent.execute()...`);
          const result = await agent.execute(agentContext);

          console.log(`[Container /run] Agent execution result:`, {
            success: result.success,
            hasResponse: !!result.response,
            hasData: !!result.data,
            hasLogs: !!result.logs,
            logCount: result.logs?.length || 0,
            error: result.error
          });

          if (result.success) {
            console.log(`[Container /run] ===== AGENT EXECUTION SUCCESS =====`);
          } else {
            console.log(`[Container /run] ===== AGENT EXECUTION FAILED =====`);
            console.log(`[Container /run] Error:`, result.error);
          }

          res.writeHead(200, { "content-type": "application/json" });
          return res.end(JSON.stringify(result));
        } catch (error) {
          console.error(`[Container /run] ===== AGENT EXECUTION EXCEPTION =====`);
          console.error(`[Container /run] Exception type:`, error instanceof Error ? error.constructor.name : typeof error);
          console.error(`[Container /run] Exception message:`, error instanceof Error ? error.message : String(error));
          console.error(`[Container /run] Exception stack:`, error instanceof Error ? error.stack : 'No stack trace');
          console.error(`[Container /run] Full error object:`, error);

          res.writeHead(500, { "content-type": "application/json" });
          return res.end(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          }));
        }
      }

      // Default behavior - use direct query (backward compatibility)
      console.log("[Container /run] Using default query (no agentId)");
      console.log("[Container /run] Starting query with:", {
        model: process.env.MODEL || "claude-sonnet-4-5",
        baseUrl: process.env.ANTHROPIC_BASE_URL || "default",
      });

      let responseText = "";
      const response = query({
        prompt,
        options: {
          model: process.env.MODEL || "claude-sonnet-4-5",
          settingSources: ['local', 'project'],
          permissionMode: 'bypassPermissions'
        },
      });

      console.log("[Container /run] Query initialized, waiting for response");

      for await (const message of response) {
        if (message.type === "assistant" && message.message?.content) {
          for (const block of message.message.content) {
            if (block.type === "text") {
              responseText += block.text;
            }

            // Log skill invocations
            if (block.type === "tool_use" && block.name === "Skill") {
              const skillCommand = block.input?.command || "unknown";
              console.log(`[Skill] Invoking skill: ${skillCommand}`);
            }
          }
        }
      }

      console.log("[Container /run] Success, sending response");
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ success: true, response: responseText }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : "No stack";
      console.error("[Container Error] Message:", errorMessage);
      console.error("[Container Error] Stack:", errorStack);
      console.error("[Container Error] Full error:", error);
      res.writeHead(500, { "content-type": "application/json" });
      return res.end(JSON.stringify({
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : "Unknown"
      }));
    }
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`[Container Server] Listening on port ${PORT}`);
  console.log(`[Container Server] API key configured: ${!!process.env.ANTHROPIC_API_KEY}`);
  console.log(`[Container Server] Base URL: ${process.env.ANTHROPIC_BASE_URL || "default"}`);
});
