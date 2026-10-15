---
name: change-analysis
description: Report-only project-impact summary of current branch changes. Explains what changed and the concrete effects on system behavior, UX, workflows, contracts, compatibility, and operations. Use before opening an MR or when a reviewer needs concise project context. Does not perform defect, maintainability, or security review.
---

# Change Analysis

## Purpose

Build the mental model a reviewer needs to understand a branch. Internally
account for the complete selected scope and supporting evidence, then report
only the project-level change and its concrete consequences. Do not expose the
working decomposition as the deliverable.

This skill is report-only and read-only. It does not find defects, security
vulnerabilities, maintainability problems, or test gaps, and it does not approve
the change.

## Arguments

Read [the argument reference](references/arguments.md) and resolve one analysis
scope. Take the arguments from the message that invoked this skill; with none,
analyze the current branch against the detected baseline, including staged,
unstaged, and non-ignored untracked changes.

For substantive Jira content, follow
[the Jira acceptance workflow](references/jira-acceptance.md). Ignore missing,
unavailable, or fetch-error placeholders. Keep the resolved Git scope unchanged.

## Workflow

### 1. Establish scope and coverage

Apply any scope override from the arguments. Otherwise identify the current
branch and its merge baseline against `main`, `master`, or the default remote
branch. Record the comparison baseline, selected content source, and path
filters as the resolved scope defined in `references/arguments.md`. Use that
scope unchanged for the manifest, every semantic unit, and synthesis.

Use available read-only repository tools, normally Git, to build a deterministic
manifest of every changed file. Record add, modify, delete, and rename status.
Assign every file to at least one semantic change unit, classifying its role as
primary, supporting, generated, or vendored, or record an explicit exclusion
reason. Do not silently omit files.

### 2. Construct semantic change units

Group files by the behavior or contract they implement, not merely by directory,
extension, or equal-sized batches. Keep entry points, implementations, shared
types, schemas, configuration, consumers, and relevant tests together when they
describe one change. A branch may contain one change unit.

Inspect changed hunks and the corresponding base and current implementations to
establish what happened before and what happens now. Read neighboring callers,
callees, consumers, types, configuration, and tests only where they establish a
relationship or support a material claim.

If the scope contains multiple semantic change units, an item exceeds an
observed tool or context limit, analysis is truncated, or any unit fails, read
and follow [the large-scope workflow](references/large-scope.md).

### 3. Model each change

For each semantic change unit, establish:

- the user-visible or system-level outcome;
- the trigger or entry point and the resulting control, data, or state flow;
- the concrete before-and-after behavior;
- changed APIs, schemas, configuration, state transitions, side effects, and
  other contracts or invariants;
- dependencies on other change units or unchanged project behavior; and
- how changed tests or other repository evidence demonstrate the implemented path.

Anchor every material claim to a changed location and, where needed, a relevant
unchanged caller, consumer, contract, or test. Use `path:line`, `path:symbol`, or
a specific changed area. Classify claims as:

- **Observed** — directly established by repository evidence.
- **Inferred** — the evidence supports the explanation but does not state it.
- **Unresolved** — the repository cannot establish the answer.

Do not infer product intent from implementation alone. Branch names, commit
messages, and local documentation may support intent, but distinguish them from
implemented behavior.

### 4. Identify implemented flows

A **flow** is an ordered sequence the change implements or materially alters, in
which a trigger leads through intermediate steps to an outcome — an event that
starts a job that writes a result that something else reads. A single call, a
configuration change, a rename, or an unordered set of edits is not a flow.

Identify each distinct flow. Two sequences are distinct when they have different
triggers or different outcomes; do not merge distinct flows into one diagram and
do not split one flow across several. A branch may implement no flow, one, or
several.

For each flow, render exactly one Mermaid `flowchart` diagram:

- label nodes with the concrete actor that acts — a job, script, endpoint,
  service, or table — not with abstract step numbers;
- label edges with what causes the transition;
- include a decision node only where the change actually implements a branch;
- keep a diagram to roughly twelve nodes. If it needs more, it is either two
  flows or drawn at too low a level.

Give every flow a short, specific name that says what the flow does — for
example "Flow A — MR note posting" or "Flow B — once-per-MR skip", not "Flow 1"
or "Main flow". Letter the flows A, B, C in the order they are presented, and
put the name in a `####` heading directly above its diagram so a reader can tell
the diagrams apart at a glance.

