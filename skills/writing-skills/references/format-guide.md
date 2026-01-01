# Skill Format Guide

## Files and Directory Structure

Skills are organized into a single directory under `skills/<skill-name>` with the following structure:

```
skills/<skill-name>/
├── SKILL.md          (required)
├── SKILL.test.md     (required)
├── references/       (required if you have supporting documentation)
│   └── *
├── scripts/          (required if you have executable scripts)
│   └── *
└── assets/           (required if you have static resources)
    └── *
```

**Required files:**

- `SKILL.md`: The main skill reference file, as described by the [Skill Specification](https://raw.githubusercontent.com/agentskills/agentskills/main/docs/specification.mdx).
- `SKILL.test.md`: The test file, which is detailed in references/testing-guide.md.

In addition, skills can contain extra supporting files:

- `references/*`: Supporting documentation (markdown files, guides, API docs) loaded on-demand
- `scripts/*`: Executable code (Python, Bash, JavaScript, etc.) that agents can invoke
- `assets/*`: Static resources (templates, images, data files)

**IMPORTANT:** These subdirectories are not optional if you have the corresponding file types. If you have supporting markdown documentation, it MUST go in `references/`. If you have executable scripts, they MUST go in `scripts/`. If you have static resources, they MUST go in `assets/`.

## Name

Use active voice, verb-first. Name by what you DO or core insight. Gerunds (-ing) work well for processes.

```yaml
# BAD: Passive, noun form
name: skill-creation

# GOOD: Active, verb-first
name: creating-skills

# BAD: Generic helper name
name: async-test-helpers

# GOOD: Describes what you do
name: condition-based-waiting

# BAD: Passive noun
name: skill-usage

# GOOD: Active gerund
name: using-skills

# BAD: Generic refactoring
name: data-structure-refactoring

# GOOD: Core insight/pattern
name: flatten-with-flags

# BAD: Generic debugging
name: debugging-techniques

# GOOD: Specific technique
name: root-cause-tracing
```

## Description

Describe ONLY when to use the skill, NOT what it does.

**NEVER summarize the skill's process or workflow.** Why? When descriptions include workflow details, Claude follows the description instead of reading the full skill—the skill body becomes documentation Claude skips. Testing showed a description saying "code review between tasks" caused ONE review, even though the skill specified TWO reviews. Changing to "Use when executing implementation plans" (no workflow) fixed this.

**Guidelines:**

- Start the description with "Use when" and include specific symptoms, situations, and contexts.
- Use concrete triggers and symptoms that signal when the skill applies.
- Describe the problem (e.g. race conditions), not language-specific symptoms (e.g. `setTimeout`).
- Keep it technology-agnostic unless the skill is technology-specific.
- Use a third-person perspective.
- Keep it under 500 characters.

```yaml
# BAD: Too much process detail
description: Use for TDD—write test first, watch it fail, write minimal code, refactor

# BAD: Too abstract, vague
description: For async testing

# BAD: First person
description: I can help you with async tests when they're flaky

# BAD: Mentions technology but skill isn't specific to it
description: Use when tests use setTimeout/sleep and are flaky

# GOOD: Triggering conditions only
description: Use when implementing any feature or bugfix, before writing implementation code

# GOOD: Problem-focused description
description: Use when tests have race conditions, timing dependencies, or pass/fail inconsistently

# GOOD: Technology-specific (when skill IS tech-specific)
description: Use when using React Router and handling authentication redirects
```

## Keyword Coverage

Include words Claude would search for throughout the skill body (not just the description):

- **Error messages:** "Hook timed out", `ENOTEMPTY`, "permission denied"
- **Symptoms:** "flaky", "hanging", "slow", "inconsistent"
- **Synonyms:** "timeout/hang/freeze", "cleanup/teardown/dispose"
- **Tools:** Actual commands (`rspec`, `git`), library names (React, Express), file types (`.env`, `package.json`)

## Code Examples

**One excellent example beats many mediocre ones.** One great example is enough. Choose the most relevant language for the example—TypeScript/JavaScript are a good fallback if the language is not obvious.

**Good examples are:**

- Complete and runnable
- Well-commented explaining WHY
- From a real scenario
- Shows the pattern clearly
- Ready to adapt (not generic)

**Avoid:**

- Implementing in multiple languages
- Creating fill-in-the-blank templates
- Writing contrived examples

## Token Efficiency

Frequently-loaded skills appear in EVERY conversation. Every token counts, so keep them concise.

| Skill Type        | Target Word Count |
| ----------------- | ----------------- |
| Always loaded     | < 150             |
| Frequently loaded | < 200             |
| Circumstantial    | < 500             |

You can check the word count with this command:

```bash
wc -w skills/<skill-name>/SKILL.md
```

**Techniques to stay concise:**

- Move details to tool `--help` instead of documenting in skill
- Reference other skills instead of repeating instructions
- Compress examples to essentials
- Don't repeat what's in cross-referenced skills
- Don't explain what's obvious from the command

```markdown
<!-- BAD: Document all flags -->

`search-conversations` supports `--text`, `--both`, `--after <date>`, `--before <date`, `--limit <count>`

<!-- GOOD: Reference help -->

`search-conversations` supports multiple modes and filters. Run `--help` for details.

<!-- BAD: Repeat workflow from another skill -->

Before testing, commit your changes:

1. Run `git status` to check working directory
2. Run `git diff` to see what changed
3. Stage files with `git add`
4. Create commit with descriptive message
   [15 more lines of git workflow details]

<!-- GOOD: Reference other skill -->

Before testing, commit your changes. REQUIRED: Use the `git-workflow` skill for the commit process.
```

## Referencing Other Skills

When referencing other skills, wrap the skill name in backticks and use explicit requirement markers.

```markdown
<!-- GOOD: Explicit requirement marker -->

**REQUIRED:** Use the `test-driven-development` skill

<!-- GOOD: Clear requirement language -->

**REQUIRED:** You MUST use the `using-skills` skill

<!-- BAD: Unclear if required -->

See skills/testing/test-driven-development

<!-- BAD: Force-loads a file -->

@skills/writing-skills/skill-structure.md
```

**Why no `@` links?** `@` syntax force-loads files immediately, consuming 200k+ context before you need them.
