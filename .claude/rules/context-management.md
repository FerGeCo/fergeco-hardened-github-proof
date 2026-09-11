# Context management

**State** (`.fergeco/state/change.json`, `security.json`, `tests.json`)
answers "where are we, and what changed." **Context** is whatever
information an agent actually loads to do its specific task. Don't confuse
the two: state is a small set of facts every agent can cheaply read in
full; context is assembled per agent, per task, and should stay as small
as correctness allows. See this plugin's `docs/
CONTEXT-AND-STATE-ARCHITECTURE.md` for the full design.

## Context pull, not context push

**An agent must have a reason before loading additional context.** Default
to the minimum context level below; go further only when you can name the
specific thing you're missing and why you need it — not "to be thorough."

- **L0 — metadata.** Project type, branch, commit, change ID, stage, risk
  level. `"${CLAUDE_PLUGIN_ROOT}/scripts/fergeco-context.sh" --level L0`.
- **L1 — change/diff.** L0 plus `git diff --stat`, changed files, and
  deterministic scanner summaries (tool/status/finding_count/artifact
  path — never raw scanner output). This is the default for most changes:
  `"${CLAUDE_PLUGIN_ROOT}/scripts/fergeco-context.sh" --level L1`.
- **L2 — relevant code.** The specific function, call-site, test, or config
  file a finding or a task actually names. Pull it with your normal
  Read/Grep tools, then log why:
  `"${CLAUDE_PLUGIN_ROOT}/scripts/fergeco-context.sh" --log --level L2 --agent <role> --reason "..." --files <path,path>`.
- **L3 — architecture.** Cross-module dataflow, broader dependency
  relationships — only when L2 wasn't enough to judge correctness or
  exploitability.
- **L4 — full repository.** Exceptional. Reading the entire codebase "to be
  safe" is not a default posture for any agent, including Security.

## Evidence stays out of the LLM context

Scanner/test output goes to `.fergeco/artifacts/{scans,test-results,
reports}/`, referenced from state by path plus a short summary (tool,
status, finding count) — not pasted into a prompt or report in full. Open
the artifact file directly only when you have a specific reason to inspect
raw output.

## Adaptive workflow decides more than risk

`"${CLAUDE_PLUGIN_ROOT}/scripts/fergeco-route.sh"` runs before this
context is assembled and decides, deterministically, whether Security
and/or Tester are even invoked for a given change — not just how much
context they get if they are. A LOW-risk change stays at `L1` and often
involves only Developer; a HIGH/CRITICAL change starts at `L2`. This is
"risk determines reasoning depth; evidence determines context" — a
HIGH-risk change still doesn't mean reading the whole repository, and a
LOW-risk label never skips a check that turns out to be required (an
unresolved prior finding forces Security regardless of how the new diff
looks). See this plugin's `docs/CONTEXT-AND-STATE-ARCHITECTURE.md`,
"Adaptive Risk-Based Workflow," for the full decision logic and its
anti-bypass rules.

## Context contracts (defaults — not a ceiling)

| Agent | Default context |
|---|---|
| Orchestrator | Gate state (`--get`), `git status`, the result/report just received. Never the full source tree, never a full agent-history dump handed to the next agent. |
| Developer | The request, `.fergeco/project-profile.json`, relevant `.claude/rules/*.md`, changed/relevant files, current diff, relevant tests. For remediation: the specific finding (id/severity/file/required action), not the full security report. |
| Security | L0/L1 context bundle, deterministic scanner results, risk classification, the security baseline (`.claude/rules/security-gate.md`). Pulls specific flows/functions only with a stated reason. |
| Tester | The change, expected behavior, changed files, relevant tests, and the security *status* (PASS/FAIL) — not Security's full findings history. |

## Invalidation

Context (and the PASS/FAIL verdicts built on it) has a validity window tied
to `current_commit` and a diff hash, not to how recently an agent last
looked. If code, config, or a dependency changes after a review, treat any
context or verdict gathered before that change as stale until re-verified
— `scripts/fergeco-status.sh` already enforces this for the security/test
gates themselves; apply the same skepticism to any context snapshot you're
holding onto in conversation.
