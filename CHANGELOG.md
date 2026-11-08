# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-11-08

First public release.

### Added
- `rig` CLI (Bun + SQLite): tickets, dispatch, messages, steering, runs, cleanup, settings.
- Skills for the three roles: `manager`, `worker`, `reviewer`, installable into Claude Code, Codex, opencode, pi, omp and Command Code (`rig install`), plus a Claude Code plugin.
- Harnesses for workers and reviewers: Claude Code, Codex, opencode, pi, omp, Command Code, each with model and effort, and custom harnesses through `rig set harness.<name>`.
- Two backends: the herdr CLI and the herdr desktop app (`hc` + `herdr-app`).
- Pane, tab and headless runs, with a default layout (manager left, board top right, up to `pane.max` runs under it, tabs after that).
- A git worktree and `rig/T-n` branch per ticket, cut from the manager's branch or `--base`.
- Ticket order with `--after`, and a message to the manager when a ticket is unblocked.
- A watcher per pane run that reports agents that go idle or blocked without reporting, or exit.
- Cleanup when a ticket is done: panes and tabs closed, worktree and branch removed once the work has landed (normal or squash merge), and `rig clean` for leftovers.
- The board, as a native herdr-app mod and as a terminal board with spinners and an activity feed.
- CI on Linux, macOS and Windows.

[0.1.0]: https://github.com/zanuartri/herdr-rig/releases/tag/v0.1.0
