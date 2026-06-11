import { definePlugin, type PluginManifest, termyApiVersion } from "../src/index.js";

const manifest: PluginManifest = {
  id: "community.example.types",
  name: "Types",
  version: "1.0.0",
  termyApiVersion,
  entry: "dist/index.js",
  capabilities: ["hosts.read", "snippets.read", "terminal.write"],
  contributes: {
    actions: [{ id: "types.show", title: "Show" }],
    panes: [{ id: "types.main", title: "Main" }]
  }
};

void manifest;

export default definePlugin({
  async activate(ctx) {
    ctx.registerAction("types.show", async () => {
      const hosts = await ctx.hosts.list();
      const snippets = await ctx.snippets.list();
      ctx.effects.toast(`${hosts.length}:${snippets.length}`, "info");
      return ctx.ui.markdown({ title: "Typed", body: hosts[0]?.name ?? "none" });
    });

    ctx.registerAction("types.insert", () => ctx.terminal.insert("date"));

    ctx.registerPane("types.main", async () => {
      const hosts = await ctx.hosts.list();
      return ctx.ui.table({
        columns: [{ id: "host", title: "Host" }],
        rows: hosts.map((host) => ({ host: host.name }))
      });
    });
  }
});
