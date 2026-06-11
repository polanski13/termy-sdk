import { definePlugin } from "@termy/sdk";

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

      return ctx.ui.table({
        title: "Plugin data",
        columns: [
          { id: "metric", title: "Metric" },
          { id: "value", title: "Value" }
        ],
        rows: [
          { metric: "Hosts", value: hosts.length },
          { metric: "Snippets", value: snippets.length }
        ]
      });
    });
  }
});
