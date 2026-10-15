# Target-workflow large-input analysis

Read this reference when the target skill's runtime workflow accepts a variable
collection of files or artifacts, or one artifact that can exceed a single
analysis unit. It governs the user-skill being designed or audited, not
Skillsmith's inspection of the skill package itself.

The feature is applicable regardless of the current example's file count. A
small input may form one work unit, but scope and coverage accounting still run.
Mark it not applicable only when the target contract proves that input is fixed
and bounded.

## Define the workload contract

Establish all of these before proposing instructions:

1. how the complete input scope is enumerated and which exclusions are valid;
2. which analyses every in-scope item must receive;
3. which relationships must remain visible, such as callers and callees, shared
   types, configuration, ownership, or chronological order;
4. whether coverage must be exhaustive or the user explicitly permits sampling
   or staged narrowing;
5. existing size thresholds, host or tool limits, output limits, and failure
   signals such as truncation; and
6. the final output, evidence, ordering, and incomplete-result contract.

Preserve an existing threshold unless an approved proposal changes it. For a new
skill, set a threshold only from a user constraint, an actual host or tool limit,
repository precedent, or a measured evaluation. Do not invent a universal file,
line, or token count. With no evidenced threshold, use the pipeline for every
input and let semantic grouping yield one or more units; do not claim an
optimized capacity limit until it is measured.

## Require the scalable pipeline

Design or assess the target workflow in this order:

1. **Enumerate.** Produce a deterministic manifest of every in-scope item before
   analysis. Assign stable identifiers and record excluded items with reasons.
2. **Reduce mechanics.** Determine whether parsing, metadata extraction,
   filtering, counting, dependency discovery, or grouping rules can run in a
   deterministic script. If yes, apply the script-extraction contract and pass
   bounded structured results onward. If no, record why agent judgment is needed.
3. **Construct semantic work units.** Group by explicit relationships from the
   workload contract, not arbitrary filename order or equal-sized slices. Keep
   tightly coupled items together. One unit is valid. If a unit hits a known
   host/tool limit or observed truncation, subdivide at a domain boundary and
   repeat the shared contract and dependency context in each child unit.
4. **Analyze every unit.** Apply all required analysis dimensions to every unit.
   Emit the same schema: unit ID, included item IDs, completed checks, evidence,
   findings, external dependencies, cross-unit concerns, and status.
5. **Reconcile coverage.** Compare unit item IDs with the original manifest.
   Duplicate analysis is allowed when relationships require it, but every
   in-scope item must appear and every required check must have a result.
6. **Synthesize hierarchically.** Combine unit results, deduplicate findings by
   evidence and cause, resolve cross-unit relationships, and re-open original
   evidence when summaries are insufficient. Apply the same process recursively
   when one synthesis pass would exceed a known limit.
7. **Verify completion.** Confirm full manifest coverage, all required checks,
   resolved cross-unit concerns, and final-output compliance before claiming a
   complete result.

Sampling or staged narrowing may replace exhaustive unit analysis only when the
user or target contract explicitly allows incomplete coverage. Label the result
accordingly; priority is not a substitute for coverage.

## Failure behavior

Do not silently drop an unreadable item, failed unit, truncated result, or missing
dependency. Retry only when the target workflow authorizes it and has a
proportional bound. Otherwise preserve successful unit results, identify exact
coverage gaps, and return `incomplete` with the action needed to continue.

For an existing skill, report missing or weak stages as named proposals and wait
for approval. Verification must exercise a small one-unit input, multiple
semantically separate units, a tightly coupled input that rejects arbitrary
splitting, an oversized single item, and a partial unit failure.
