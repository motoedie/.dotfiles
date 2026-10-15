# Large-scope change analysis

Read this reference when the selected scope requires multiple semantic units,
one item exceeds an observed tool or context limit, output is truncated, or a
unit cannot be completed. Do not invent a universal file-count or line-count
threshold.

## 1. Build the coverage ledger

Use each changed path as a stable file ID. For every file, record:

- change status;
- semantic unit IDs;
- whether it is primary, supporting, generated, vendored, or excluded with a
  reason; and
- analysis status.

Define the analysis expected for every semantic unit: outcome, before and after,
flow, contracts and invariants, dependencies, evidence, and claim status.

## 2. Form bounded semantic units

Group by behavior and explicit relationships. Keep entry points,
implementations, schemas, shared types, configuration, consumers, and tests for
one behavior together. Never split alphabetically or into arbitrary equal-sized
batches.

If one coherent unit hits an actual host or tool limit or produces a truncated
result, divide it at a domain boundary such as an API boundary, process stage,
or producer-consumer contract. Give each child the shared contract and
dependency context needed to preserve the relationship.

## 3. Analyze every unit consistently

Each unit result records:

- unit ID and purpose;
- included file IDs;
- completed analysis dimensions;
- before-and-after behavior and flow;
- contracts, dependencies, evidence, and claim status;
- cross-unit concerns; and
- `Complete` or `Incomplete` status with exact gaps.

Units may be analyzed independently or in parallel when the host supports it,
but every unit receives the same analysis contract and resolved scope. Inspect
changed and current content from that scope's selected content source.

## 4. Reconcile and synthesize

Compare returned file and unit IDs with the coverage ledger. Every in-scope file
must be analyzed or have an explicit classification and exclusion reason. Every
unit must contain all required analysis dimensions.

Pass the resolved scope unchanged into synthesis. Synthesize unit results around
the end-to-end behavior. Deduplicate repeated facts, resolve cross-unit flows and
contracts, and reopen primary evidence from the selected content source when a
unit summary is insufficient. If synthesis itself reaches an observed limit,
combine related unit summaries hierarchically and repeat the same reconciliation.

## 5. Handle incomplete work

Do not silently drop an unreadable file, failed unit, missing dependency, or
truncated result. Preserve completed analysis and retain the exact files, units,
or analysis dimensions still missing plus the action needed to continue.

Keep the ledger, unit IDs, file classifications, evidence, and cross-unit
relationships internal. Use them to produce the normal `Summary` and `Main
changes`, folding dependencies into their concrete project impact. When a gap
materially weakens a conclusion, add one concise limitation naming the affected
behavior and uncertainty; do not output a manifest or file-level coverage list
unless the user requests it.
