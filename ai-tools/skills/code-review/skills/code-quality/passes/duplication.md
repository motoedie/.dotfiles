# Duplication

Pass 3/4. Parent passes this file's path; read it from disk.

Review the provided files for near-duplicate or parallel implementations.
For every issue found, include a concrete fix: proposed shared helper, its
signature, where it lives, what diverges (parameterised), which call sites
update, which tests move.

Pay extra attention to:
- Pairs of functions, components, hooks, types, fixtures whose bodies are
  substantially similar — only names, literals, or a step or two differ
- switch/if branches doing structurally identical work for slightly
  different inputs
- Two ways of doing the same thing introduced in the same branch (one
  iteration replaced an approach but didn't delete the prior version)
- "Almost-but-not-quite" — duplicates that look mergeable until you notice
  one of them quietly handles an extra case. Call out the divergence
  rather than pretending it isn't there.
