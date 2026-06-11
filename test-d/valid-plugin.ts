import { definePlugin, type PluginManifest, termyApiVersion } from "../src/index.js";

const manifest: PluginManifest = {
  id: "community.example.types",
  name: "Types",
  version: "1.0.0",
  termyApiVersion,
  entry: "dist/index.js",
  capabilities: ["hosts.read", "snippets.read", "terminal.write", "workspace.read", "storage.read", "storage.write"],
  contributes: {
    actions: [{ id: "types.show", title: "Show" }],
    panes: [{ id: "types.main", title: "Main" }],
    settings: [{ id: "types.settings", title: "Settings" }]
  }
};

void manifest;

export default definePlugin({
  async activate(ctx) {
    ctx.registerAction("types.show", async (event) => {
      const hosts = await ctx.hosts.list();
      const snippets = await ctx.snippets.list();
      const workspace = await ctx.workspace.current();
      ctx.effects.toast(`${hosts.length}:${snippets.length}`, "info");
      return ctx.ui.markdown({
        title: event?.source ?? "Typed",
        body: workspace.focusedPaneKind ?? hosts[0]?.name ?? "none"
      });
    });

    ctx.registerAction("types.insert", () => ctx.terminal.insert("date"));

    ctx.registerPane("types.main", async (event) => {
      const hosts = await ctx.hosts.list();
      await ctx.storage.set("lastRefresh", event?.refreshReason ?? "initial");
      return ctx.ui.stack([
        ctx.ui.statGrid({
          stats: [{ id: "hosts", title: "Hosts", value: hosts.length, tone: "accent" }]
        }),
        ctx.ui.list({
          items: hosts.map((host) => ({
            id: host.id,
            title: host.name,
            subtitle: host.hostname,
            value: host.id,
            actions: [{ id: "types.show", title: "Show", rowAction: true }]
          }))
        }),
        ctx.ui.divider(),
        ctx.ui.table({
          columns: [{ id: "host", title: "Host" }],
          rows: hosts.map((host) => ({ host: host.name }))
        })
      ]);
    });

    ctx.registerSettings("types.settings", async (event) => {
      const enabled = Boolean(event?.formValues?.enabled ?? (await ctx.storage.get("enabled")) ?? false);
      await ctx.storage.set("enabled", enabled);
      return ctx.ui.form({
        id: "types.settings.form",
        fields: [
          { id: "label", title: "Label", type: "text", value: "Typed" },
          { id: "enabled", title: "Enabled", type: "checkbox", value: enabled },
          {
            id: "mode",
            title: "Mode",
            type: "select",
            value: "compact",
            options: [
              { value: "compact", title: "Compact" },
              { value: "expanded", title: "Expanded" }
            ]
          }
        ],
        actions: [{ id: "types.saveSettings", title: "Save", submitFormId: "types.settings.form" }]
      });
    });
  }
});
