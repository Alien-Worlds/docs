# Security policy

> **TODO before this repository is made public:** replace the contact below with a real
> disclosure route. A security policy that points nowhere is worse than none, because it
> convinces a reporter they have told someone.

## Reporting a vulnerability

**Please do not open a public issue.** This repository documents smart contracts that hold real
value, so a disclosure here can have immediate financial consequences.

Report privately via **[TODO: security contact — a monitored address, or enable GitHub Private
Vulnerability Reporting on this repository]**.

Please include what you found, how to reproduce it, and which contract or page it affects.

## Scope

This repository contains documentation, not deployed contract code. Issues fall into two kinds,
and they go to different places:

- **A problem with this documentation** — for example, a page describing an authority model
  incorrectly in a way that could lead someone to take an unsafe action. Report it here.
- **A vulnerability in a deployed contract** — report it to the relevant contract repository
  (`Alien-Worlds/alienworlds-contracts-open-source-release`,
  `Alien-Worlds/eosdac-contracts`), not here.

If you are unsure which applies, report it privately and say so; we would rather triage it than
have it posted publicly.

## What this repository asserts

Contract action and table names on the site are checked in CI against the ABIs of the deployed
contracts. If you find documentation that contradicts what a contract actually does, that is a
genuine bug worth reporting even if it is not exploitable — the whole point of the check is that
readers can trust these pages.
