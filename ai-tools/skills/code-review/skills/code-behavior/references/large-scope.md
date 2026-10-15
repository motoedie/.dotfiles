# Large-scope grouping

The goal is complete selected-pass coverage without giving one reviewer the
whole change.

Group the reviewable-file map as is, with file paths as stable IDs and no extra
exclusions. Group by project, feature, or module boundary, keeping callers,
implementations, shared types, API mappings, and related tests together, in the
fewest groups of at most 20 files and 2,000 changed lines. Split only at a real
module or feature boundary, never alphabetically or into arbitrary equal chunks.
An indivisible unit that still exceeds a limit becomes stable function or domain
subunits; if no meaningful split exists, record it as unreviewed.

Record each group's stable ID, file IDs, and selected passes in a coverage
ledger. Groups may run in parallel, one reviewer each, told its group ID and
that it is one of several groups; never run one subagent per pass. Before
synthesis, compare the reviewers' returns (see `review-rules.md`) with the
ledger: a usable result covers its whole group even if its lists miss entries,
duplicate or unexpected results change nothing, and a group without a usable
result is unreviewed while the other groups' findings stay.

Give the synthesis subagent the group summaries and findings and the ledger. If
synthesis fails, the combined group findings go to verification instead; never
silently drop a group.
