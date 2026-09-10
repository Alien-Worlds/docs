#!/usr/bin/env node
/**
 * Extract the contract graph from the Antelope contract source repos.
 *
 * Produces contract-graph.json: which contract source maps to which deployed
 * WAX account, which actions and tables each declares, and how they call and
 * notify each other. Everything downstream (docs, diagrams, drift checks)
 * reads that file rather than re-parsing C++.
 *
 * Source repo locations are configurable so this is not tied to one machine:
 *   AW_CONTRACTS_DIR      repo A, the game layer
 *   EOSDAC_CONTRACTS_DIR  repo B, the DAO layer
 *
 * Deliberate non-goals: this does not try to resolve every inline-action
 * target. Targets that come from a local variable are recorded as unresolved
 * rather than guessed, because a wrong edge in an architecture diagram is
 * worse than a missing one.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = path.join(ROOT, 'contract-graph.json');

const REPOS = [
  {
    key: 'game',
    label: 'Game layer',
    dir:
      process.env.AW_CONTRACTS_DIR ||
      path.join(
        ROOT,
        '..',
        'aw_contract-opensource',
        'alienworlds-contracts-open-source-release'
      ),
  },
  {
    key: 'dao',
    label: 'DAO layer',
    dir:
      process.env.EOSDAC_CONTRACTS_DIR ||
      path.join(ROOT, '..', 'contract-dev', 'eosdac-contracts'),
  },
];

/**
 * Contracts that exist only to make the test suite compile or to stand in for
 * something external. Keys are directory names; the reason is carried through
 * to the output so the docs can state why something is absent.
 */
const NOT_DOCUMENTED = {
  'mock.teleport':
    'Mock; its own comments describe it as standing in for the real teleport',
  orngwax: 'Stub for the external orng.wax RNG oracle',
  testmarket: 'Test-only market harness',
  newperiodctl: 'Test hook: a single action that only asserts',
  safemath: 'Test harness for the shared safemath.hpp header',
  atomicassets: 'Third-party WAX NFT standard, vendored to compile tests',
  'atomicassets-contracts':
    'Third-party WAX NFT standard, vendored to compile tests',
  'eosio.token': 'Antelope system contract, vendored to compile tests',
  common: 'Shared headers; no deployable contract',
  'contract-shared-headers': 'Shared headers; no deployable contract',
  'eosdac-contracts':
    'Submodule of the DAO-layer repo; documented from that repo instead',
  'vesting-eth': 'Ethereum-side contract, not Antelope',
};

/** Constants in config.hpp that name atomicassets schemas or collections
 *  rather than contract accounts. The live docs currently blur these. */
const NON_CONTRACT_CONSTANTS = new Set([
  'TOOLS_SCHEMA',
  'LAND_SCHEMA',
  'AVATAR_SCHEMA',
  'WEAPONS_SCHEMA',
  'NFT_COLLECTION',
  'BUDGET_SCHEMA',
]);

/**
 * Strip comments before any pattern matching. Without this, commented-out code
 * pollutes the graph: mining.hpp carries a large commented block declaring an
 * `nftstate` table that does not exist in the deployed ABI.
 * String literals are preserved because account and table names live in them.
 */
