# Landon Schropp's Agent Toolkit

This repository contains my personal configuration for AI agents. It includes reusable configuration
and documentation that work across multiple AI tools, such as Claude Code and Codex CLI.

## Skills

Agent Skills are folders containing a `SKILL.md` file (plus optional scripts, references, and
assets) that AI agents can discover and use. They package domain expertise, extend functionality,
standardize processes, and work across platforms like Claude Code, Codex CLI, Cursor and others.

This repo contains my personal agent skills. They're implemented according to the [Agent
Skills](https://agentskills.io/) specification.

## Inspiration

This repository pulls inspiration from several key sources:

- [Agent Skills](https://agentskills.io): "A simple, open format for giving agents new capabilities
  and expertise."
- [Superpowers](https://github.com/obra/superpowers): A complete software development workflow built
  using skills. See [this blog post](https://blog.fsck.com/2025/10/09/superpowers/) for a primer. My
  implementation is _heavily_ based off of this structure, especially the following skills:
  - [using-superpowers](https://github.com/obra/superpowers/tree/main/skills/using-superpowers)
  - [verification-before-completion](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion)
  - [test-driven-development](https://github.com/obra/superpowers/tree/main/skills/test-driven-development)
  - [writing-skills](https://github.com/obra/superpowers/tree/main/skills/writing-skills)
