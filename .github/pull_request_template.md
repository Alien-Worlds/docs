## What this changes

<!-- One or two sentences. What is different for a reader after this merges? -->

## Why

<!-- What was wrong, missing, or misleading before. -->

## Checklist

- [ ] `pnpm build` passes (this also validates every internal link)
- [ ] `pnpm abi:check` passes — contract claims match the deployed ABIs
- [ ] `pnpm test` passes — includes parsing every Mermaid diagram
- [ ] If this documents a contract action or table, it uses the
      `<BlockExplorer*Links>` components rather than a hardcoded explorer URL,
      so the claim is visible to the drift check
- [ ] No hand-written field lists that `pnpm abi:partials` can generate
- [ ] No edits under `docs/03-API tools/` — that tree is generated from the
      upstream repositories and changes there are overwritten
