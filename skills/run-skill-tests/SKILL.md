---
name: run-skill-tests
description: Use when asked to test, run, or execute skill test scenarios (from SKILL.test.md) or verify a skill works correctly
---

# Testing Skills

## Overview

Test skills by running scenarios with naive subagents in isolated directories, then verify behavior by examining their skill logs.

**The subagent doesn't know it's being tested—it just executes a task and logs which skills it invokes.**

## Step-by-Step Process

**You (the agent reading this) are the test orchestrator.** You set up the environment, invoke the skill-tester subagent, and verify the results.

### 1. Set Up Test

Run `./set-up-skill-test.sh <skill-name> <scenario-name>` to set up the test. The script outputs the test directory's path.

### 2. Invoke Agent

Use the `Task` tool with `subagent_type: ls:skill-tester` and a prompt containing:

```
Working directory: <test-directory>

Task: <task>
```

The `<task>` is the content under the provided scenario's `### Task For Subagent` header.

### 3. Verify Results

Compare the results with the `### Expected Behavior` and `### Success Criteria` headers to determine
if the test passes.

## Example: Testing skill-instructions Scenario 1

### 1. Set Up Test

```bash
./set-up-skill-test.sh skill-instructions scenario-1
# Output: tmp/skill-instructions/scenario-1
```

### 2. Invoke Agent

Use Task tool with `subagent_type: ls:skill-tester` and this prompt:

```
Working directory: skills/tmp/skill-instructions/scenario-1

Task: Write a function in JavaScript that adds two numbers. Create it in add.js.
```

### 3. Verify Results

```bash
cat tmp/skill-instructions/scenario-1/skills.log
# skill-instructions
# test-driven-development
```

**Result**: PASS ✓ - skill-instructions was invoked.

## Important

- Run multiple test scenarios in parallel for efficiency
- Subagent stays naive - never mention "test" or "verify"
- All artifacts should be produced in `tmp/`
- `skills.log` is source of truth for which skills were invoked
- You (orchestrator) determine PASS/FAIL, not the subagent
