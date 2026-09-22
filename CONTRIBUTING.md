# Contributing

Thanks for helping improve the Alien Worlds documentation.

## Running the site

```bash
corepack enable
pnpm install
pnpm start        # dev server with live reload
```

Node and pnpm versions are pinned (`.nvmrc`, the `packageManager` field). Use them — the lockfile
is pnpm v9 and older pnpm cannot read it.

## Before opening a pull request

```bash
pnpm format:check   # prettier, on src/ and config files
pnpm test           # unit tests, including mermaid diagram parsing
pnpm typecheck
pnpm abi:check      # contract docs vs the deployed ABIs
pnpm build          # also fails on any broken internal link
```

CI runs exactly these.

## Two things that surprise new contributors

**`docs/03-API tools/` is generated.** It is pulled from the `Alien-Worlds/*` repositories by
`docusaurus-plugin-remote-content` and committed here. Edits belong in the upstream repository —
changes made here are overwritten by the next refresh.

**Contract documentation is checked against the chain.** Every `<BlockExplorerContractLinks>`,
`<BlockExplorerActionLinks>` and `<BlockExplorerTableLinks>` usage is a claim, and `pnpm abi:check`
compares those claims to ABI snapshots under `abis/`. If you document an action that is not
deployed, CI fails. That is deliberate: a documented action that does not exist is a broken
promise to the reader, and its explorer link 404s.

Table field lists are generated from the ABI into `docs/_abi/` and imported as partials. Run
`pnpm abi:partials` rather than editing them by hand.

## Writing style

- Prose explains _intent_ — why something works the way it does. The tooling handles names and
  types, so do not hand-transcribe field lists that can be generated.
- Link to a contract through the `BlockExplorer*` components rather than hardcoding an explorer
  URL, otherwise the claim is invisible to the drift check.
- Mermaid diagrams are welcome. They are parsed in CI, so a malformed one fails the build rather
  than reaching a reader as a red error box.

## Reporting a security issue

Please do not open a public issue. See [SECURITY.md](./SECURITY.md).