export function stripComments(src) {
  let out = '';
  let i = 0;
  const N = src.length;
  while (i < N) {
    const c = src[i];
    const next = src[i + 1];
    if (c === '/' && next === '/') {
      while (i < N && src[i] !== '\n') i++;
    } else if (c === '/' && next === '*') {
      i += 2;
      while (i < N && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
    } else if (c === '"' || c === "'") {
      const quote = c;
      out += src[i++];
      while (i < N && src[i] !== quote) {
        if (src[i] === '\\') out += src[i++];
        if (i < N) out += src[i++];
      }
      out += src[i++] ?? '';
    } else {
      out += src[i++];
    }
  }
  return out;
}

/** Parse the account-name registry out of config.hpp. */
export function parseAccountConstants(src) {
  const accounts = {};
  const clean = stripComments(src);
  // static constexpr name FOO{"bar"};  /  static constexpr name FOO{"bar"_n};
  for (const m of clean.matchAll(
    /static\s+constexpr\s+(?:eosio::)?name\s+([A-Z0-9_]+)\s*\{\s*"([a-z0-9.]+)"(?:_n)?\s*\}/g
  )) {
    accounts[m[1]] = m[2];
  }
  // #define FOO_STR "bar"
  for (const m of clean.matchAll(
    /#define\s+([A-Z0-9_]+_STR)\s+"([a-z0-9.]+)"/g
  )) {
    accounts[m[1]] = m[2];
  }
  return accounts;
}

/**
 * Remove #ifdef IS_DEV / DEBUG blocks. Actions declared only inside them exist
 * for the test suite and are not in the deployed ABI, so reporting them as
 * contract surface would be wrong.
 */
export function stripDevBlocks(src) {
  const lines = src.split('\n');
  const out = [];
  const stack = [];
  for (const line of lines) {
    const open = line.match(/^\s*#\s*if(?:def)?\s+(IS_DEV|DEBUG)\b/);
    const openOther = /^\s*#\s*if/.test(line);
    if (open) {
      stack.push('dev');
      continue;
    }
    if (openOther && stack.length) {
      stack.push('other');
      continue;
    }
    if (/^\s*#\s*endif/.test(line) && stack.length) {
      stack.pop();
      continue;
    }
    // #else inside a dev block flips to the production branch.
    if (/^\s*#\s*else/.test(line) && stack[stack.length - 1] === 'dev') {
      stack[stack.length - 1] = 'dev-else';
      continue;
    }
    if (stack.includes('dev')) continue;
    out.push(line);
  }
  return out.join('\n');
}

/**
 * Contract directory -> deployed WAX account.
 *
 * Curated, not extracted: only some accounts appear in config.hpp, and the DAO
 * contracts are deliberately not hardcoded in source at all — each planet DAC
 * registers its own contract accounts in the index.worlds directory at runtime,
 * so these entries name the primary Alien Worlds deployment.
 *
 * Curating by hand is error-prone in a specific way: a config.hpp constant
 * often names a contract that this one *talks to*, not its own account.
 * PACK_CONTRACT{"pack.worlds"} is the pack token that `packopener` calls, and
 * pack.worlds on chain is a token contract (create/issue/retire), so mapping
 * packopener to it would have been wrong. `suspectMapping` below exists to
 * catch that automatically rather than relying on care.
 */
const ACCOUNT_BY_CONTRACT = {
  mining: 'm.federation',
  federation: 'federation',
  userpoints: 'uspts.worlds',
  landholders: 'awlndratings',
  pointsproxy: 'ptpxy.worlds',
  'tlm.token': 'alien.worlds',
  infl: 'inflt.worlds',
  planets: 'plnts.worlds',
  notify: 'notify.world',
  daccustodian: 'dao.worlds',
  dacdirectory: 'index.worlds',
  dacproposals: 'prop.worlds',
  dacescrow: 'escrw.worlds',
  eosdactokens: 'token.worlds',
  referendum: 'ref.worlds',
  stakevote: 'stkvt.worlds',
  msigworlds: 'msig.worlds',
};

/** Shared headers that declare a contract's class outside its own directory. */
async function sharedHeadersFor(repoDir, contractName) {
  const candidates = [
    path.join(repoDir, 'contract-shared-headers', `${contractName}_shared.hpp`),
    path.join(repoDir, 'contracts', 'common', `${contractName}_shared.hpp`),
  ];
  return candidates.filter((f) => existsSync(f));
}

async function collectSources(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectSources(full)));
    else if (/\.(cpp|hpp)$/.test(entry.name)) files.push(full);
  }
  return files;
}

