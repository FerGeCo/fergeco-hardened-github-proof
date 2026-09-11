# fergeco-hardened-github-proof

A minimal, synthetic, non-production project used ONLY to prove one
narrow capability empirically:

> GitHub can act as an external enforcement boundary that blocks a Pull
> Request from merging into `main` when the FerGeCo GitHub security gate
> fails, and allows the merge when the gate passes.

This repository contains no real business logic, no secrets, and no
customer data. It exists purely as a target for a real
`fergeco-devsecops-framework` Hardened Mode bootstrap and a real GitHub
Actions run.

See the parent framework repository for the actual FerGeCo DevSecOps
Framework: https://github.com/FerGeCo/fergeco-devsecops-framework

## Capability proof note

This harmless addition demonstrates the FerGeCo GitHub gate PASSING for a
clean, secret-free change.
PR enforcement capability proof.
