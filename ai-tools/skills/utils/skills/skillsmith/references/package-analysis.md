# Complete package analysis

Read this reference for every existing-skill audit, test, improvement, and
post-edit comparison. It governs Skillsmith's own handling of the target skill
package. Do not replace it with sampling or a judgment that the package looks
small enough to inspect informally.

## Build the package ledger

Before semantic conclusions:

1. Resolve the target root and applicable repository or host instructions.
2. Enumerate every regular file below the target root. When Python is available,
   run `analyze_skill.py <target-root> --format json` using the script linked in
   `SKILL.md`; use its `package_files` inventory and record its `excluded_paths`.
   Otherwise use a deterministic file listing and record exclusions. Exclude only
   version-control internals and generated caches. The inventory includes source
   files and assets; `text_analysis` identifies supported document types, not
   proof that any file's behavior or content has been fully inspected.
3. Create one ledger row per file with its path, type, discovered callers or
   routes, expected role, inspection method, and status.
4. Trace links transitively from `SKILL.md`. Also trace indirect execution paths,
   such as a reference invoking a script by command, rather than treating the
   absence of a Markdown link as proof that a resource is unused.
5. Inspect every instruction and evaluation file. For scripts, inspect the
   interface and behavior needed to establish their contract; execute or read
   deeper when that evidence is insufficient. For assets or binary files,
   inspect metadata and consumers unless their contents affect behavior.

Allowed statuses are `complete`, `interface-proven`, `excluded-generated`, and
`inaccessible`. Record evidence for every status except `complete`. Never mark
the package fully analyzed while a row is `inaccessible` or has no status.

Process the ledger in dependency order: `SKILL.md` first; then each routed mode
in entrypoint order together with its transitive references and scripts; then
evals, assets, and files with no proven route. Record a summary for every pass,
even when it contains one file. Each summary retains file paths, routes, feature
identifiers, invariants, thresholds, inputs, outputs, and unresolved dependencies.
Reconcile all summaries against the original ledger before writing findings. Do
not sample files.

## Prove feature and optimization coverage

Build the feature inventory required by `existing-skills.md`, assigning a stable
identifier to each feature and mapping every feature to its defining files.
Then record exactly one result for every Skillsmith check below:

- artifact fit and target portability;
- discovery and routing precision;
- behavioral preservation and authorization boundaries;
- workflow ordering, completion behavior, and failure handling;
- instruction structure, salience, duplication, and contradictions;
- activation and conditional context cost;
- resource routing and dependency availability;
- deterministic script-extraction opportunities;
- target-workflow large-input handling; and
- evaluation coverage and regression protection.

The result is `applicable` with findings or `not-applicable` with concrete
evidence. A check cannot disappear because another check produced many findings.
When the target workflow matches the large-input trigger, execute the full
`large-input-analysis.md` assessment rather than merely noting it.

## Completion evidence

The findings report includes the per-file ledger, the feature inventory, the ten
check results, and any inaccessible or unverified behavior. Verify that:

- enumerated files equal completed, interface-proven, excluded, and inaccessible
  rows with no duplicates;
- every feature maps to at least one defining file and observable behavior;
- every proposal maps to affected feature identifiers; and
- every required check has one recorded result.

After approved edits, update the same ledgers, compare them with the pre-edit
versions, and run affected behavior checks. Any unexplained missing file, feature,
route, threshold, or output is a regression or an incomplete result, not a token
optimization.
