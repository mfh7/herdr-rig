import { test, expect } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { argv, HARNESSES } from "./rig.ts";

test("argv expands model and sid, drops model when unset", () => {
  expect(argv(HARNESSES.claude, "headless", "opus", "S", "go")).toEqual(
    ["claude", "-p", "--dangerously-skip-permissions", "--session-id", "S", "--model", "opus", "go"]);
  expect(argv(HARNESSES.omp, "interactive", "", "S")).toEqual(["omp"]);
});

test("ticket, messages and a headless run end to end", async () => {
  const repo = mkdtempSync(join(tmpdir(), "rig-"));
  Bun.spawnSync(["git", "init", "-q", repo]);
  Bun.spawnSync(["git", "-C", repo, "commit", "-q", "--allow-empty", "-m", "init"]);
  const rig = (args: string[], env: Record<string, string> = {}, stdin?: string) => {
    const p = Bun.spawnSync(["bun", join(import.meta.dir, "rig.ts"), ...args],
      { cwd: repo, env: { ...process.env, HERDR_PANE_ID: "", HC_TERMINAL_ID: "", RIG_RUN: "", ...env }, stdin: stdin ? new Blob([stdin]) : "ignore" });
    return p.stdout.toString().trim() + p.stderr.toString().trim();
  };
  expect(rig(["new", "Add", "thing", "--body", "-"], {}, "Goal: x")).toBe("T-1");
  expect(rig(["show", "T-1"])).toContain("Goal: x");
  rig(["set", "harness.fake", JSON.stringify({ model: [], headless: ["bun", "-e", "console.log('worked')"] })]);
  expect(rig(["dispatch", "T-1", "--harness", "fake", "--mode", "headless"])).toBe("run #1 headless");
  let inbox = "";
  for (let i = 0; i < 40 && !inbox.includes("worked"); i++) { await Bun.sleep(250); inbox = rig(["inbox"]); }
  expect(inbox).toContain("exited (0)");
  expect(rig(["show", "T-1"])).toContain("worktree:");
  rig(["say", "manager", "Q: A or B?"], { RIG_RUN: "1" });
  expect(rig(["inbox"])).toContain("T-1/worker [T-1]: Q: A or B?");
  rig(["say", "T-1", "go A"]);
  expect(rig(["inbox"], { RIG_RUN: "1" })).toContain("go A");
  rig(["new", "Second"]);
  rig(["edit", "T-2", "status=needs-you"]);
  const board = rig(["board", "--once"]);
  expect(board.indexOf("NEEDS YOU")).toBeLessThan(board.indexOf("WORKING"));
  expect(board).toContain("go A");
}, 30000);

test("install copies renamed skills only into harnesses that exist", () => {
  const home = mkdtempSync(join(tmpdir(), "rig-home-"));
  Bun.spawnSync(["mkdir", "-p", join(home, ".codex"), join(home, ".config")]);
  const p = Bun.spawnSync(["bun", join(import.meta.dir, "rig.ts"), "install"], { env: { ...process.env, RIG_HOME: home } });
  const out = p.stdout.toString();
  expect(out).toContain("codex:");
  expect(out).toContain("opencode:");
  expect(out).not.toContain("claude:");
  expect(require("node:fs").readFileSync(join(home, ".codex/skills/rig-worker/SKILL.md"), "utf8")).toContain("name: rig-worker");
});
