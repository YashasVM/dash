# exp/ — agents.yash0.in ledger (isolated experiment)

Static calendar UI: click a date → see which model did what to which GitHub
repo, what task it was given, and links. Zero npm deps — reuses the dash
aesthetic (Geist Mono via CDN, same dark tokens) so there is no heavy lifting.

Nothing here touches the main site. Deploy `exp/` **alone** as its own
Cloudflare Pages project on the subdomain.

## What's inside (all under `exp/`)

- `index.html`, `styles.css`, `app.js` — calendar + day ledger, vanilla JS
- `logs/YYYY-MM-DD.json` — one file per date (agent logs + GitHub imports)
- `logs/index.json` — manifest of logged dates (UI reads this first)
- `logs/schema.json` — field contract (`source`: `agent` | `github`)
- `AGENTS.md` — instructions every agent follows to log runs
- `log-agent.sh` — append helper: `./exp/log-agent.sh --model … --repo … --task … --did …`
- `sync-github.py` — import commits + PRs from GitHub (stdlib only, idempotent).
  Needs no auth for small setups (60 req/hr anon); set `GITHUB_TOKEN` for more.
  Run after pushes or nightly via cron — see `AGENTS.md`.
- `404.html`, `_headers`, `favicon.svg` — Pages niceties

## Run locally

```sh
python3 -m http.server 8787 --directory exp
# open http://localhost:8787/
```

No build step. `app.js` fetches `./logs/index.json`, then each day file.

## Deploy (Cloudflare Pages, 24/7 — no local server needed)

The site is deployed as the Pages project **`agents-ledger`** in your
Cloudflare account (direct upload, no git push involved):

```sh
wrangler pages deploy exp --project-name agents-ledger --commit-dirty=true
```

- Latest build: `https://agents-ledger.pages.dev/`
- Custom domain: `https://agents.yash0.in/` (added via the Pages API; needs
  the `agents` CNAME in the `yash0.in` zone — see below)

If `agents.yash0.in` ever shows "pending" verification, add the DNS record
manually (dashboard → `yash0.in` → DNS → Add record):

- Type `CNAME`, Name `agents`, Target `agents-ledger.pages.dev`, Proxy ON.

Activation (cert + validation) then completes on its own in a few minutes.
`_headers` keeps `/logs/*` at `no-store` so new agent entries and re-syncs
show immediately after the next `wrangler pages deploy`.

## How agents log (summary)

Full contract in `AGENTS.md`. Short version:

```sh
./exp/log-agent.sh \
  --model "claude-sonnet-4-5" \
  --repo "YashasVM/cd" \
  --task "what the human asked" \
  --did "what you actually changed" \
  --status shipped
```

One entry per task, appended at the end of the task. Never rewrite old days.
