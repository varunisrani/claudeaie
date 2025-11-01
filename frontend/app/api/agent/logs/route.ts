import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CONTAINER_NAME = 'claude-agent-local';

/**
 * GET /api/agent/logs?taskId=xxx
 * Fetches logs from the Docker container filtered by task ID
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  console.log('[API /agent/logs] Fetching logs for task:', taskId);

  try {
    // Get Docker container logs
    const { stdout, stderr } = await execAsync(
      `docker logs ${CONTAINER_NAME} --tail 1000`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    const logOutput = stdout || '';

    // Parse logs into structured format
    const lines = logOutput.split('\n').filter(line => line.trim());

    // Filter logs related to this task if taskId is provided
    let filteredLines = lines;
    if (taskId) {
      // Find the start of this task's execution by looking for the task ID line
      const taskStartIndex = lines.findIndex(line => line.includes(`Task ID: ${taskId}`));

      if (taskStartIndex !== -1) {
        // Start from the AGENT EXECUTION START line (usually 1 line before Task ID)
        const executionStartIndex = Math.max(0, taskStartIndex - 1);
        filteredLines = lines.slice(executionStartIndex);

        // Find if there's another task start after this one
        const nextTaskIndex = filteredLines.findIndex((line, index) =>
          index > 5 && line.includes('===== AGENT EXECUTION START =====')
        );

        // If found, only include logs up to the next task
        if (nextTaskIndex !== -1) {
          filteredLines = filteredLines.slice(0, nextTaskIndex);
        }
      } else {
        // If task ID not found, return empty logs
        console.log('[API /agent/logs] Task ID not found in logs:', taskId);
        filteredLines = [];
      }
    }

    // Group related lines into log blocks
    const logs = groupLogLines(filteredLines);

    console.log('[API /agent/logs] Returning', logs.length, 'log entries');

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('[API /agent/logs] Error fetching Docker logs:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch logs',
        logs: []
      },
      { status: 500 }
    );
  }
}

/**
 * Group related log lines into meaningful blocks
 */
function groupLogLines(lines: string[]): any[] {
  const logs: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Session banner (multiple === lines)
    if (line.includes('='.repeat(40))) {
      const blockLines = [line];
      i++;

      // Collect all lines until we hit another separator or significant marker
      while (i < lines.length && !lines[i].includes('='.repeat(40)) && !isBlockStart(lines[i])) {
        blockLines.push(lines[i]);
        i++;

        // Stop at next significant block (max 20 lines for banner)
        if (blockLines.length > 20 || isBlockStart(lines[i])) break;
      }

      logs.push({
        id: `log-${logs.length}`,
        timestamp: new Date().toISOString(),
        message: blockLines.join('\n'),
        type: detectLogType(blockLines.join('\n'))
      });
      continue;
    }

    // Session initialization block
    if (line.includes('[SESSION INITIALIZED]')) {
      const blockLines = [line];
      i++;

      // Collect related lines
      while (i < lines.length && !isBlockStart(lines[i]) && blockLines.length < 10) {
        blockLines.push(lines[i]);
        i++;
      }

      logs.push({
        id: `log-${logs.length}`,
        timestamp: new Date().toISOString(),
        message: blockLines.join('\n'),
        type: 'session'
      });
      continue;
    }

    // Message blocks
    if (line.includes('[MESSAGE #')) {
      const blockLines = [line];
      i++;

      // Collect message content
      while (i < lines.length && !isBlockStart(lines[i]) && blockLines.length < 20) {
        blockLines.push(lines[i]);
        i++;
      }

      logs.push({
        id: `log-${logs.length}`,
        timestamp: new Date().toISOString(),
        message: blockLines.join('\n'),
        type: 'message'
      });
      continue;
    }

    // Tool use blocks
    if (line.includes('[TOOLUSEBLOCK]') || (line.includes('Tool:') && line.includes('[XResearchAgent]'))) {
      const blockLines = [line];
      i++;

      // Collect tool details
      while (i < lines.length && !isBlockStart(lines[i]) && blockLines.length < 15) {
        blockLines.push(lines[i]);
        i++;
      }

      logs.push({
        id: `log-${logs.length}`,
        timestamp: new Date().toISOString(),
        message: blockLines.join('\n'),
        type: 'tool'
      });
      continue;
    }

    // Cost tracking blocks
    if (line.includes('💰 COST TRACKING')) {
      const blockLines = [line];
      i++;

      // Collect all cost-related lines until next separator
      while (i < lines.length && !isBlockStart(lines[i]) && !lines[i].includes('='.repeat(40))) {
        blockLines.push(lines[i]);
        i++;
        if (blockLines.length > 25) break;
      }

      logs.push({
        id: `log-${logs.length}`,
        timestamp: new Date().toISOString(),
        message: blockLines.join('\n'),
        type: 'cost'
      });
      continue;
    }

    // Completion blocks
    if (line.includes('RESEARCH EXECUTION COMPLETE') || line.includes('COST SUMMARY')) {
      const blockLines = [line];
      i++;

      // Collect completion details
      while (i < lines.length && !isBlockStart(lines[i]) && !lines[i].includes('===== AGENT EXECUTION')) {
        blockLines.push(lines[i]);
        i++;
        if (blockLines.length > 30) break;
      }

      logs.push({
        id: `log-${logs.length}`,
        timestamp: new Date().toISOString(),
        message: blockLines.join('\n'),
        type: 'completion'
      });
      continue;
    }

    // Multi-line blocks (like Agent config)
    if (line.includes('Agent config:') || line.includes('[XResearchAgent]')) {
      const blockLines = [line];
      i++;

      // Collect related configuration lines
      while (i < lines.length && !isBlockStart(lines[i])) {
        const nextLine = lines[i];
        blockLines.push(nextLine);
        i++;

        // Stop at closing brace or significant marker
        if (nextLine.trim() === '}' || blockLines.length > 10) break;
      }

      logs.push({
        id: `log-${logs.length}`,
        timestamp: new Date().toISOString(),
        message: blockLines.join('\n'),
        type: 'info'
      });
      continue;
    }

    // Default: single line log
    logs.push({
      id: `log-${logs.length}`,
      timestamp: new Date().toISOString(),
      message: line,
      type: detectLogType(line)
    });
    i++;
  }

  return logs;
}

/**
 * Check if a line starts a new significant block
 */
function isBlockStart(line: string): boolean {
  if (!line) return false;

  return (
    line.includes('[MESSAGE #') ||
    line.includes('[SESSION INITIALIZED]') ||
    line.includes('[TOOLUSEBLOCK]') ||
    line.includes('💰 COST TRACKING') ||
    line.includes('RESEARCH EXECUTION COMPLETE') ||
    line.includes('===== AGENT EXECUTION')
  );
}

/**
 * Detect log type based on content
 */
function detectLogType(content: string): string {
  if (content.includes('SESSION INITIALIZED')) return 'session';
  if (content.includes('[MESSAGE #')) return 'message';
  if (content.includes('[TOOLUSEBLOCK]') || content.includes('Tool:')) return 'tool';
  if (content.includes('💰 COST TRACKING')) return 'cost';
  if (content.includes('COMPLETE') || content.includes('SUMMARY')) return 'completion';
  if (content.includes('ERROR') || content.includes('Error')) return 'error';
  if (content.includes('X (TWITTER) RESEARCH AGENT') || content.includes('Research Topic:')) return 'session';
  return 'info';
}
