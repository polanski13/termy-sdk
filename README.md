# @termy/sdk

TypeScript SDK for authoring Termy community plugins.

The package provides types, `definePlugin()`, and a manifest schema. It does not provide a runtime. Termy loads the compiled JavaScript plugin in its own helper process and exposes only the SDK methods backed by granted capabilities.

## Install

```sh
npm install @termy/sdk
```

## Plugin shape

```text
my-plugin.termy-plugin/
  manifest.json
  dist/index.js
  README.md
```

## Basic plugin

```ts
import { definePlugin } from "@termy/sdk";

export default definePlugin({
  async activate(ctx) {
    ctx.registerAction("example.showHosts", async () => {
      const hosts = await ctx.hosts.list();

      return ctx.ui.table({
        title: "Hosts",
        columns: [{ id: "name", title: "Name" }],
        rows: hosts.map((host) => ({ name: host.name }))
      });
    });

    ctx.registerPane("example.dashboard", async () => {
      return ctx.ui.empty("Dashboard", "Ready");
    });
  }
});
```

## Manifest

```json
{
  "id": "community.example.hosts",
  "name": "Hosts Example",
  "version": "1.0.0",
  "termyApiVersion": "1",
  "entry": "dist/index.js",
  "capabilities": ["hosts.read"],
  "contributes": {
    "actions": [
      { "id": "example.showHosts", "title": "Example: Show Hosts" }
    ],
    "panes": [
      { "id": "example.dashboard", "title": "Example Dashboard" }
    ]
  }
}
```

The manifest schema is published at:

```ts
import manifestSchema from "@termy/sdk/manifest-schema";
```

## Build guidance

Termy v1 expects the compiled entry file to keep this shape:

```ts
import { definePlugin } from "@termy/sdk";

export default definePlugin({
  activate(ctx) {}
});
```

For a single-file plugin with no bundled dependencies, TypeScript can emit the entry directly:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true
  }
}
```

Run:

```sh
npx tsc -p tsconfig.json
```

## Capabilities

Termy grants capabilities per installed plugin. SDK calls fail when the matching capability was not granted.

| Capability | Methods |
| --- | --- |
| `hosts.read` | `ctx.hosts.list()` |
| `snippets.read` | `ctx.snippets.list()` |
| `terminal.write` | `ctx.terminal.insert(text)`, `ctx.terminal.run(text)` |

Plugins do not receive Node APIs, arbitrary filesystem access, network access, Keychain access, SSH credentials, or terminal scrollback through the v1 SDK.

## Local example

```sh
npm install
npm run build
npm run build:example
```

The example plugin is in `examples/basic-plugin`.

## Publishing this SDK

The package is intended to be published as public npm package `@termy/sdk`.

For scoped public packages, publish with:

```sh
npm publish --access public
```

The repository includes a GitHub Actions workflow for npm trusted publishing. Configure npm trusted publishing for `polanski13/termy-sdk` and workflow file `publish.yml`, then publish by pushing a `v*` tag or creating a GitHub release.
