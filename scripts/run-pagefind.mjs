import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const siteDir = existsSync(path.join(root, "dist/client")) ? "dist/client" : "dist";

const bin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "pagefind.cmd" : "pagefind");

const result = spawnSync(bin, ["--site", siteDir], {
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`[pagefind] Indexed site at ${siteDir}`);
