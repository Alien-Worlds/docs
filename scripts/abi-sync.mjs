#!/usr/bin/env node
/**
 * Keep the smart-contract docs honest against the deployed ABIs.
 *
 * The docs name every contract, action and table they describe through the
 * <BlockExplorer*Links> components, so the corpus is self-describing: this
 * script needs no registry of what to check.
 *
 * Modes:
 *   --fetch    refresh the cached ABIs under abis/ from a WAX endpoint
 *   --check    compare the docs against the cache; exit 1 on stale claims
 *   --report   write a human-readable drift report (default: stdout)
 *   --baseline rewrite abis/drift-baseline.json from the current stale set
 *   --partials regenerate the MDX field-table partials under docs/_abi/
 *
 * Stale claims fail: a documented action that no longer exists is a broken
 * promise to the reader, and its explorer link 404s. Undocumented actions
 * only warn — new contract surface is a backlog item, not a build break.
 *
 * The corpus already carries substantial pre-existing drift (see the baseline
 * file). Those entries are recorded rather than fixed silently, so --check
 * gates *new* drift from day one while the backlog is worked down. Removing a
 * line from the baseline is how a fix gets locked in.
 */
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const ABI_DIR = path.join(ROOT, 'abis');
const BASELINE_FILE = path.join(ABI_DIR, 'drift-baseline.json');
// Underscore-prefixed, so Docusaurus does not route these as pages and the
// claim collector does not read them back in as doc claims.
const PARTIALS_DIR = path.join(DOCS_DIR, '_abi');
const GRAPH_FILE = path.join(ROOT, 'contract-graph.json');

// The Alien Worlds node is the only endpoint used by default. WAX_API_URL can
// override it (comma-separated, tried in order) for local work against a
// different node.
const ENDPOINTS = (process.env.WAX_API_URL || 'https://waxnode.alienworlds.io')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Contracts the docs reference but that are not ours to document exhaustively.
const EXTERNAL_CONTRACTS = new Set([
  'eosio',
  'eosio.msig',
  'eosio.token',
  'atomicassets',
]);