Under the heading and before the diagram, write one sentence: what triggers the
flow and what it produces. That is the only prose a flow gets — the diagram is
the explanation, so do not narrate its steps. Omit the section entirely when the
change implements no flow; do not invent one to fill it.

The rest of the report must use these names. When a summary sentence or a main
change concerns a flow, refer to it by name — "see Flow A", or "the skip check
in Flow B" — instead of re-describing the steps. A reader should be able to move
from any sentence to the diagram it talks about, and a flow no other section
mentions is a sign the text and the diagrams have drifted apart.

### 5. Write the project summary

Synthesize the internal units into project-level topics. For each topic, connect
what changed to its concrete effect on a user, system, workflow, data flow,
contract, integration, deployment, or operation. Include a constraint,
compatibility effect, or rollout consequence when it materially changes how the
result behaves or is adopted.

An impact statement must name the affected actor, surface, or flow and explain
how its behavior changes. Do not substitute generic claims such as "improves
UX," "affects grouping," or "changes the backend." When evidence establishes
the mechanism but not its consequence, say what remains uncertain instead of
inventing an impact.

Topics are human-facing project concepts, not semantic-unit IDs. Merge related
implementation details into the behavior and consequence they collectively
produce. Avoid repeating the summary in the topics.

Be brief. A reviewer reads this once, before opening the diff; a report they
have to skim has already failed. Prefer the consequence over the mechanism, and
cut anything a reader could learn as fast from the diff itself. In particular do
not enumerate configuration keys, default values, flag names, timeouts, file
paths, or directory listings — name the capability and its effect instead, and
mention a specific value only when that value *is* the change.

Keep file manifests, file roles, evidence anchors, claim-status labels, unit
dependencies, and coverage ledgers internal. Do not print file paths unless the
user asks for evidence or a specific location is essential to an unresolved
question.

Add an **Open questions** section only when the repository cannot answer a
specific product, architectural, compatibility, deployment, or operational
question. State the question, why local evidence cannot resolve it, and what
behavior depends on the answer. Omit the section when there are no questions.

### 6. Verify completion

Reconcile analyzed and excluded file IDs with the original manifest. Before
claiming completion, confirm that every semantic unit received the analysis in
step 3 and that cross-unit relationships were synthesized.

If a file, unit, dependency, or required analysis could not be completed,
preserve successful results and keep the exact coverage gap internally. Add one
concise limitation explaining which reported topic or conclusion is uncertain
and why. Do not print the manifest or a file-level gap list unless the user asks
for it. Priority or sampling is not a substitute for internal coverage unless
the user explicitly requested an incomplete analysis.

## Output

Print a concise project-impact summary with:

- **Acceptance criteria** — first, and only when the Jira acceptance workflow
  applies; use that workflow's statuses and omit its internal ledger.
- **Summary** — at most three sentences: what capability or behavior changed,
  its primary effect, and any material compatibility or rollout consequence. It
  must be useful without reading the rest of the report.
- **Flows** — per step 4: for each distinct implemented flow, a `####` heading
  with its lettered name ("Flow A — …"), one sentence on trigger and outcome,
  then its Mermaid `flowchart`. Place it right after **Summary**, so the names
  are defined before **Main changes** uses them. Omit when the change implements
  no flow.
- **Main changes** — at most five topics, each at most three sentences,
  explaining both the change and its concrete effect. Use before-and-after
  wording only where it helps explain the effect. A topic carried by a flow
  names it ("see Flow A") and adds only what the diagram cannot show — a
  sentence at most, not a retelling.
- **Open questions** — only when unresolved questions exist.
- **Limitations** — only when incomplete analysis materially weakens a reported
  conclusion.

Do not emit standalone before-and-after, semantic-unit, cross-unit,
reading-route, scope, coverage, evidence, or file-inventory sections.

**Length.** Aim for under 400 words of prose, excluding diagrams and the
acceptance section. Exceed it only when dropping something would hide a
behavior, constraint, or consequence a reviewer must know — and prefer adding a
flow diagram over adding paragraphs. If the change is genuinely large, report
fewer topics at the same brevity rather than more topics in more words.

## Boundaries

- Do not report code-behavior, test-gap, maintainability, or security findings.
- Do not repeat findings from other review skills as review targets.
- Do not modify files, Git state, or external systems.
- Do not auto-approve or imply that complete analysis means the change is safe.
- Be explicit when evidence is unavailable or intent remains unresolved.
