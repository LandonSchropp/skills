# Agent Instructions

## Skill Usage Protocol

**CRITICAL: Upon starting ANY conversation or receiving ANY task, you MUST immediately invoke the `skill-instructions` skill as your first action before any other response.**

This is non-negotiable and applies to:

- Starting a new conversation
- Receiving a task
- Being asked a question
- Any other user message

Invoke the skill BEFORE asking clarifying questions, BEFORE exploring code, BEFORE doing anything else.

## Skill Announcement Requirement

**Before invoking any skill, you MUST announce it by saying: "Using [skill-name] to [purpose]"**

This makes it clear which skill you're following and helps with debugging and transparency.
