# Correctness

Review the provided files for correctness bugs.

Pay extra attention to:
- Correctness — does the code actually do what the author intended? Inverted conditions, wrong operator, off-by-one, early returns that skip necessary cleanup, logic that doesn't match the function/variable name
- Edge cases — empty arrays, null/undefined inputs, zero values, boundary conditions, what happens when the happy path assumptions don't hold
- Error handling — does existing error handling lose context, swallow failures silently, or recover into an inconsistent state
- Retry safety — retries are bounded, use appropriate backoff, and cannot duplicate external effects because the operation has a demonstrated idempotency boundary
- Partial failure — multi-step external writes cannot leave half-applied state without compensation or an explicit resumable state
- Operational diagnosability — important paths that can fail, stall, or choose materially different behavior provide enough signal to determine which path ran
- Determinism — time, randomness, generated identifiers, locale, timezone, or environment are caller-controlled when repeatability matters
- Copy-paste errors — near-identical blocks where one copy was modified but the other wasn't, variable names from the source left unchanged in the pasted version
- Dead/unreachable code — conditions that are always true/false, early returns that make subsequent code unreachable, branches that can never trigger — often signals a logic bug, not just clutter
- Incomplete change — new code path added but caller never updated to use it, enum variant added but switch/map doesn't handle it, feature half-wired
