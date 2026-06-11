import { definePlugin } from "@apolanski13/termy-sdk";

export default definePlugin({
  async activate(ctx) {
    ctx.registerAction("basic.showSummary", async () => {
      const hosts = await ctx.hosts.list();
      const snippets = await ctx.snippets.list();

      ctx.effects.toast(`Loaded ${hosts.length} hosts and ${snippets.length} snippets`, "info");

      return ctx.ui.stack(
        [
          ctx.ui.markdown({
            title: "Basic Termy Plugin",
            body: `Hosts: ${hosts.length}\nSnippets: ${snippets.length}`
          }),
          ctx.ui.table({
            title: "Hosts",
            columns: [
              { id: "name", title: "Name" },
              { id: "hostname", title: "Hostname" },
              { id: "username", title: "User" },
              { id: "port", title: "Port" }
            ],
            rows: hosts.map((host) => ({
              name: host.name,
              hostname: host.hostname,
              username: host.username,
              port: host.port
            }))
          })
        ],
        "Summary"
      );
    });

    ctx.registerAction("basic.insertDate", () => {
      return ctx.terminal.insert("date");
    });

    ctx.registerPane("basic.dashboard", async () => {
      const hosts = await ctx.hosts.list();
      const snippets = await ctx.snippets.list();
      const workspace = await ctx.workspace.current();
      const refreshCount = Number((await ctx.storage.get("refreshCount")) ?? 0) + 1;
      await ctx.storage.set("refreshCount", refreshCount);

      return ctx.ui.stack(
        [
          ctx.ui.statGrid({
            title: "Plugin data",
            stats: [
              { id: "hosts", title: "Hosts", value: hosts.length },
              { id: "snippets", title: "Snippets", value: snippets.length },
              { id: "refreshes", title: "Refreshes", value: refreshCount }
            ]
          }),
          ctx.ui.list({
            title: "Workspace",
            items: [
              {
                id: "focused",
                title: workspace.focusedPaneKind ?? "No focused pane",
                subtitle: workspace.focusedPaneHasTerminal ? "Terminal input available" : "No terminal input"
              }
            ]
          }),
          ctx.ui.divider("Inventory"),
          ctx.ui.table({
            columns: [
              { id: "metric", title: "Metric" },
              { id: "value", title: "Value" }
            ],
            rows: [
              { metric: "Hosts", value: hosts.length },
              { metric: "Snippets", value: snippets.length }
            ]
          })
        ],
        "Dashboard"
      );
    });

    ctx.registerSettings("basic.preferences", async (event) => {
      if (event?.formValues?.label) {
        await ctx.storage.set("label", event.formValues.label);
      }
      const label = (await ctx.storage.get("label")) ?? "Basic Termy Plugin";
      return ctx.ui.form({
        id: "basic.preferences.form",
        title: "Preferences",
        fields: [
          { id: "label", title: "Dashboard label", type: "text", value: label }
        ],
        actions: [
          { id: "basic.savePreferences", title: "Save", submitFormId: "basic.preferences.form", style: "prominent" }
        ]
      });
    });
  }
});
