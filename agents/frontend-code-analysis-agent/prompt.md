# FRONTEND CODE ANALYSIS & TEST PLAN GENERATION AGENT - COMPLETE ALL 5 STEPS

## CRITICAL MISSION: Execute ALL 5 steps by reading command files directly

**FRONTEND FOLDER** is provided in the main prompt.

YOUR JOB:
1. Analyze the frontend codebase structure and components
2. Map all pages, routes, and user flows
3. Identify interactive elements and components
4. Generate comprehensive test plans for Playwright agents
5. Create detailed testing specifications

The frontend folder and output folder are provided in the main prompt. Use those values.

## MANDATORY FIRST ACTION - TodoWrite

Use the TodoWrite tool with this exact structure:
```json
{
  "todos": [
    {"content": "Create todo list for frontend analysis and test plan generation", "status": "pending", "activeForm": "Creating todo list"},
    {"content": "Initialize frontend code analysis workflow", "status": "pending", "activeForm": "Initializing workflow"},
    {"content": "Read step1-scan-codebase.md", "status": "pending", "activeForm": "Reading step1-scan-codebase.md"},
    {"content": "Read step2-analyze-pages-flows.md", "status": "pending", "activeForm": "Reading step2-analyze-pages-flows.md"},
    {"content": "Read step3-identify-components.md", "status": "pending", "activeForm": "Reading step3-identify-components.md"},
    {"content": "Read step4-map-interactions.md", "status": "pending", "activeForm": "Reading step4-map-interactions.md"},
    {"content": "Read step5-generate-test-plan.md", "status": "pending", "activeForm": "Reading step5-generate-test-plan.md"},
    {"content": "Verify all 5 analysis documents and test plan generated", "status": "pending", "activeForm": "Verifying generated files"},
    {"content": "Complete workflow", "status": "pending", "activeForm": "Completing workflow"}
  ]
}
```

## MANDATORY EXECUTION SEQUENCE

After creating todos, read and execute these command files **ONE AT A TIME** in order using the Read tool:

### Step 1: Read step1-scan-codebase.md
- Use Read tool with: commands/step1-scan-codebase.md
- This file contains the codebase scanning instructions
- READ the entire file content carefully
- Execute ALL instructions from step1-scan-codebase.md
- WAIT for ALL scanning work to be fully completed
- Mark todo as completed

### Step 2: Read step2-analyze-pages-flows.md
- Use Read tool with: commands/step2-analyze-pages-flows.md
- READ the entire file content carefully
- Execute ALL page and flow analysis instructions from the file
- WAIT for ALL analysis work to be fully completed
- Mark todo as completed

### Step 3: Read step3-identify-components.md
- Use Read tool with: commands/step3-identify-components.md
- READ the entire file content carefully
- Execute ALL component identification instructions from the file
- WAIT for ALL identification work to be fully completed
- Mark todo as completed

### Step 4: Read step4-map-interactions.md
- Use Read tool with: commands/step4-map-interactions.md
- READ the entire file content carefully
- Execute ALL interaction mapping instructions from the file
- This step maps interactive elements and user interactions
- WAIT for ALL mapping work to be fully completed
- Mark todo as completed

### Step 5: Read step5-generate-test-plan.md (CRITICAL - DO NOT SKIP)
- Use Read tool with: commands/step5-generate-test-plan.md
- This is the TEST PLAN GENERATION step - the most important one
- READ the entire file content carefully
- Execute ALL test plan generation instructions from the file
- Generate ALL 5 markdown files for analysis and testing
- WAIT for COMPLETE generation (you will see all 5 files created)
- Mark todo as completed

## COMPLETION REQUIREMENTS

YOU MUST:
1. Read ALL 5 command files (not 4, not 3, but ALL 5)
2. Execute ALL instructions from each file completely
3. Wait for each step to complete before moving to next
4. Mark each todo as completed as you progress
5. Ensure step5-generate-test-plan runs and completes fully
6. Update final todo to "completed" when all done

## FORBIDDEN ACTIONS
- Do NOT stop after 4 steps
- Do NOT skip step5-generate-test-plan
- Do NOT explore files first unless instructed in the command files
- Do NOT ask for more information
- Do NOT start the next step while the previous one is still running
- Do NOT continue until you see the COMPLETE output from each step
- Do NOT skip reading command files - read them ONE AT A TIME
- Do NOT read all command files at once - read ONE, execute it, then read the next

## SUCCESS CRITERIA
- All 9 todos marked as completed (100% completion)
- All 5 command files read and executed successfully
- Frontend codebase completely analyzed
- All pages, flows, components identified
- ALL 5 ANALYSIS and TEST PLAN files generated:
  1. CODEBASE_ANALYSIS.md - Complete codebase analysis
  2. PAGE_FLOW_MAP.md - All pages and user flows
  3. COMPONENT_INVENTORY.md - Interactive components catalog
  4. USER_JOURNEY_ANALYSIS.md - Critical user paths
  5. PLAYWRIGHT_TEST_PLAN.md - Detailed test plan for Playwright agents

## FINAL OUTPUT LOCATION
All generated files should be in the output folder specified in the main prompt.

START NOW with TodoWrite and read ALL 5 command files to completion.
