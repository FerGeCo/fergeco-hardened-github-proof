# Security & test gates

This is not only a convention agents are trusted to follow — it's backed by
`scripts/fergeco-status.sh`, which every agent reads/writes through (direct
writes to `.fergeco/state/{change,security,tests}.json` are hook-blocked).
Run `"${CLAUDE_PLUGIN_ROOT}/scripts/fergeco-status.sh" --get` (or
`/fergeco:status`) to see the actual current state rather than inferring it
from conversation. See `.claude/rules/context-management.md` for what
context each agent should pull instead of reading everything by default.

This is the full pipeline for changes that need it:

```
REQUEST -> DEVELOPING -> SECURITY_SCANNING -> SECURITY_REVIEW
        -> SECURITY_PASSED -> TESTING -> TEST_PASSED
        -> READY_FOR_HUMAN_APPROVAL -> APPROVED -> RELEASED
```

**Not every change runs all of it.** `"${CLAUDE_PLUGIN_ROOT}/scripts/
fergeco-route.sh"` decides, deterministically, whether this specific
change needs Security (`security_agent_required`) and/or Tester
(`test_agent_required`) at all — see `.claude/rules/
context-management.md`'s adaptive-workflow note and this plugin's `docs/
CONTEXT-AND-STATE-ARCHITECTURE.md` for the full design. What never changes
regardless of routing: **when Security or Tester ARE required, the steps
below apply in full** — routing decides *whether* a step runs, never
*how rigorously*. And release always requires a fresh Security PASS +
Test PASS + human approval on the actual released commit, whether or not
individual commits along the way were routed lighter.

Within a change that Security/Tester ARE part of: never transition
`DEVELOPING -> TESTING` directly — Security must review first. Never
transition `TEST_FAILED -> TESTING` directly — a test failure always
routes back through Developer and Security again:

```
TEST_FAILED -> DEVELOPING -> SECURITY_SCANNING -> SECURITY_REVIEW
            -> SECURITY_PASSED -> TESTING
```

## Security verdict criteria

Security's verdict is one of four values — never derived directly from a
single tool's output, always Security's own synthesis of tool evidence
plus independent reasoning (see `agents/security.md` for the full
process): `PASS`, `PASS WITH WARNINGS` (no blocker, but a tracked LOW/MEDIUM
finding or a stated limitation remains), `FAIL` (a credible vulnerability),
or `ESCALATE` (cannot be assessed confidently enough automatically — a
human must look, and this does not consume a remediation cycle).

`SECURITY_STATUS = PASS` (with or without warnings) only when:
- the scanners listed in `.claude/rules/stack.md` were actually run against
  the changed files (or their unavailability was explicitly reported —
  never assumed clean)
- for any change touching source code: the baseline SAST scan
  (`scripts/fergeco-baseline-scan.sh`) ran and its finding was actually
  looked at — a `NEEDS_REVIEW` result is not automatically a false
  positive, and an `UNAVAILABLE` result (scanner not installed) is not
  automatically clean
- no secret was introduced (see `.claude/rules/secrets-handling.md`)
- the Security Agent's checklist was walked against the actual diff,
  independent of what any tool reported — including categories tools
  structurally can't see well (custom database wrappers, authorization
  logic, business-logic abuse, cross-file dataflow)
- no CRITICAL/HIGH finding remains open

**If evidence is insufficient to decide confidently, that's `ESCALATE`,
not a guessed `PASS` and not a `FAIL` invented to be safe.** Fabricated
confidence in either direction is worse than an honest "a human needs to
look at this."

## Remediation cap

Maximum 3 automatic Developer -> Security remediation cycles for the same
blocking finding. If it's still open after 3 cycles: stop and ask the user
for direction instead of cycling again.

## Testing

Testing may only start after `SECURITY_STATUS = PASS`. The Tester runs
exactly what `.claude/rules/stack.md` documents; it must say plainly when a
change has no real automated coverage rather than implying otherwise.

## A Security PASS is commit-scoped, not absolute

`security.json`'s `PASS` only covers the exact commit/diff Security
reviewed. The moment code changes again, `scripts/fergeco-status.sh` flips
it to `STALE` on its own (comparing `reviewed_commit` and a diff hash to
the current state) — nobody has to notice and re-flag it. A `PASS` also
never means "no security issue exists anywhere in this change" — it means
the configured scanners ran clean and the checklist was walked against
this diff. Say so plainly rather than treating PASS as a safety guarantee.
Release additionally stays `BLOCKED` while any `HIGH`/`CRITICAL` finding in
`security.json` is still `OPEN`, regardless of the PASS/FAIL flags.
