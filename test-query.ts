#!/usr/bin/env node

/**
 * Test script for Claude Agent SDK Worker
 * Tests the /query endpoint with various queries
 */

interface QueryRequest {
  query: string;
  accountId?: string;
}

interface QueryResponse {
  success?: boolean;
  response?: string;
  error?: string;
}

const WORKER_URL = "https://claude-agent-worker.solovpxoffical.workers.dev";
const API_KEY = "y11";

async function testQuery(query: string, accountId: string = "default"): Promise<void> {
  console.log(`\n📝 Testing query: "${query}"`);
  console.log(`🔐 Account: ${accountId}`);
  console.log("⏳ Sending request...\n");

  const startTime = Date.now();

  try {
    const response = await fetch(`${WORKER_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        query,
        accountId,
      }),
    });

    const duration = Date.now() - startTime;

    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    const data: QueryResponse = await response.json();

    if (response.ok) {
      console.log("✅ Success!");
      console.log(`📤 Response: ${data.response || "No response"}`);
    } else {
      console.log("❌ Error!");
      console.log(`❌ Error message: ${data.error || "Unknown error"}`);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`⏱️  Failed after: ${duration}ms`);
    console.log(`❌ Request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function testHealth(): Promise<void> {
  console.log("\n🏥 Testing /health endpoint");
  console.log("⏳ Sending request...\n");

  try {
    const response = await fetch(`${WORKER_URL}/health`);
    const data = await response.json();

    console.log("✅ Health check passed!");
    console.log(`📊 Status: ${data.status}`);
    console.log(`🔑 Has API Key: ${data.hasApiKey}`);
    console.log(`📦 Has Container: ${data.hasContainer}`);
    console.log(`⏰ Timestamp: ${data.timestamp}`);
  } catch (error) {
    console.log(`❌ Health check failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Claude Agent SDK Worker - Test Suite");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`\n🎯 Worker URL: ${WORKER_URL}`);

  // Test health endpoint
  await testHealth();

  // Test queries
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Running Query Tests");
  console.log("═══════════════════════════════════════════════════════════");

  await testQuery("What is 2+2?");
  await testQuery("Hello, how are you?");
  await testQuery("Tell me a joke");

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Tests Complete!");
  console.log("═══════════════════════════════════════════════════════════\n");
}

// Run tests
main().catch(console.error);
