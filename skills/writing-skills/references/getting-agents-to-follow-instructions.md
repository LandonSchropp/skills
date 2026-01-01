# Getting Agents to Follow Instructions

Even well-intentioned agents will find loopholes and rationalize exceptions when under pressure. This document shows techniques to close those escape routes—using persuasion principles, explicit anti-rationalization, and careful wording to ensure compliance.

## Use Persuasion

LLMs respond to persuasion techniques the same way humans do—authority language, commitment devices, and social proof increase compliance and prevent rationalization. Understanding the research behind these techniques helps you apply them systematically. Fetch [Persuasion Principles](https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-skills/persuasion-principles.md) for the foundation on authority, commitment, scarcity, social proof, and unity principles.

## Close Every Loophole Explicitly

Agents are smart and will find loopholes when under pressure. Counter this by explicitly forbidding workarounds, not just stating the rule.

Bad (vague):

```markdown
Write code before test? Delete it.
```

Good (explicit):

```markdown
Write code before test? Delete it. Start over.

No exceptions:

- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- Delete means delete
```

## Build Rationalization Table

During baseline testing, document every excuse agents make for violating the rule. These are red flags—signs an agent is about to rationalize their way around the discipline.

Add each to a rationalization table in your skill:

```markdown
| Thought/Excuse                   | Reality                                                                 |
| -------------------------------- | ----------------------------------------------------------------------- |
| "Too simple to test"             | Simple code breaks. Test takes 30 seconds.                              |
| "I'll test after"                | Tests passing immediately prove nothing.                                |
| "Tests after achieve same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |
```

The table directly counters each rationalization, and the closing directive makes the consequence clear.

## Write Preventive Descriptions

The skill's description field should catch agents BEFORE they violate, not after. Write triggers for the moment right before they act, not for when they're already dealing with consequences.

Good (preventive):

```yaml
description: use when implementing any feature or bugfix, before writing implementation code
```

Bad (reactive):

```yaml
description: use when you need to fix bugs in your code
```

The first catches agents at the decision point. The second only helps after they've already violated TDD.
