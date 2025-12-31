# Test Scenarios for write-skill

## Scenario 1: Creating a new skill

### Task For Subagent

Create a new skill called "example-skill". Don't run any tests.

### Expected Behavior

- [ ] Subagent should invoke write-skill first

### Success Criteria

Subagent invokes write-skill when creating a new skill.

## Scenario 2: Running test scenarios (NEGATIVE - should NOT invoke write-skill)

### Task For Subagent

Run the test scenarios for the skill-instructions skill.

### Expected Behavior

- [ ] Subagent should NOT invoke write-skill

### Success Criteria

Subagent does not invoke write-skill when running test scenarios.
