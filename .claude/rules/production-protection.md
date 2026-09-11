# Production protection

<!-- Filled in by /fergeco:init from the detected deployment surface,
     without asking anything. Three outcomes are possible and they are not
     the same: NO PRODUCTION SURFACE DETECTED (nothing here is a release
     action — a finding, requiring nothing of you), DETECTED (this
     repository names its own production environment), or AMBIGUOUS
     (release machinery exists but nothing says which environment is
     production — Hardened Mode reports this as pending until a human
     resolves it with `--production "..."`, and FerGeCo does not guess).
     /fergeco:secure-check re-derives this on every run, so adding a
     deployment configuration after init cannot inherit an earlier blank. -->

**What counts as production here:** NO PRODUCTION SURFACE DETECTED — this repository contains no deploy script, IaC, CD workflow, container build, or publish command. Nothing here is a release action, so there is no production target to define. This is a recorded finding, not an open question: no human input is required while it stays true. fergeco-secure-check re-derives this on every run, so adding a deployment configuration later raises it again rather than inheriting this blank.

**Deployment mechanism:** NOT DETECTED — no deployment mechanism found in this repository

Before any deploy-shaped action, run
`"${CLAUDE_PLUGIN_ROOT}/scripts/fergeco-status.sh" --check-release` — it
refuses (non-zero exit) unless security, tests, and an explicit human
approval are all recorded. `.claude/settings.json`'s `ask`/`deny` rules on
deploy-shaped Bash commands are useful defense in depth on top of that —
they catch accidents and make a dangerous command visible to whoever's
watching the session. **Neither of these is, or is meant to be, the final
authority that makes production safe.** That authority is:
git-provider-enforced branch protection with a required human reviewer
(Layer 3) for anything that ships via a merge, and a separately-
authenticated human operator or a trusted CI/CD identity for anything
that doesn't. Check this plugin's `SECURITY.md`, "Production trust
boundary," for why that distinction matters and what FerGeCo can and
cannot verify about it.

**Production credentials do not belong in this session.** No AI agent
working in this project — Developer, Security, Tester, or Orchestrator —
is expected or authorized to hold or use production cloud, Kubernetes,
container-registry, package-publication, or deployment-service
credentials directly. If this project's deployment happens through
CI/CD, those credentials belong to the CI/CD execution context, used only
after Layer 3's required review passes — never copied into a local
development or agent session for convenience. If a production action
must be performed manually, it's performed by a human operator
authenticating separately, outside this session, not by an agent acting
on the human's behalf with the human's credentials. Run
`"${CLAUDE_PLUGIN_ROOT}/scripts/fergeco-production-boundary.sh"` to see
this project's current, honestly-reported status against that model.

Rules:
- Don't run this project against real/live production endpoints,
  credentials, or data as part of "testing" a change unless the user
  explicitly asks for a live check. Prefer a sandbox/staging target, a
  dry-run flag, or fixture data.
- A deploy, a merge to the production branch, or any action listed above as
  the deployment mechanism is a release action — it needs the user's
  explicit approval for that specific change, not an inferred "looks fine,
  go ahead."
- Valid approval looks like "approve the release," "deploy this," "ship
  it." "Looks good," "continue," "tests pass" are not approval — ask
  explicitly if intent is ambiguous.
- Never disable TLS/certificate validation, weaken an auth flow, or copy
  real production credentials into a development/test environment to make
  development more convenient.
