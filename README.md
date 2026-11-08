# herdr-rig

You talk to one **manager** session. It writes tickets and dispatches **workers** and **reviewers** (claude, codex, omp, pi, opencode, commandcode). Each one runs in a herdr pane or tab, or headless, in its own git worktree. Most of the logic lives in skills. The `rig` CLI (`rig.ts`, Bun + `bun:sqlite`) only keeps shared state and launches runs. herdr is the relay, so there is no daemon or MCP.

```
bun link                                    # puts `rig` on PATH
claude plugin marketplace add <this dir>    # then: claude plugin install rig@herdr-rig
```

## herdr CLI or herdr desktop app

rig picks the backend from the manager's terminal: `HERDR_PANE_ID` uses the `herdr` CLI, and `HC_TERMINAL_ID` uses the desktop app (`hc` + `herdr-app`). Panes and tabs open beside the manager, in its own space, not wherever you are looking.

Default layout: the manager keeps the left half. The board opens by itself in the top half on the right, and up to `pane.max` (default 2, so 25% each) pane workers and reviewers stack under it. Later runs open as tabs. `rig edit T-1 status=done` or `rig close T-1` closes a ticket's panes and tabs. To change the layout for one run, use `--mode tab|pane|headless`. To change it for good, use `rig set pane.max 3`, `rig set board off` or `rig set mode tab`. Board: in the desktop app, `rig install` adds a native board mod (`~/.config/herdr-app/mods/rig-board`, or `$HERDR_APP_HOME`; same path on Windows, macOS and Linux). It groups tickets by what they need from you, you can click a ticket to jump to its worker, and it shows a toast when something needs you. herdr CLI users and people without the app get the terminal board. Desktop users who prefer the terminal board can run `rig set board tui`, or `rig board --open --tui` for one time. `rig set board off` turns off the automatic board.

## Any harness as manager

The manager is a skill plus the `rig` CLI, so it runs in any coding agent that has a shell. Messages are pushed into its herdr pane, whatever agent is running there.

```
rig install            # copies rig-manager/worker/reviewer into every skills dir it finds
rig install codex pi   # or name the ones you want
```

| harness | skills dir | start the manager |
|---|---|---|
| Claude Code | `~/.claude/skills` (or the plugin) | `/rig-manager` (plugin: `/rig:manager`) |
| Codex | `~/.codex/skills` | `$rig-manager` |
| opencode | `~/.config/opencode/skills` | ask it to use the rig-manager skill |
| pi | `~/.pi/agent/skills` | `/skill:rig-manager` |
| omp | `~/.omp/agent/skills` | `/skill:rig-manager` |
| Command Code | `~/.commandcode/skills` | `/rig-manager` |
| Others (Agent Skills standard) | `~/.agents/skills` | `rig install agents` |
| Anything else | none | tell it: "run `rig skill manager` and follow it" |

Workers and reviewers don't need anything installed. Their first prompt tells them to run `rig skill worker`.

- State: `<repo>/.rig/rig.db` (self-gitignored). Worktrees: `.rig/wt/T-n`. Headless logs: `.rig/run-n.log`.
- Settings: `rig get`, `rig set worker.harness codex`, `rig set mode headless`, `rig set harness.<name> '<json>'` to add or override a harness.
- Steer: `rig tell T-1 "..." [--now]`, or type into the worker's pane yourself. Interrupt: `rig stop T-1`.
- Order: `rig new "..." --after T-3` keeps a ticket Queued until T-3 is done. The manager is told when it is unblocked.
- Cleanup: `rig edit T-1 status=done` closes its panes and removes its worktree and branch once the changes are in HEAD (normal or squash merge). Unmerged work is kept. `rig clean` sweeps every done ticket, and `rig clean T-1 --force` throws one away.
- The manager listens with `rig inbox --wait` as a background command (Claude Code: `run_in_background`). While it listens, rig never types into its pane. Without a listener, messages are typed in only while you aren't focused on that pane.
- Watching: each pane run has a watcher. The manager hears when a worker goes idle or blocked without reporting, or exits.
- First prompt: claude, codex, opencode, pi and omp get it as a launch argument, so a startup dialog can't swallow it. In a folder Claude Code hasn't trusted yet, the worker waits on its trust prompt until you accept it once.
- Several managers can share one repo. Each one is identified by its herdr pane (`rig ls --mine`).

`rig help` lists every command. Test: `bun test`.
