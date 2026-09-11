## FerGeCo DevSecOps

This project is set up with the FerGeCo framework.

- `.claude/rules/stack.md` — detected stack, real test/lint/build commands,
  scanner status, and this repo's Layer-3 (branch protection) status.
- `.claude/rules/security-gate.md` — the gate every change goes through.
- `/fergeco:status` — where the current change stands.
- `/fergeco:secure-check` — which operating mode this project is in, and
  whether the Hardened guarantee is actually in force.

Local FerGeCo state (`.fergeco/state/*.json`) is workflow state, never
release authority. See this plugin's SECURITY.md.
