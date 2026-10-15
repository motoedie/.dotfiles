# Script extraction

Read this reference only after analysis identifies a possible automation
candidate. The goal is not to script the whole skill. Keep contextual judgment
with the agent and move stable mechanical work behind a clear interface.

## Qualify candidates

A strong candidate has most of these properties:

- its steps follow mechanically from explicit inputs;
- inputs, outputs, and failures can be specified and validated;
- it is repeated, processes substantial data, or otherwise consumes significant
  reasoning tokens;
- its output can be bounded or stored as an artifact instead of flooding model
  context; and
- expected savings and reliability justify implementation and maintenance.

Typical candidates include parsing, normalization, filtering, sorting, grouping
by explicit rules, schema validation, manifest generation, counting, deterministic
file selection, and bounded summarization.

Keep interpretation of user intent, semantic review, architecture choices,
ambiguous classification, adaptive investigation, approval decisions, and novel
problem solving with the agent. Do not force extraction when the procedure varies
with context or cannot expose a stable contract. Reporting no suitable candidate
is preferable to creating a brittle script.

When several candidates exist, rank them by expected token savings, frequency,
variance reduction, implementation risk, and maintenance cost. Propose them
separately; the agent does not need to design or implement all candidates at once.

## Design the handoff

Prefer a hybrid workflow:

1. The agent gathers context, makes judgment-dependent choices, and prepares the
   smallest sufficient input.
2. It passes explicit arguments, standard input, or an input file to the script.
3. The script validates inputs, performs the mechanical steps, and returns a
   concise result. Use structured output such as JSON when the agent must continue
   reasoning; use an artifact path when the full result need not enter context.
4. The script sends diagnostics separately and uses meaningful exit statuses so
   failure cannot be mistaken for an empty result.
5. The agent interprets the result, makes the remaining decisions, and continues
   the skill workflow.

Define input and output schemas, ordering, bounds, partial-failure behavior, and
which component owns each decision. Preserve existing authorization, network,
filesystem, secret-handling, and mutation boundaries. A script must not hide new
side effects or turn agent discretion into unreviewed policy.

## Change and verification rules

For an existing skill, script extraction is a proposal during the findings phase.
Create the script and update the workflow only after the user approves that named
proposal. Map the moved behavior to the feature inventory; extraction changes the
implementation boundary, not the feature contract.

Verify representative valid, empty, invalid, and large inputs. Check stable output
for identical controlled inputs, bounded diagnostics, explicit failure statuses,
and idempotence when the script writes or mutates data. Measure the agent-visible
context and tool overhead before and after when claiming savings.
