---
name: write-skill
description: Use when creating or editing any skill-related file (SKILL.md, SKILL.test.md, skill documentation, skill scripts, or skill resources).
---

This skill teaches you how to create effective skills that agents actually follow.

## Test-Driven Development

**Creating skills IS Test-Driven Development for process documentation.**

1. **Red:** Test scenarios with naive subagents, document how they fail without the skill
2. **Green:** Write the skill addressing those specific failures, verify agents now comply
3. **Refactor:** Close loopholes as you discover new rationalizations

**THE IRON LAW: NO SKILL WITHOUT A FAILING TEST FIRST.** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing. This applies to NEW skills AND EDITS to existing skills.

- Did you write the skill before testing it? Delete it. Start over.
- Did you edit the skill without testing it? Delete it. Start over.

**No exceptions:**

- Not for "simple additions"
- Not for "just adding a section"
- Not for "documentation updates"
- Don't keep untested changes as "reference"
- Don't "adapt" while running tests
- Delete means delete

## Required Reading

**STOP. Read these documents NOW. Not later. Not "as you go." Right now.**

You MUST read/fetch ALL of these documents and follow their instructions before proceeding:

- @format-guide.md
- @testing-guide.md
- @getting-agents-to-follow-instructions.md
- [Skill Specification](https://raw.githubusercontent.com/agentskills/agentskills/main/docs/specification.mdx)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)
- [Persuasion Principles](https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-skills/persuasion-principles.md)
- [Testing Skills with Subagents](https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-skills/testing-skills-with-subagents.md)

**No exceptions:**

- Not "I'll read them as I need them"
- Not "I already understand the concepts"
- Not "I'll skim the overview section"
- Not "I'll come back to these later"
- Read means read. Fetch means fetch. Do it now.

## Skill Types

- **Discipline:** Rules and requirements agents must follow (e.g., `test-driven-development`, `verification-before-completion`)
- **Technique:** Concrete methodology with steps to follow (e.g., `condition-based-waiting`, `root-cause-tracing`)
- **Pattern:** Way of thinking about problems (e.g., `flatten-with-flags`, `test-invariants`)
- **Reference:** API docs, syntax guides, tool documentation

## Creating Skill Files

Run `generate-template <skill-directory>` to create both `SKILL.md` and `SKILL.test.md` with proper structure. The skill directory is the path to the specific skill (e.g., `skills/my-skill`), not the skills folder itself.

## Skill Creation Checklist (TDD Adapted)

**IMPORTANT: Use TodoWrite to create todos for EACH checklist item below.**

- [ ] Red: Create test scenarios following @testing-guide.md.
- [ ] Red: Run the scenarios WITHOUT skill. Document the baseline behavior before the skill is added.
- [ ] Red: Identify patterns in rationalizations/failures.
- [ ] Green: Run `generate-template <skill-directory>` to create skill files.
- [ ] Green: Fill in `SKILL.test.md` with test scenarios identified from the Red phase.
- [ ] Green: Write `SKILL.md` following the generated template and @format-guide.md.
- [ ] Green: Address the specific baseline failures identified in Red phase.
- [ ] Green: Include one excellent example.
- [ ] Green: Run the test scenarios WITH the skill. Verify agents now comply.
- [ ] Refactor: Identify NEW rationalizations from testing.
- [ ] Refactor: Add explicit counters following @getting-agents-to-follow-instructions.md.
- [ ] Refactor: Build rationalization table from all test iterations.
- [ ] Refactor: Re-test and iterate until bulletproof.
