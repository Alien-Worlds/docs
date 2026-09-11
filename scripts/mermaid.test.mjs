import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');

/**
 * Docusaurus renders Mermaid in the browser, so `pnpm build` passes even when a
 * diagram is malformed — the reader sees a red parse error where the diagram
 * should be. A stray `;` inside a sequenceDiagram Note shipped exactly that way.
 *
 * Coverage is deliberately split, because mermaid.parse only runs headless for
 * some diagram types: flowcharts reach DOMPurify and need a DOM (jsdom's current
 * release does not load under Node 20, so it is not worth the dependency).
 *
 *   - sequence diagrams: fully parsed
 *   - every diagram:     linted for the constructs known to break them
 */
async function markdownFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await markdownFiles(full)));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const blocks = [];
for (const file of await markdownFiles(DOCS)) {
  const text = await readFile(file, 'utf8');
  for (const m of text.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
    blocks.push({
      file: path.relative(ROOT, file),
      line: text.slice(0, m.index).split('\n').length,
      source: m[1],
    });
  }
}

const sequenceBlocks = blocks.filter((b) =>
  /^\s*sequenceDiagram\b/m.test(b.source)
);

test('every sequence diagram parses', async () => {
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({ startOnLoad: false });
  const failures = [];
  for (const block of sequenceBlocks) {
    try {
      await mermaid.parse(block.source);
    } catch (err) {
      const message = String(err?.message ?? err)
        .split('\n')
        .slice(0, 2)
        .join(' ');
      failures.push(`${block.file}:${block.line} — ${message}`);
    }
  }
  assert.deepEqual(failures, [], `\n${failures.join('\n')}\n`);
});

// `;` separates statements in mermaid, so one inside label or note text ends the
// statement early and the remainder is parsed as garbage.
test('no diagram has a semicolon inside label or note text', () => {
  const failures = [];
  for (const block of blocks) {
    block.source.split('\n').forEach((line, i) => {
      const text = line.includes(':') ? line.slice(line.indexOf(':') + 1) : '';
      // A trailing `;` terminating the statement is legitimate (`graph TD;`).
      if (text.replace(/;\s*$/, '').includes(';')) {
        failures.push(`${block.file}:${block.line + i} — ${line.trim()}`);
      }
    });
  }
  assert.deepEqual(failures, [], `\n${failures.join('\n')}\n`);
});

test('the checks above are not vacuous', () => {
  assert.ok(blocks.length > 10, `only found ${blocks.length} mermaid blocks`);
  assert.ok(
    sequenceBlocks.length > 3,
    `only found ${sequenceBlocks.length} sequence diagrams`
  );
});
