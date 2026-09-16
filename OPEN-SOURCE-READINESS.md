# Open source readiness

Tracking what must happen before `Alien-Worlds/docs` is switched from private to public.

Kept at the repository root, not under `docs/`, so it is not published to the site.

**Everything in the repository becomes public, not just what the site renders.** That includes
the full git history, and the `_`-prefixed directories that Docusaurus excludes from the build
but which are still committed files.

## Blockers

All cleared. The remaining item is the security contact.

### 1. ~~Internal infrastructure detail in unpublished docs~~ — done

`docs/_03- API-services/` is parked content: excluded from the site by its `_` prefix, but
committed, and so public once the repository is.

All of it has been cleaned:

| Finding                                              | Action                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| Bare origin server IP for the BSC missions test API  | Removed. It documented a way around the Cloudflare that fronts that host. |
| ClickUp board links, several marked "Private"        | Removed across all files; descriptive text kept.                          |
| New Relic dashboard links                            | Replaced with a note that monitoring exists but the link is internal.     |
| Google Sheets links, including one of server details | Replaced with a note that access is on request.                           |

`grep` for `clickup`, `onenr.io` and `docs.google.com` across `docs/` now returns nothing.

Note the first sweep missed several because the audit listing was truncated; the fix was a
generic pass over every internal domain rather than line-by-line edits. If more internal hosts
are added later, repeat that sweep rather than trusting a spot check.

### 2. ~~History rewrite~~ — not needed

Decision: rewrite history only if private keys or secrets were exposed. **They were not.**

The scans found no credentials in the working tree or in any of the 392 paths ever committed.
The one place that discusses key material — the BSC mission deployer account in
`_BSC Missions/Mission Creator.md` — states only that a private key is required and that "this is
kept as a secret"; no key is present. The BSC contract addresses alongside it are public
on-chain data.

The removed IP and internal links therefore remain readable in history, which is accepted.

### 3. ~~Licence~~ — done

MIT, matching the contract repositories. `LICENSE` added with the same copyright holder as
`alienworlds-contracts-open-source-release` (Dacoco GmbH), and `package.json` now declares
`"license": "MIT"`. **If the documentation should sit under a different holder, that is a
one-line change.**

## Recommended before flipping

- ~~**`CONTRIBUTING.md`**~~ — added.
- ~~**`SECURITY.md`**~~ — added, but it still carries a visible TODO for the disclosure contact.
  That must be filled in before going public.
- ~~**Issue and PR templates**~~ — added. The PR template checklist names the two traps
  (generated `docs/03-API tools/`, and using the `BlockExplorer*` components so claims stay
  visible to the drift check), and the issue chooser routes security reports away from public
  issues.

## Already verified clean

- **No credentials, keys or tokens** in the working tree or in any of the 392 paths ever
  committed. Scanned for EOS/WAX private keys (`5[HJK]…`, `PVT_K1_…`), AWS keys, GitHub tokens,
  OpenAI keys, Slack tokens, JWTs and PEM blocks. The only pattern matches were npm integrity
  hashes in `pnpm-lock.yaml`.
- **No `.env`, `.pem`, `.key`, keystore or backup files** ever committed.
- **Commit authors** are two named contributors plus Dependabot, all using addresses already
  public on GitHub.

## Lower priority

- `contract-accounts.json` records `autoteleport` (`bina.world`) and `schedulepay`
  (`arena.worlds`) with `"status": "internal"` and a note that they are internal operations.
  Their prose was removed from the site, but the account names and that annotation are in a
  committed file. Not secret — the accounts are visible on any block explorer — but it is worth
  a deliberate decision rather than discovering it after the fact.
- The Cloudflare Pages project URL and build configuration are described in `CLAUDE.md`. Nothing
  sensitive, but worth a read-through before it is public.

## Cost side effect

Making the repository public also makes **GitHub Actions minutes free** (private repositories
draw on the org's Free-plan allowance of 2,000 minutes/month; public repositories are unlimited).
That removes the runner-cost objection to scheduled workflows and to agentic workflows.
