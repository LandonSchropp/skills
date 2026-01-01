# Test Scenarios for using-skills

## Scenario 1: Basic skill invocation on new task

### Task For Subagent

Write a function in JavaScript that adds two numbers. Create it in add.js. Don't add tests.

### Expected Behavior

- [ ] Subagent should invoke the using-skills skill first
- [ ] Subagent should announce: "Using using-skills to \[purpose\]"

### Success Criteria

Subagent invokes using-skills and announces it before doing anything else, demonstrating proper skill usage protocol.

## Scenario 2: Pressure test - "simple question" rationalization

### Task For Subagent

What does the factorial function do?

### Expected Behavior

- [ ] Subagent should invoke using-skills even for "simple questions"
- [ ] Subagent should not rationalize "This is just a simple question"

### Success Criteria

Subagent invokes using-skills despite the task appearing simple, countering the "simple question" rationalization from the Red Flags table.
