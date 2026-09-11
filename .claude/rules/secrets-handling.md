# Secrets handling

- No credential, API key, token, connection string, or private key may be
  committed anywhere in this repository outside a clearly-named
  example/placeholder file (`*.example.*`, `*.sample.*`).
- Never print, log, or echo the contents of an environment variable or
  config file known to hold a real credential.
- Before any commit, `gitleaks detect --source . --no-banner` must run
  clean (the pre-commit hook installed by `/fergeco:init` does this
  automatically if enabled) — check `git status`/`git diff --cached` too
  for anything that looks like a token, connection string, or tenant/
  account identifier outside an example file.
- If a real credential is ever accidentally committed, treat it as already
  compromised: it must be rotated at the source (the provider/service that
  issued it) in addition to being removed from the repository — removal
  alone is never sufficient, even in a private repository.
- Prefer environment variables or a secret manager over committed config
  files for real credentials; if a local credential file is used for
  convenience, it must be gitignored and paired with a tracked
  `*.example.*` file showing the expected shape with placeholder values.
