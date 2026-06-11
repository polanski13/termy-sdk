import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = new URL("..", import.meta.url);
const rootPath = fileURLToPath(root);
const packResult = await run("npm", ["pack", "--json"], { cwd: root });
const packed = JSON.parse(packResult.stdout)[0];
assert.ok(packed.filename);

const temp = await mkdtemp(join(tmpdir(), "termy-sdk-pack-"));

try {
  await writeFile(
    join(temp, "package.json"),
    JSON.stringify(
      {
        type: "module",
        scripts: {
          typecheck: "tsc --noEmit"
        },
        dependencies: {
          "@apolanski13/termy-sdk": join(rootPath, packed.filename)
        },
        devDependencies: {
          typescript: "^5.9.3"
        }
      },
      null,
      2
    )
  );
  await writeFile(
    join(temp, "index.ts"),
    [
      'import { definePlugin } from "@apolanski13/termy-sdk";',
      'import manifestSchema from "@apolanski13/termy-sdk/manifest-schema";',
      "void manifestSchema;",
      "export default definePlugin({",
      "  activate(ctx) {",
      '    ctx.registerPane("pack.main", () => ctx.ui.empty("Packed"));',
      "  }",
      "});"
    ].join("\n")
  );
  await writeFile(
    join(temp, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          skipLibCheck: true
        },
        include: ["index.ts"]
      },
      null,
      2
    )
  );
  await run("npm", ["install"], { cwd: temp });
  await run("npm", ["run", "typecheck"], { cwd: temp });
} finally {
  await rm(temp, { recursive: true, force: true });
  await rm(new URL(packed.filename, root), { force: true });
}