/** Recursively collect authored doc files, skipping generated/hidden trees. */
async function docFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    // Docusaurus excludes _-prefixed paths; so do we.
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // docs/03-API tools/ is plugin output, not authored contract docs.
      if (entry.name === '03-API tools') continue;
      out.push(...(await docFiles(full)));
    } else if (/\.mdx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const attr = (source, name) => {
  // Tolerates `contract ="federation"` — the corpus contains that spacing.
  const m = source.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`));
  return m ? m[1] : null;
};

/** Parse every <BlockExplorer*Links> usage into a flat list of claims. */
async function collectClaims() {
  const claims = [];
  for (const file of await docFiles(DOCS_DIR)) {
    const text = await readFile(file, 'utf8');
    const rel = path.relative(ROOT, file);
    const tagRe = /<BlockExplorer(Contract|Action|Table)Links\b([^>]*?)\/?>/g;
    let m;
    while ((m = tagRe.exec(text))) {
      const [kind, attrs] = [m[1], m[2]];
      const line = text.slice(0, m.index).split('\n').length;
      const contract = attr(attrs, 'contract');
      if (!contract) {
        claims.push({ kind: 'malformed', file: rel, line, raw: m[0] });
        continue;
      }
      if (kind === 'Contract')
        claims.push({ kind: 'contract', contract, file: rel, line });
      if (kind === 'Action')
        claims.push({
          kind: 'action',
          contract,
          name: attr(attrs, 'action'),
          file: rel,
          line,
        });
      if (kind === 'Table')
        claims.push({
          kind: 'table',
          contract,
          name: attr(attrs, 'table'),
          file: rel,
          line,
        });
    }
  }
  return claims;
}

async function fetchAbi(account) {
  let lastError;
  for (const base of ENDPOINTS) {
    try {
      const res = await fetch(`${base}/v1/chain/get_abi`, {
        method: 'POST',
        body: JSON.stringify({ account_name: account }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (!body.abi) throw new Error('account exists but has no ABI');
      return body.abi;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`could not fetch ABI for ${account}: ${lastError?.message}`);
}

async function doFetch(contracts) {
  await mkdir(ABI_DIR, { recursive: true });
  const failures = [];
  for (const account of contracts) {
    try {
      const abi = await fetchAbi(account);
      // Sorted and pretty-printed so a diff shows the real contract change,
      // not endpoint-dependent key ordering.
      const actions = [...abi.actions].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const tables = [...abi.tables].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const structs = [...abi.structs].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const snapshot = {
        account,
        version: abi.version,
        actions: actions.map((a) => ({ name: a.name, type: a.type })),
        tables: tables.map((t) => ({
          name: t.name,
          type: t.type,
          key_names: t.key_names,
        })),
        structs: structs.map((s) => ({
          name: s.name,
          base: s.base,
          fields: s.fields,
        })),
      };
      await writeFile(
        path.join(ABI_DIR, `${account}.json`),
        JSON.stringify(snapshot, null, 2) + '\n'
      );
      console.log(`fetched ${account}`);
    } catch (err) {
      failures.push(`${account}: ${err.message}`);
      console.error(`FAILED ${account}: ${err.message}`);
    }
  }
  // Drop caches for contracts the docs no longer make action/table claims
  // about. --fetch would never refresh them again, so they would sit here
  // going quietly stale and look authoritative.
  const keep = new Set(contracts.map((c) => `${c}.json`));
  for (const file of await readdir(ABI_DIR)) {
    if (!file.endsWith('.json') || file === 'drift-baseline.json') continue;
    if (keep.has(file)) continue;
    await unlink(path.join(ABI_DIR, file));
    console.log(`pruned ${file} (no action/table claims reference it)`);
  }

  if (failures.length) {
    console.error(`\n${failures.length} ABI fetch(es) failed.`);
    process.exit(1);
  }

  // Regenerate immediately: a refreshed ABI with stale partials would fail the
  // very next check, and the scheduled drift PR should carry both together.
  await writePartials();
}

/**
 * Contracts we can meaningfully verify: those the docs make action or table
 * claims about. Accounts referenced only by <BlockExplorerContractLinks> are
 * often plain accounts with no contract deployed — every `*.dac` planet
 * account is one — so a missing ABI there is expected, not drift.
 */
/**
 * Accounts the contract source says exist, from contract-graph.json. Fetching
 * these as well as the doc-claimed ones is what makes the check three-way:
 * source, chain, and docs. It also surfaces contracts that have source and a
 * deployed account but no documentation at all.
 */
async function graphAccounts() {
  if (!existsSync(GRAPH_FILE)) return [];
  const graph = JSON.parse(await readFile(GRAPH_FILE, 'utf8'));
  return [
    ...new Set(
      graph.repos
        .flatMap((r) => r.contracts)
        .filter((c) => c.documented && c.account)
        .map((c) => c.account)
    ),
  ].sort();
}

function verifiableContracts(claims) {
  return [
    ...new Set(
      claims
        .filter((c) => c.kind === 'action' || c.kind === 'table')
        .map((c) => c.contract)
    ),
  ].sort();
}

/**
 * Flatten a struct's fields, following the `base` chain. Antelope structs
 * inherit, and a table's columns are the base's fields followed by its own.
 */
export function resolveFields(abi, structName, seen = new Set()) {
  if (!structName || seen.has(structName)) return [];
  seen.add(structName);
  const struct = abi.structs.find((s) => s.name === structName);
  if (!struct) return [];
  return [...resolveFields(abi, struct.base, seen), ...struct.fields];
}

const partialPath = (contract, table) =>
  path.join(PARTIALS_DIR, contract, `${table}.mdx`);

/** Render one table's fields as a Markdown table. Types are escaped: ABI
 *  types contain `[]` and `?`, and a bare `|` in a type would split the row. */
export function renderPartial(contract, table, fields) {
  const rows = fields.map(
    (f) => `| \`${f.name}\` | \`${f.type.replace(/\|/g, '\\|')}\` |`
  );
  return [
    `{/* Generated by scripts/abi-sync.mjs from the deployed ABI of ${contract}.`,
    `    Do not edit: run \`pnpm abi:partials\` instead. */}`,
    '',
    '| Field | Type |',
    '| --- | --- |',
    ...(rows.length ? rows : ['| _no fields_ | |']),
    '',
  ].join('\n');
}

/** Every (contract, table) pair the cached ABIs can describe. */
async function partialTargets() {
  const targets = [];
  for (const file of await readdir(ABI_DIR)) {
    if (!file.endsWith('.json') || file === 'drift-baseline.json') continue;
    const abi = JSON.parse(await readFile(path.join(ABI_DIR, file), 'utf8'));
    for (const table of abi.tables) {
      targets.push({
        contract: abi.account,
        table: table.name,
        content: renderPartial(
          abi.account,
          table.name,
          resolveFields(abi, table.type)
        ),
      });
    }
  }
  return targets;
}

