---
name: code-review
description: Static code review of the current changes (diff/PR) with concrete, copy-pastable fixes. Run before pushing or opening a PR to catch security, input-boundary, performance, TypeScript correctness, and edge-case issues — without running any commands or tests.
---

Review $ARGUMENTS

IMPORTANT: Never run any commands — no Nx targets, no tests, no lints, no type checks, no shell commands of any kind. Only read files and analyze code statically.

For every issue found, always include a concrete fix — not just a description.

Pay extra attention to:
- Input validation and data boundary handling
- Security (injection, auth, data exposure)
- Performance (complexity, allocations, queries)
- TypeScript correctness (unsafe `any`, missing narrowing)
- Error handling and edge cases
- Code clarity and maintainability
