# AGENTS.md — how to log to agents.yash0.in

This folder (`exp/`) is a static ledger with two activity sources, merged by
date into `logs/YYYY-MM-DD.json`:

1. **Agent logs** (`"source": "agent"`) — you write these at the end of each
   task: model, repo, task given, what you did. This is the only place the
   *model + task* context exists, so don't skip it.
2. **GitHub imports** (`"source": "github"`) — commits + PRs pulled by
   `exp/sync-github.py`. These prove what actually landed on `gh`.

The calendar UI reads these files and lets the human filter by source.
No backend, no npm install, no heavy deps.

## Where to write

- One file per date: `exp/logs/YYYY-MM-DD.json`
- Manifest: `exp/logs/index.json` (add your date to `days` if new)
- Schema: `exp/logs/schema.json`

## Required fields per entry

`id, time, model, repo, task, did, status`

Optional but encouraged: `agent, duration_min, files_touched[], tags[], links{repo,commit,pr,run}`

- `model`: exact model id, e.g. `claude-opus-4-1`, `claude-sonnet-4-5`, `muse-spark-1.3`
- `repo`: `Owner/Repo` or short name, e.g. `YashasVM/cd`
- `task`: what the human asked, 1 line
- `did`: what you actually did, 1–3 sentences. Be honest about wip/blocked.
- `status`: one of `shipped | wip | blocked | reverted`

## Fastest way (use the script)

From the repo root:

```sh
./exp/log-agent.sh \
  --model "claude-sonnet-4-5" \
  --agent "opencode" \
  --repo "YashasVM/cd" \
  --task "what the human asked" \
  --did "what you actually changed" \
  --status shipped \
  --duration 35 \
  --files "app/join.tsx,lib/peer.ts" \
  --tags "webrtc,ux" \
  --commit "https://github.com/YashasVM/cd/commit/abc123"
```

The script creates today's file if missing, appends the entry with `jq`
(or python3 fallback), and adds the date to `logs/index.json`.

If `jq` and `python3` are both missing, copy yesterday's JSON by hand and
edit it — keep the same shape.

## Rules

1. Log at the END of the task, one entry per distinct task.
2. Never rewrite history: append, don't edit old entries (fix with a new entry).
3. Keep `task` = human's words, `did` = your words. Don't merge them.
4. If you touched no repo (infra/question), set `repo` to `YashasVM/dash` or `no-repo`.
5. Don't commit or push from here unless the human explicitly asks.

## GitHub sync (keeps the ledger honest)

Agents push via `gh`, so the ledger also imports real repo activity:

```sh
./exp/sync-github.py --days 60            # commits + PRs, all owned repos
./exp/sync-github.py --repos cd,dash      # just these
GITHUB_TOKEN=ghp_... ./exp/sync-github.py # higher rate limit (else 60 req/hr anon)
```

Re-runs are idempotent (stable ids `gh-<sha>`, `gh-pr-<repo>-<n>`).
Run it after pushing, or nightly via cron:

```sh
0 2 * * * cd /home/yvm/codes/dash && ./exp/sync-github.py --days 90 >> /tmp/agents-sync.log 2>&1
```
