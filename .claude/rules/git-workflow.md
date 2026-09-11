# Git workflow

<!-- This file is durable POLICY. It deliberately records no repository
     state — not the current branch, not how many branches exist, not
     whether feature branches happen to be present right now. That kind of
     observation is true for an afternoon and then silently wrong, and it
     made /fergeco:init report a config difference on a file nobody had
     touched. Branch state is reported at runtime instead, by
     /fergeco:init and /fergeco:status. -->

**Primary branch:** `main`.

Temporary feature branches may be used for development, and are expected
to come and go.

Follow whatever branch protection, pull-request and merge policy is
actually active on this repository right now — `/fergeco:secure-check`
reports what that is, rather than this file asserting it. Never bypass a
protected-branch requirement.

Feature branches are **recommended, not enforced** unless this project's
CI is configured to require pull requests (in which case that requirement
already enforces it).

- For small, low-risk edits (docs, minor fixes with no security-sensitive
  surface), committing directly to the primary branch after the security/
  test gates pass is fine, where the repository's own policy allows it.
- For anything touching authentication, authorization, payment, secrets,
  or an external API/integration, prefer a feature branch so the diff
  Security and Test reviewed is exactly what gets merged.
- For anything inside this project's trusted computing base (see
  `SECURITY.md`), a pull request is the expected route regardless of size
  — that is where Code Owner review can apply at all.
- Never force-push or rewrite history on a shared/protected branch, and
  never bypass the gates in `.claude/rules/security-gate.md` regardless of
  branch.
- Before any command that could discard uncommitted work
  (`git checkout`/`restore`/`reset`/`clean`), check `git status` first.
