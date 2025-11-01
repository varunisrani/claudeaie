import { NextResponse } from 'next/server';

const DOCKER_CONTAINER_URL = process.env.DOCKER_CONTAINER_URL || 'http://localhost:8787';
const API_KEY = process.env.API_KEY || 'test-key';

export async function GET() {
  console.log('[API /agents] GET request received');
  console.log('[API /agents] Docker container URL:', DOCKER_CONTAINER_URL);

  try {
    console.log('[API /agents] Fetching agents from container...');
    const response = await fetch(`${DOCKER_CONTAINER_URL}/agents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('[API /agents] Container response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      throw new Error(`Container returned ${response.status}`);
    }

    const data = await response.json();
    console.log('[API /agents] Agents fetched:', {
      count: data.agents?.length || 0,
      agents: data.agents?.map((a: any) => ({ id: a.id, name: a.name }))
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /agents] Error fetching agents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
