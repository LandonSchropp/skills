# Test Scenarios for writing-skills

## Scenario 1: Creating a new skill

### Task For Subagent

Create a new skill called "example-skill". Don't run any tests.

### Expected Behavior

- [ ] Subagent should invoke writing-skills first

### Success Criteria

Subagent invokes writing-skills when creating a new skill.

## Scenario 2: Running test scenarios (NEGATIVE - should NOT invoke writing-skills)

### Task For Subagent

Run the test scenarios for the using-skills skill.

### Expected Behavior

- [ ] Subagent should NOT invoke writing-skills

### Success Criteria

Subagent does not invoke writing-skills when running test scenarios.
