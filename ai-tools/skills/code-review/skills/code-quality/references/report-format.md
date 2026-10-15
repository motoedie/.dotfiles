# Report format

One finding per issue; when several lenses catch it, emit one finding tagged
with all of them. Drop findings that cannot provide the required evidence, and
don't pad a lens that found nothing.

One finding per issue:

- **File(s)**: `path:line`, or `path:line-line` for ranges; multiple paths
  if the finding spans them
- **Lenses**: which lenses caught it, comma-separated (e.g.,
  `SRP, coupling`).
- **Impact**: one of the levels below, reported per the active mode. For every
  level except `nit`, name the maintenance task made harder and the code
  causing that burden. A shorter alternative, long function, extra helper, or
  different organization alone does not qualify.
  - `high`: affects existing callers' code or contracts, or a shared ownership
    boundary, and makes related changes risky or requires coordinated edits.
    Example: feature policy patched into a shared helper that several callers
    use.
  - `medium`: a concrete, material maintenance burden in the current code.
    Example: a change to one rule now needs the same edit in several places
    across files or layers.
  - `low`: a concrete but minor burden; name a current maintenance task and the
    unnecessary extra action or reasoning the code imposes. It is low
    because that cost is minor, not because the issue is confined to one
    function or file. Examples: a new comment states a wrong fact about the
    code; the change adds another copy of logic that already exists nearby.
  - `nit`: pure style, naming taste, typos, or comment wording with no
    maintenance task made harder.

  Standard mode reports `high`, `medium`, and `low` and drops `nit` at once;
  when unsure between `nit` and `low`, propose `low`. Richard Ejem mode also
  reports `nit`, citing the line it concerns. Both modes drop speculative
  future needs and problems that exist only if part of the reviewed change
  ships without the rest. Matching an existing pattern does
  not lower impact when the change adds another copy; reject such a finding
  only when evidence shows the copies must stay separate.
- **What's wrong**: one-sentence diagnosis
- **Evidence**: the observed caller, invariant, repository precedent, or
  concrete failure path that proves the issue; for `nit`, the cited line
  suffices. Cite the line with the issue.
- **Concrete fix**: how it removes the stated burden, specific enough to execute
  without re-investigating (helper signature, rename, file to extract to, or
  tests to move). For git/workflow issues, say what the *user* should do at
  commit time, not an agent shell command, unless the user asked for git
  operations.

## Final report

Subagents return findings in this format plus whatever their task requests; the
rest applies only to the final report. Order findings highest impact first.

**Markdown (default):** each finding under `### Finding N`, or `Nothing notable`
when there are none. Add nothing else except any model fallback and, for an
incomplete review, what made it incomplete (unreviewed groups, files, or
checks, a failed synthesis or verification, or undecided findings); an
incomplete review never outputs only `Nothing notable`.

**JSON (`output=json`):** exactly one JSON object, with no Markdown fence or
text before or after it:

```json
{
  "version": 1,
  "skill": "code-quality",
  "complete": true,
  "findings": [
    {
      "title": "Shared helper couples unrelated flows",
      "body": "- **File(s):** `path:line`\n- **Lenses:** coupling\n- **Impact:** high — concrete maintenance burden\n- **What's wrong:** one-sentence diagnosis\n- **Evidence:** observed caller, invariant, or precedent\n- **Concrete fix:** executable correction"
    }
  ]
}
```

`title` is a short, single plain-text line; `body` is the complete Markdown
finding with every field above. Set `complete` to `false` when any required
file, check, review group, verification, or synthesis step did not complete,
and keep the retained findings. An empty array means clean only when `complete`
is `true`. The object has no field for a model fallback or incompleteness
reason; omit them.
