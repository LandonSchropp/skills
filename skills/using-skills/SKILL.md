---
name: using-skills
description: Use when starting any conversation and before responding to any user message. Establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions.
---

## EXTREMELY IMPORTANT

If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.

## What is a Skill?

A **skill** is a reference guide for proven techniques, patterns, or tools. Skills help agent instances find and apply effective approaches.

Skills are reusable techniques, patterns, tools, and reference guides. Skills are **NOT** narratives about how you solved a problem once.

## How to Access Skills

In Claude Code, use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly. _Never_ use the Read tool on skill files.

For other environments, check your platform's documentation for how skills are loaded.

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

**Skill Invocation Flow:**

1. **User message received** → Evaluate: Might any skill apply?
   - **YES (even 1% chance)** → Invoke the skill
   - **NO (definitely not)** → Respond directly (including clarifications)

2. **After invoking skill** → Announce: "Using \[skill\] to \[purpose\]"

3. **Check skill content** → Does it have a checklist?
   - **YES** → Create a to-do item for each checklist item
   - **NO** → Proceed to next step

4. **Follow skill exactly** → Execute the instructions as written

## Rationalizations

These thoughts mean STOP—you're rationalizing:

| Thought                             | Reality                                                |
| ----------------------------------- | ------------------------------------------------------ |
| "This is just a simple question"    | Questions are tasks. Check for skills.                 |
| "I need more context first"         | Skill check comes BEFORE clarifying questions.         |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first.           |
| "I can check git/files quickly"     | Files lack conversation context. Check for skills.     |
| "Let me gather information first"   | Skills tell you HOW to gather information.             |
| "This doesn't need a formal skill"  | If a skill exists, use it.                             |
| "I remember this skill"             | Skills evolve. Read current version.                   |
| "This doesn't count as a task"      | Action = task. Check for skills.                       |
| "The skill is overkill"             | Simple things become complex. Use it.                  |
| "I'll just do this one thing first" | Check BEFORE doing anything.                           |
| "This feels productive"             | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means"            | Knowing the concept ≠ using the skill. Invoke it.      |

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.
