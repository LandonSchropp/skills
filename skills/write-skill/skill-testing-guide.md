# Testing Skills

## Overview

Test skills by running scenarios with naive subagents in isolated directories, then verify behavior by examining their skill logs.

**The agent doesn't know it's being tested—it just executes a task and logs which skills it invokes.**

## Testing All Skill Types

### Discipline-Enforcing Skills (rules/requirements)

**Examples:** TDD, verification-before-completion, designing-before-coding

**Test with:**

- Academic questions: Do they understand the rules?
- Pressure scenarios: Do they comply under stress?
- Multiple pressures combined: time + sunk cost + exhaustion
- Identify rationalizations and add explicit counters

**Success criteria:** Agent follows rule under maximum pressure

### Technique Skills (how-to guides)

**Examples:** condition-based-waiting, root-cause-tracing, defensive-programming

**Test with:**

- Application scenarios: Can they apply the technique correctly?
- Variation scenarios: Do they handle edge cases?
- Missing information tests: Do instructions have gaps?

**Success criteria:** Agent successfully applies technique to new scenario

### Pattern Skills (mental models)

**Examples:** reducing-complexity, information-hiding concepts

**Test with:**

- Recognition scenarios: Do they recognize when pattern applies?
- Application scenarios: Can they use the mental model?
- Counter-examples: Do they know when NOT to apply?

**Success criteria:** Agent correctly identifies when/how to apply pattern

### Reference Skills (documentation/APIs)

**Examples:** API documentation, command references, library guides

**Test with:**

- Retrieval scenarios: Can they find the right information?
- Application scenarios: Can they use what they found correctly?
- Gap testing: Are common use cases covered?

**Success criteria:** Agent finds and correctly applies reference information

## How to Run Skill Tests

**You (the agent reading this) are the test orchestrator.** You spawn a subagent to run the test and validate the results.

### Workflow

1. **Orchestrator** reads SKILL.test.md to understand the test
2. **Orchestrator spawns a Subagent** to run and validate the test
3. **Subagent runs `run-skill-test` script** which:
   - Runs Claude with the task from the scenario
   - Extracts which skills were invoked
   - Returns the results
4. **Subagent validates** by comparing skills invoked against expected behavior
5. **Subagent determines pass/fail** based on success criteria
6. **Subagent reports** results to orchestrator

### Script Output

The `run-skill-test` script returns minimal data for validation:

```json
{
  "skill_name": "skill-instructions",
  "scenario_number": 1,
  "task": "Write a function in JavaScript that adds two numbers. Create it in add.js.",
  "expected_behavior": "- [ ] Subagent should invoke the skill-instructions skill first",
  "success_criteria": "Subagent invokes skill-instructions before doing anything else",
  "skills_invoked": ["skill-instructions"]
}
```

### Subagent Instructions

When spawned to test a scenario, the subagent should:

1. Run: `run-skill-test <skill-directory> <scenario-number>`
2. Parse the JSON output
3. Compare `skills_invoked` against `expected_behavior`
4. Determine if test passes based on `success_criteria`
5. Report pass/fail with reasoning

### Complete Example: Testing skill-instructions Scenario 1

**Orchestrator spawns subagent with:**

```
Run the test for skills/skill-instructions scenario 1.
Execute the run-skill-test script, evaluate the results against the expected behavior and success criteria, and determine if the test passes.
```

**Subagent executes:**

```bash
run-skill-test skills/skill-instructions 1
```

**Script returns:**

```json
{
  "skill_name": "skill-instructions",
  "scenario_number": 1,
  "task": "Write a function in JavaScript that adds two numbers. Create it in add.js. Don't add tests.",
  "expected_behavior": "- [ ] Subagent should invoke the skill-instructions skill first\n- [ ] Subagent should announce: \"Using skill-instructions to [purpose]\"",
  "success_criteria": "Subagent invokes skill-instructions and announces it before doing anything else",
  "skills_invoked": []
}
```

**Subagent evaluates:**

- Expected: `skill-instructions` should be invoked
- Actual: `skills_invoked` is empty
- **Result: FAIL** - The skill was not invoked

**Subagent reports:** Test FAILED - skill-instructions was not invoked as required.

### Testing Best Practices

- **Run tests in parallel** - Spawn multiple subagents for different scenarios concurrently
- **Keep context clean** - Subagent isolates test execution from orchestrator's context
- **Test directory** - Script creates `tmp/<skill-name>/scenario-<N>` for each test
- **Skills invoked** - Script extracts this from Claude's stream-json output
- **Subagent validates** - Subagent has full context to reason about pass/fail

## Common Rationalizations for Skipping Testing

| Excuse                         | Reality                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| "Skill is obviously clear"     | Clear to you ≠ clear to other agents. Test it.                   |
| "It's just a reference"        | References can have gaps, unclear sections. Test retrieval.      |
| "Testing is overkill"          | Untested skills have issues. Always. 15 min testing saves hours. |
| "I'll test if problems emerge" | Problems = agents can't use skill. Test BEFORE deploying.        |
| "Too tedious to test"          | Testing is less tedious than debugging bad skill in production.  |
| "I'm confident it's good"      | Overconfidence guarantees issues. Test anyway.                   |
| "Academic review is enough"    | Reading ≠ using. Test application scenarios.                     |
| "No time to test"              | Deploying untested skill wastes more time fixing it later.       |

**All of these mean: Test before deploying. No exceptions.**

## RED-GREEN-REFACTOR for Skills

Follow the TDD cycle (see "How to Run Skill Tests" above for the step-by-step process):

### RED: Write Failing Test (Baseline)

Run pressure scenario with subagent WITHOUT the skill. Document exact behavior:

- What choices did they make?
- What rationalizations did they use (verbatim)?
- Which pressures triggered violations?

This is "watch the test fail" - you must see what agents naturally do before writing the skill.

### GREEN: Write Minimal Skill

Write skill that addresses those specific rationalizations. Don't add extra content for hypothetical cases.

Run same scenarios WITH skill. Agent should now comply.

### REFACTOR: Close Loopholes

Agent found new rationalization? Add explicit counter. Re-test until bulletproof.
