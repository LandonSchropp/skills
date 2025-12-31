# Test Scenarios for test-skill

## Scenario 1: Understanding the testing process

### Task For Subagent

Explain how you would test scenario 1 from skills/skill-instructions/SKILL.test.md

### Expected Behavior

- [ ] Subagent should invoke test-skill skill first
- [ ] Subagent should describe the 3-step process: setup, invoke, verify
- [ ] Subagent should mention running the setup script for skill-instructions scenario-1
- [ ] Subagent should mention invoking skill-tester with working directory and task
- [ ] Subagent should mention reading skills.log to verify results

### Success Criteria

Subagent demonstrates understanding of the testing process without actually executing it.

## Scenario 2: Understanding parallel execution

### Task For Subagent

How would you efficiently test both scenarios 1 and 2 from skills/skill-instructions/SKILL.test.md?

### Expected Behavior

- [ ] Subagent should invoke test-skill skill first
- [ ] Subagent should explain running both scenarios in parallel
- [ ] Subagent should mention using a single message with multiple Task tool calls
- [ ] Subagent should describe setting up both test directories and invoking both skill-tester agents simultaneously

### Success Criteria

Subagent demonstrates understanding of parallel test execution for efficiency.