/** Declared actions: the ACTION macro and the bare [[eosio::action]] attribute. */
function parseActions(clean) {
  const names = new Set();
  for (const m of clean.matchAll(/\bACTION\s+([a-z][a-z0-9_]*)\s*\(/g))
    names.add(m[1]);
  for (const m of clean.matchAll(
    /\[\[eosio::action(?:\("([a-z0-9_.]+)"\))?\]\]\s*(?:void\s+)?([a-z][a-z0-9_]*)?/g
  )) {
    const name = m[1] || m[2];
    if (name) names.add(name);
  }
  return [...names].sort();
}

/** Declared tables. multi_index/singleton names are the on-chain truth; the
 *  [[eosio::table]] attribute can differ from the index name. */
function parseTables(clean) {
  const names = new Set();
  for (const m of clean.matchAll(
    /\b(?:multi_index|singleton)\s*<\s*"([a-z0-9_.]+)"_n/g
  ))
    names.add(m[1]);
  return [...names].sort();
}

function parseNotifications(clean) {
  const edges = [];
  for (const m of clean.matchAll(
    /on_notify\(\s*"([^":]+)::([a-z0-9_.]+)"\s*\)/g
  )) {
    edges.push({ from: m[1], action: m[2] });
  }
  return edges;
}

/** Inline action sends: action(permission_level{…}, TARGET, "name"_n, …). */
function parseInlineSends(clean, accounts) {
  const resolved = [];
  const unresolved = [];
  for (const m of clean.matchAll(
    /action\s*\(\s*permission_level\s*\{[^}]*\}\s*,\s*([^,]+?)\s*,\s*"([a-z0-9_.]+)"_n/g
  )) {
    const rawTarget = m[1].trim();
    const action = m[2];
    const literal = rawTarget.match(/^"([a-z0-9.]+)"(?:_n)?$/);
    if (literal) resolved.push({ to: literal[1], action, via: 'literal' });
    else if (accounts[rawTarget])
      resolved.push({ to: accounts[rawTarget], action, via: rawTarget });
    else if (/^get_self\(\)$/.test(rawTarget))
      resolved.push({ to: '<self>', action, via: 'get_self()' });
    else unresolved.push({ target: rawTarget, action });
  }
  return { resolved, unresolved };
}

function dedupe(list, key) {
  const seen = new Map();
  for (const item of list) seen.set(key(item), item);
  return [...seen.values()];
}

/**
 * Compare source declarations against the cached deployed ABI. The ABI is the
 * authority: `sourceOnly` is usually a foreign table this contract reads or a
 * removed action, `abiOnly` usually means a parse gap or a shared-header
 * declaration this extractor has not been pointed at.
 */
async function reconcile(account, actions, tables) {
  const file = path.join(ROOT, 'abis', `${account}.json`);
  if (!existsSync(file)) return { status: 'no-cached-abi' };
  const abi = JSON.parse(await readFile(file, 'utf8'));
  const abiActions = abi.actions.map((a) => a.name);
  const abiTables = abi.tables.map((t) => t.name);
  const ownedActions = abiActions.filter((a) => actions.includes(a));
  // Little or no overlap between source and ABI means the account mapping is
  // probably wrong, not that the contract drifted beyond recognition.
  const overlap = abiActions.length
    ? ownedActions.length / abiActions.length
    : 1;
  const suspectMapping =
    actions.length > 0 && abiActions.length > 0 && overlap < 0.5;

  return {
    status: 'compared',
    ...(suspectMapping
      ? {
          suspectMapping: `only ${ownedActions.length}/${abiActions.length} ABI actions found in source — check the account mapping`,
        }
      : {}),
    ownedActions,
    sourceOnlyActions: actions.filter((a) => !abiActions.includes(a)),
    abiOnlyActions: abiActions.filter((a) => !actions.includes(a)),
    ownedTables: abiTables.filter((t) => tables.includes(t)),
    sourceOnlyTables: tables.filter((t) => !abiTables.includes(t)),
    abiOnlyTables: abiTables.filter((t) => !tables.includes(t)),
  };
}

async function buildableContracts(repoDir) {
  const rc = path.join(repoDir, '.lamingtonrc');
  if (!existsSync(rc)) return null;
  const { include } = JSON.parse(await readFile(rc, 'utf8'));
  return [...new Set((include || []).map((f) => f.replace(/\.cpp$/, '')))];
}