async function writePartials() {
  const targets = await partialTargets();
  const expected = new Set(
    targets.map((t) => partialPath(t.contract, t.table))
  );
  for (const t of targets) {
    const file = partialPath(t.contract, t.table);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, t.content);
  }
  // Drop partials for tables that no longer exist, so a doc importing one
  // fails the build loudly instead of rendering a stale field list.
  if (existsSync(PARTIALS_DIR)) {
    for (const dir of await readdir(PARTIALS_DIR)) {
      const dirPath = path.join(PARTIALS_DIR, dir);
      for (const file of await readdir(dirPath)) {
        const full = path.join(dirPath, file);
        if (!expected.has(full)) {
          await unlink(full);
          console.log(`pruned ${path.relative(ROOT, full)}`);
        }
      }
    }
  }
  console.log(`Wrote ${targets.length} field-table partial(s).`);
}

/** Partials are committed, so CI must catch a stale one without network. */
async function stalePartials() {
  const stale = [];
  for (const t of await partialTargets()) {
    const file = partialPath(t.contract, t.table);
    const current = existsSync(file) ? await readFile(file, 'utf8') : null;
    if (current !== t.content) stale.push(path.relative(ROOT, file));
  }
  return stale;
}

/** Identity of a stale claim that survives file moves and line-number churn. */
const claimKey = (c) => `${c.contract}::${c.kind}::${c.name}`;

async function loadBaseline() {
  if (!existsSync(BASELINE_FILE)) return { accepted: [] };
  return JSON.parse(await readFile(BASELINE_FILE, 'utf8'));
}

async function loadCache(account) {
  const file = path.join(ABI_DIR, `${account}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(await readFile(file, 'utf8'));
}

async function analyse(claims) {
  const contracts = verifiableContracts(claims);
  const stale = [];
  const undocumented = [];
  const uncached = [];
  const malformed = claims.filter((c) => c.kind === 'malformed');

  for (const account of contracts) {
    const abi = await loadCache(account);
    if (!abi) {
      uncached.push(account);
      continue;
    }
    const actions = new Set(abi.actions.map((a) => a.name));
    const tables = new Set(abi.tables.map((t) => t.name));

    for (const claim of claims) {
      if (claim.contract !== account) continue;
      if (claim.kind === 'action' && claim.name && !actions.has(claim.name))
        stale.push({
          ...claim,
          reason: `no action "${claim.name}" in the deployed ABI`,
        });
      if (claim.kind === 'table' && claim.name && !tables.has(claim.name))
        stale.push({
          ...claim,
          reason: `no table "${claim.name}" in the deployed ABI`,
        });
    }

    if (EXTERNAL_CONTRACTS.has(account)) continue;
    const documentedActions = new Set(
      claims
        .filter((c) => c.contract === account && c.kind === 'action')
        .map((c) => c.name)
    );
    const documentedTables = new Set(
      claims
        .filter((c) => c.contract === account && c.kind === 'table')
        .map((c) => c.name)
    );
    for (const name of actions)
      if (!documentedActions.has(name))
        undocumented.push({ account, kind: 'action', name });
    for (const name of tables)
      if (!documentedTables.has(name))
        undocumented.push({ account, kind: 'table', name });
  }

  const baseline = new Set(
    (await loadBaseline()).accepted.map((a) => a.key ?? a)
  );
  const newStale = stale.filter((c) => !baseline.has(claimKey(c)));
  const knownStale = stale.filter((c) => baseline.has(claimKey(c)));
  // A baseline entry with nothing left to match means the drift was fixed —
  // prune it, or the baseline slowly stops meaning anything.
  const seen = new Set(stale.map(claimKey));
  const obsoleteBaseline = [...baseline].filter((k) => !seen.has(k));

  const undocumentedContracts = (await graphAccounts()).filter(
    (account) => !claims.some((c) => c.contract === account)
  );

  return {
    contracts,
    undocumentedContracts,
    stale,
    newStale,
    knownStale,
    obsoleteBaseline,
    undocumented,
    uncached,
    malformed,
  };
}

function renderReport(r) {
  const lines = [];
  lines.push('# Contract documentation drift report', '');
  lines.push(
    `${r.contracts.length} contracts have documented actions or tables and are checked ` +
      `against their deployed ABI.`,
    ''
  );

  lines.push('## New stale doc claims (build-breaking)', '');
  if (!r.newStale.length)
    lines.push('None. No drift beyond what the baseline already records.', '');
  else {
    lines.push(
      'Documented but absent from the deployed ABI, and not baselined:',
      ''
    );
    for (const s of r.newStale)
      lines.push(`- \`${s.file}:${s.line}\` — ${s.reason}`);
    lines.push('');
  }

  lines.push('## Known stale claims (baselined backlog)', '');
  if (!r.knownStale.length) lines.push('None.', '');
  else {
    lines.push(
      `${r.knownStale.length} pre-existing stale claim(s). Fix one, then drop its ` +
        'entry from `abis/drift-baseline.json`.',
      ''
    );
    for (const s of r.knownStale)
      lines.push(`- \`${s.file}:${s.line}\` — ${s.reason}`);
    lines.push('');
  }

  if (r.obsoleteBaseline.length) {
    lines.push('## Baseline entries that no longer apply', '');
    lines.push(
      'These were fixed. Remove them from `abis/drift-baseline.json`:',
      ''
    );
    for (const k of r.obsoleteBaseline) lines.push(`- \`${k}\``);
    lines.push('');
  }

  lines.push('## Undocumented contract surface (informational)', '');
  if (!r.undocumented.length) lines.push('None.', '');
  else {
    const byAccount = {};
    for (const u of r.undocumented) (byAccount[u.account] ||= []).push(u);
    for (const [account, items] of Object.entries(byAccount).sort()) {
      lines.push(`### \`${account}\``, '');
      for (const kind of ['action', 'table']) {
        const names = items.filter((i) => i.kind === kind).map((i) => i.name);
        if (names.length)
          lines.push(`- ${kind}s: ${names.map((n) => `\`${n}\``).join(', ')}`);
      }
      lines.push('');
    }
  }

  if (r.undocumentedContracts.length) {
    lines.push('## Deployed contracts with no documentation', '');
    lines.push(
      'Named by the contract source, but no doc page references them:',
      ''
    );
    for (const a of r.undocumentedContracts) lines.push(`- \`${a}\``);
    lines.push('');
  }

  if (r.uncached.length) {
    lines.push('## Contracts with no cached ABI', '');
    lines.push('Run `pnpm abi:fetch` to add these:', '');
    for (const a of r.uncached) lines.push(`- \`${a}\``);
    lines.push('');
  }

  if (r.malformed.length) {
    lines.push('## Malformed component usage', '');
    for (const m of r.malformed)
      lines.push(`- \`${m.file}:${m.line}\` — ${m.raw}`);
    lines.push('');
  }

  return lines.join('\n');
}

