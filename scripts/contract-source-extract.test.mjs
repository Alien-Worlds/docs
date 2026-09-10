import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  stripComments,
  stripDevBlocks,
  parseAccountConstants,
} from './contract-source-extract.mjs';

// mining.hpp carries a large commented-out block declaring an `nftstate`
// table that is not in the deployed ABI. Without stripping, the extracted
// graph invents contract surface that does not exist.
test('stripComments removes block and line comments', () => {
  const src = `
    /* multi_index<"nftstate"_n, x> ghost; */
    // multi_index<"alsoghost"_n, y> ghost2;
    multi_index<"real"_n, z> live;
  `;
  const out = stripComments(src);
  assert.ok(!out.includes('nftstate'));
  assert.ok(!out.includes('alsoghost'));
  assert.ok(out.includes('real'));
});

test('stripComments keeps string literals containing slashes', () => {
  assert.match(stripComments('const a = "http://x.y/z";'), /http:\/\/x\.y\/z/);
});

test('stripDevBlocks drops IS_DEV-only surface but keeps the rest', () => {
  const src = [
    'ACTION prod1();',
    '#ifdef IS_DEV',
    'ACTION devonly();',
    '#endif',
    'ACTION prod2();',
  ].join('\n');
  const out = stripDevBlocks(src);
  assert.ok(!out.includes('devonly'));
  assert.ok(out.includes('prod1') && out.includes('prod2'));
});

test('stripDevBlocks keeps the #else branch of a dev guard', () => {
  const src = [
    '#ifdef IS_DEV',
    'ACTION devonly();',
    '#else',
    'ACTION realone();',
    '#endif',
  ].join('\n');
  const out = stripDevBlocks(src);
  assert.ok(!out.includes('devonly'));
  assert.ok(out.includes('realone'));
});

test('stripDevBlocks does not swallow code after a nested guard', () => {
  const src = [
    '#ifdef IS_DEV',
    '#ifdef SOMETHING',
    'ACTION hidden();',
    '#endif',
    '#endif',
    'ACTION visible();',
  ].join('\n');
  const out = stripDevBlocks(src);
  assert.ok(!out.includes('hidden'));
  assert.ok(out.includes('visible'));
});

// Repo A writes `static constexpr name`, repo B writes `static constexpr
// eosio::name`. Missing the namespaced form silently emptied the DAO-layer
// account registry.
test('parseAccountConstants handles both plain and namespaced name types', () => {
  const src = [
    'static constexpr name MINING_CONTRACT{"m.federation"};',
    'static constexpr eosio::name MSIG_CONTRACT{"msig.worlds"};',
    'static constexpr name WITH_SUFFIX{"a.b"_n};',
    '#define TOKEN_CONTRACT_STR "alien.worlds"',
  ].join('\n');
  assert.deepEqual(parseAccountConstants(src), {
    MINING_CONTRACT: 'm.federation',
    MSIG_CONTRACT: 'msig.worlds',
    WITH_SUFFIX: 'a.b',
    TOKEN_CONTRACT_STR: 'alien.worlds',
  });
});

test('parseAccountConstants ignores commented-out constants', () => {
  const src = '// static constexpr name GHOST{"ghost.acct"};';
  assert.deepEqual(parseAccountConstants(src), {});
});
