# Website

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ corepack enable
$ pnpm install
```

### Local Development

```
$ pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ pnpm build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Deployed automatically by the **Cloudflare Pages GitHub App**. Cloudflare builds
this repo itself on push — pushes to `main` publish production, and every pull
request gets its own preview URL. There is no deploy workflow in this repo, and
nothing needs to be run by hand.

Build settings live in the Cloudflare Pages dashboard, not here. They must stay
in sync with this repo: build command `pnpm build`, output directory `build`,
and a pnpm 9 build environment (`pnpm-lock.yaml` is lockfile version 9.0, which
pnpm 8 cannot read).