async function main() {
  const graph = {
    $comment:
      'Generated by scripts/contract-source-extract.mjs from the contract source repos. ' +
      'Do not edit by hand: run `pnpm contracts:extract`.',
    accounts: {},
    nonContractConstants: {},
    repos: [],
  };

  for (const repo of REPOS) {
    if (!existsSync(repo.dir)) {
      console.error(
        `SKIP ${repo.key}: ${repo.dir} not found. ` +
          `Set ${repo.key === 'game' ? 'AW_CONTRACTS_DIR' : 'EOSDAC_CONTRACTS_DIR'}.`
      );
      continue;
    }

    const configFile = path.join(repo.dir, 'contracts', 'config.hpp');
    let accounts = {};
    if (existsSync(configFile)) {
      accounts = parseAccountConstants(await readFile(configFile, 'utf8'));
      for (const [constant, account] of Object.entries(accounts)) {
        const base = constant.replace(/_STR$/, '');
        if (NON_CONTRACT_CONSTANTS.has(base))
          graph.nonContractConstants[constant] = account;
        else graph.accounts[constant] = account;
      }
    }

    const buildable = await buildableContracts(repo.dir);
    const contractsDir = path.join(repo.dir, 'contracts');
    const entries = (
      await readdir(contractsDir, { withFileTypes: true })
    ).filter((e) => e.isDirectory() && !e.name.startsWith('.'));

    const contracts = [];
    for (const entry of entries) {
      const name = entry.name;
      const skipReason = NOT_DOCUMENTED[name];
      const files = [
        ...(await collectSources(path.join(contractsDir, name))),
        ...(await sharedHeadersFor(repo.dir, name)),
      ];
      let raw = '';
      for (const f of files)
        raw += stripComments(await readFile(f, 'utf8')) + '\n';
      const clean = stripDevBlocks(raw);

      const sends = parseInlineSends(clean, accounts);
      const prodActions = parseActions(clean);
      // Anything visible only with the dev guards left in is test-only surface.
      const devOnly = parseActions(raw).filter((a) => !prodActions.includes(a));
      const account = ACCOUNT_BY_CONTRACT[name] || null;

      contracts.push({
        name,
        account,
        documented: !skipReason,
        ...(skipReason ? { skipReason } : {}),
        buildable: buildable ? buildable.includes(name) : null,
        sourceFiles: files.length,
        actions: prodActions,
        devOnlyActions: devOnly,
        // Source declarations. A contract also declares the table types of
        // OTHER contracts it reads, so this is a superset of what it owns —
        // abiReconciliation below is the authority on ownership.
        declaredTables: parseTables(clean),
        notifiedBy: dedupe(
          parseNotifications(clean),
          (e) => `${e.from}::${e.action}`
        ),
        calls: dedupe(sends.resolved, (e) => `${e.to}::${e.action}`),
        unresolvedCalls: dedupe(
          sends.unresolved,
          (e) => `${e.target}::${e.action}`
        ),
        abiReconciliation: account
          ? await reconcile(account, prodActions, parseTables(clean))
          : null,
      });
    }

    graph.repos.push({
      key: repo.key,
      label: repo.label,
      contracts: contracts.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  await writeFile(OUT_FILE, JSON.stringify(graph, null, 2) + '\n');

  const all = graph.repos.flatMap((r) => r.contracts);
  const documented = all.filter((c) => c.documented);
  console.log(
    `Wrote ${path.relative(ROOT, OUT_FILE)}: ${all.length} contract dirs, ` +
      `${documented.length} to document, ${all.length - documented.length} skipped, ` +
      `${Object.keys(graph.accounts).length} account constants.`
  );
  const unresolved = all.reduce((n, c) => n + c.unresolvedCalls.length, 0);
  if (unresolved)
    console.log(`${unresolved} inline-action target(s) could not be resolved.`);
}

const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
