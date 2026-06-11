import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const output = await readFile(new URL("../examples/basic-plugin/dist/index.js", import.meta.url), "utf8");

test("basic plugin output keeps the Termy loader import", () => {
  assert.match(output, /import\s+\{\s*definePlugin\s*\}\s+from\s+["']@apolanski13\/termy-sdk["']/);
});

test("basic plugin output keeps the direct default plugin export", () => {
  assert.match(output, /export\s+default\s+definePlugin\s*\(/);
});

test("basic plugin output includes SDK 0.2 native UX calls", () => {
  assert.match(output, /ctx\.workspace\.current\(/);
  assert.match(output, /ctx\.storage\.set\(/);
  assert.match(output, /ctx\.registerSettings\(/);
  assert.match(output, /ctx\.ui\.statGrid\(/);
  assert.match(output, /ctx\.ui\.list\(/);
});
