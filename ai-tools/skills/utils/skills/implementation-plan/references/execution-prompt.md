```
Read the plan at `<plan-path>`. Read all AGENTS.md files referenced in the plan.
Read the skills referenced in the plan: <list full skill file paths>.
Read <mandatory docs>.

Execute the plan phase by phase (<list phases>). Follow TDD strictly for
TDD phases: write regression guards first (must pass), then RED tests
(must fail), then implement to GREEN, then refactor. After each phase,
re-run the full relevant test suite.
Final review phase: run linter, type check, full test suite, then
code-quality exactly once, code-behavior exactly once, security-analysis exactly once,
then change-analysis exactly once — all as described in the plan.

Do not stop. Do not ask for confirmation between phases. Keep going until
all phases are fully implemented and all checks pass. If a test fails,
fix it before moving on. Update the plan todos as you complete each one.
Do NOT create any git commits.
```
