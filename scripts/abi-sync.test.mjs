import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveFields, renderPartial } from './abi-sync.mjs';

// No table in the current ABIs uses struct inheritance, so this path would
// otherwise be shipped unexercised and break the day a contract adds one.
test("resolveFields puts inherited fields before the struct's own", () => {
  const abi = {
    structs: [
      { name: 'base_row', base: '', fields: [{ name: 'id', type: 'uint64' }] },
      {
        name: 'row',
        base: 'base_row',
        fields: [{ name: 'owner', type: 'name' }],
      },
    ],
  };
  assert.deepEqual(resolveFields(abi, 'row'), [
    { name: 'id', type: 'uint64' },
    { name: 'owner', type: 'name' },
  ]);
});

test('resolveFields survives a circular base chain', () => {
  const abi = {
    structs: [
      { name: 'a', base: 'b', fields: [{ name: 'x', type: 'uint8' }] },
      { name: 'b', base: 'a', fields: [{ name: 'y', type: 'uint8' }] },
    ],
  };
  assert.deepEqual(
    resolveFields(abi, 'a')
      .map((f) => f.name)
      .sort(),
    ['x', 'y']
  );
});

test('resolveFields returns nothing for an unknown or empty struct', () => {
  const abi = { structs: [] };
  assert.deepEqual(resolveFields(abi, 'missing'), []);
  assert.deepEqual(resolveFields(abi, ''), []);
});

test('renderPartial escapes a pipe in a type so the row cannot split', () => {
  const out = renderPartial('c', 't', [{ name: 'v', type: 'variant_a|b' }]);
  assert.match(out, /\| `v` \| `variant_a\\\|b` \|/);
  assert.equal(out.split('\n').filter((l) => l.startsWith('| `')).length, 1);
});

test('renderPartial marks a fieldless table instead of emitting an empty table', () => {
  assert.match(renderPartial('c', 't', []), /_no fields_/);
});