// Only run the CLI when invoked directly; the module is also imported by
// scripts/abi-sync.test.mjs, and top-level side effects would run there too.
const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) await main();

async function main() {
  const args = process.argv.slice(2);
  const claims = await collectClaims();

  if (args.includes('--partials')) {
    await writePartials();
  } else if (args.includes('--baseline')) {
    const result = await analyse(claims);
    const accepted = result.stale
      .map((c) => ({ key: claimKey(c), note: c.reason }))
      .sort((a, b) => a.key.localeCompare(b.key));
    await writeFile(
      BASELINE_FILE,
      JSON.stringify(
        {
          $comment:
            'Pre-existing contract-doc drift, accepted so CI can gate new drift. ' +
            'Fix a doc, then delete its entry. Do not add entries by hand to silence ' +
            'a failing check — regenerate only when intentionally accepting a backlog.',
          accepted,
        },
        null,
        2
      ) + '\n'
    );
    console.log(`Baselined ${accepted.length} stale claim(s).`);
  } else if (args.includes('--fetch')) {
    const fromDocs = verifiableContracts(claims);
    const fromSource = await graphAccounts();
    const contracts = [...new Set([...fromDocs, ...fromSource])].sort();
    console.log(
      `Fetching ABIs for ${contracts.length} contracts ` +
        `(${fromDocs.length} claimed by docs, ${fromSource.length} named by source)...`
    );
    await doFetch(contracts);
  } else {
    const result = await analyse(claims);
    const report = renderReport(result);

    const outIdx = args.indexOf('--out');
    if (outIdx !== -1 && args[outIdx + 1])
      await writeFile(args[outIdx + 1], report);
    else console.log(report);

    if (args.includes('--check')) {
      if (result.malformed.length) {
        console.error(
          `\n${result.malformed.length} malformed <BlockExplorer*Links> usage(s).`
        );
        process.exit(1);
      }
      if (result.uncached.length) {
        console.error(
          `\n${result.uncached.length} contract(s) have no cached ABI. Run: pnpm abi:fetch`
        );
        process.exit(1);
      }
      const stalePartialFiles = await stalePartials();
      if (stalePartialFiles.length) {
        console.error(
          `\n${stalePartialFiles.length} field-table partial(s) do not match the ` +
            'cached ABIs. Run: pnpm abi:partials'
        );
        for (const f of stalePartialFiles) console.error(`  ${f}`);
        process.exit(1);
      }
      if (result.newStale.length) {
        console.error(
          `\n${result.newStale.length} new stale doc claim(s). See the report above.`
        );
        process.exit(1);
      }
      console.error(
        `\nOK — ${result.contracts.length} contracts checked, no new drift. ` +
          `${result.knownStale.length} baselined stale claim(s), ` +
          `${result.undocumentedContracts.length} undocumented contract(s), ` +
          `${result.undocumented.length} undocumented action(s)/table(s).`
      );
    }
  }
}
