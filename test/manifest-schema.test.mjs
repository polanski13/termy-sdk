import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import Ajv from "ajv/dist/2020.js";

const schema = JSON.parse(await readFile(new URL("../schema/manifest.v1.schema.json", import.meta.url), "utf8"));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const validManifest = {
  id: "community.example.valid",
  name: "Valid",
  version: "1.0.0",
  termyApiVersion: "1",
  entry: "dist/index.js",
  capabilities: ["hosts.read", "snippets.read", "workspace.read", "storage.read", "storage.write"],
  contributes: {
    actions: [{ id: "valid.show", title: "Show" }],
    panes: [{ id: "valid.main", title: "Main" }],
    settings: [{ id: "valid.settings", title: "Settings" }]
  }
};

test("accepts a valid manifest", () => {
  assert.equal(validate(validManifest), true);
});

test("rejects an unsafe entry path", () => {
  assert.equal(validate({ ...validManifest, entry: "../outside.js" }), false);
});

test("rejects invalid plugin ids", () => {
  assert.equal(validate({ ...validManifest, id: "Community.Example.Bad" }), false);
  assert.equal(validate({ ...validManifest, id: "community..bad" }), false);
});

test("rejects unknown capabilities", () => {
  assert.equal(validate({ ...validManifest, capabilities: ["network.fetch"] }), false);
});

test("rejects missing contribution titles", () => {
  assert.equal(
    validate({
      ...validManifest,
      contributes: {
        actions: [{ id: "valid.show" }],
        panes: []
      }
    }),
    false
  );
});

test("rejects invalid settings contributions", () => {
  assert.equal(
    validate({
      ...validManifest,
      contributes: {
        actions: validManifest.contributes.actions,
        panes: validManifest.contributes.panes,
        settings: [{ id: "valid..settings", title: "Settings" }]
      }
    }),
    false
  );
});
