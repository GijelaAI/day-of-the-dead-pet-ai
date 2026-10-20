#!/usr/bin/env node
/** 部署自动重试包装：瞬时网络抖动时重试一次，两次失败才退出非零。 */
import { spawnSync } from "node:child_process";

const args = ["deploy", ...process.argv.slice(2)];
for (const attempt of [1, 2]) {
  process.stdout.write(`[deploy] attempt ${attempt}/2\n`);
  const r = spawnSync("wrangler", args, { stdio: "inherit", shell: false });
  if (r.status === 0) process.exit(0);
  if (attempt === 1) {
    process.stderr.write("[deploy] 失败（多为瞬时抖动），5 秒后重试…\n");
    spawnSync("sleep", ["5"], { stdio: "inherit" });
  }
}
process.exit(1);