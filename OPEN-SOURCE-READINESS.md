# Open source readiness

Tracking what must happen before `Alien-Worlds/docs` is switched from private to public.

Kept at the repository root, not under `docs/`, so it is not published to the site.

**Everything in the repository becomes public, not just what the site renders.** That includes
the full git history, and the `_`-prefixed directories that Docusaurus excludes from the build
but which are still committed files.

## Blockers

### 1. Internal infrastructure detail in unpublished docs

`docs/_03- API-services/` is parked content — excluded from the site by its `_` prefix, but
present in the repository and readable by anyone once it is public.

| Finding                                              | Location                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| Bare server IP address `157.90.129.75`               | `_BSC Missions/Mission API.md:54`                                |
| Private ClickUp board, explicitly labelled "Private" | `_BSC Missions/Mission Creator.md:55`                            |
| ClickUp share-doc links (API specifications)         | `REST API - Legacy.md:47`, `_BSC Missions/Mission API.md:24`     |
| New Relic dashboard links                            | `REST API - Legacy.md:52`, `_BSC Missions/Mission Creator.md:92` |
| Google Sheets link                                   | `_BSC Missions/Mission Creator.md:82`                            |

The IP is the sharpest of these: publishing a host address hands out attack surface for free.
The ClickUp and New Relic links are less severe but leak internal tooling and may themselves be
readable without authentication.

**Decision needed:** delete the parked directories, or redact these specific lines. Deleting
them from the working tree alone is **not sufficient** — they remain in git history. See
"History rewrite" below.

### 2. History rewrite, if the above must not be public at all

Removing a line in a new commit leaves the original readable in history. If the IP and the
internal links must never be public, the history has to be rewritten before the repo is flipped
(`git filter-repo`), which changes every commit SHA and requires a force push plus coordination
with anyone holding a clone.

If the team's judgement is that these are low-risk (a decommissioned host, expired share links),
then redacting going forward is enough and no rewrite is needed. **That is a judgement call for
someone who knows whether that host is still live.**

### 3. Licence

There is **no `LICENSE` file**. A public repository without one is "all rights reserved" by
default, which prevents the community contribution this is being opened up for. The contract
repositories this documents are MIT.

**Decision needed:** which licence. MIT matches the contracts.

## Recommended before flipping

- **`SECURITY.md`** — a disclosure route. Especially relevant here: this repository documents
  smart contracts holding real value, so it will attract security researchers. They need
  somewhere to report that is not a public issue.
- **`CONTRIBUTING.md`** — how to run the site, the fact that `docs/03-API tools/` is generated
  and edits belong upstream, and that `pnpm abi:check` gates contract claims.
- **Issue and PR templates** — cheap, and they set expectations for drive-by contributors.

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
