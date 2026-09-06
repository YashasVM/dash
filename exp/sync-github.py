#!/usr/bin/env python3
"""sync-github.py — pull commits + PRs from GitHub into exp/logs/*.json.

Read-only against the GitHub API, writes only to this exp/logs/ folder.
Safe to re-run: entries have stable ids (gh-<sha>, gh-pr-<n>) and are
skipped when already present. Nothing is committed or pushed.

Usage:
  ./exp/sync-github.py [--owner YashasVM] [--repos cd,dash] [--days 60]
                       [--no-prs] [--per-page 30]

Auth: set GITHUB_TOKEN env for 5000 req/hr, otherwise uses the
unauthenticated quota (60 req/hr — enough for a handful of repos).
"""
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

EXP_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(EXP_DIR, "logs")
API = "https://api.github.com"


def api_get(path, token):
    req = urllib.request.Request(API + path, headers={
        "Accept": "application/vnd.github+json",
        "User-Agent": "agents-ledger-sync",
    })
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")[:200]
        if e.code == 403 and "rate limit" in body.lower():
            print(f"RATE LIMITED on {path}, stopping (partial results kept).", flush=True)
            raise StopIteration
        print(f"skip {path}: HTTP {e.code} {body}", flush=True)
        return None


def parse_args(argv):
    o = {"owner": "YashasVM", "repos": None, "days": 60,
         "per_page": 30, "prs": True}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--owner":
            o["owner"] = argv[i + 1]; i += 2
        elif a == "--repos":
            o["repos"] = [r.strip() for r in argv[i + 1].split(",") if r.strip()]; i += 2
        elif a == "--days":
            o["days"] = int(argv[i + 1]); i += 2
        elif a == "--per-page":
            o["per_page"] = int(argv[i + 1]); i += 2
        elif a == "--no-prs":
            o["prs"] = False; i += 1
        elif a in ("-h", "--help"):
            print(__doc__); sys.exit(0)
        else:
            print(f"unknown flag: {a}", file=sys.stderr); sys.exit(1)
    return o


def day_doc(date):
    path = os.path.join(LOGS_DIR, date + ".json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f), path, False
    return {"date": date, "entries": []}, path, True


def save_doc(doc, path):
    with open(path, "w") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
        f.write("\n")


def main():
    o = parse_args(sys.argv[1:])
    token = os.environ.get("GITHUB_TOKEN") or None
    since = (datetime.now(timezone.utc) - timedelta(days=o["days"]))
    since_iso = since.strftime("%Y-%m-%dT%H:%M:%SZ")

    if o["repos"]:
        repos = [{"name": r, "fork": False} for r in o["repos"]]
    else:
        all_repos = api_get(f"/users/{o['owner']}/repos?per_page=100&type=owner", token) or []
        repos = sorted(
            [r for r in all_repos if not r.get("fork")],
            key=lambda r: r.get("pushed_at") or "", reverse=True,
        )[:20]
    print(f"tracking {len(repos)} repos (window: last {o['days']}d)")

    added_c, added_p, skipped = 0, 0, 0
    touched_days = set()
    try:
        for repo in repos:
            name = repo["name"]
            full = f"{o['owner']}/{name}"
            commits = api_get(
                f"/repos/{full}/commits?since={since_iso}&per_page={o['per_page']}", token) or []
            for c in commits:
                sha = c.get("sha", "")
                info = c.get("commit", {})
                who = info.get("committer", {}) or info.get("author", {}) or {}
                dt = who.get("date", "")[:10]
                if not dt or not sha:
                    continue
                author = (c.get("author") or {}).get("login") or who.get("name") or "?"
                msg = (info.get("message") or "").strip()
                first, _, rest = msg.partition("\n")
                doc, path, _ = day_doc(dt)
                eid = "gh-" + sha[:12]
                if any(e.get("id") == eid or (e.get("links") or {}).get("commit", "").endswith("/commit/" + sha) for e in doc["entries"]):
                    skipped += 1
                    continue
                doc["entries"].append({
                    "id": eid,
                    "time": who.get("date", "")[11:16],
                    "model": "github",
                    "agent": author,
                    "repo": full,
                    "task": "(pushed via gh)",
                    "did": first[:220] + ((" — " + rest.strip().split(chr(10))[0][:140]) if rest.strip() else ""),
                    "status": "shipped",
                    "source": "github",
                    "links": {
                        "repo": f"https://github.com/{full}",
                        "commit": f"https://github.com/{full}/commit/{sha}",
                    },
                })
                save_doc(doc, path)
                touched_days.add(dt)
                added_c += 1

            if o["prs"]:
                prs = api_get(
                    f"/repos/{full}/pulls?state=all&sort=updated&direction=desc&per_page=15", token) or []
                for pr in prs:
                    num = pr.get("number")
                    created = (pr.get("created_at") or "")[:10]
                    if not num or not created:
                        continue
                    if datetime.strptime(created, "%Y-%m-%d").replace(tzinfo=timezone.utc) < since:
                        continue
                    state = "shipped" if pr.get("merged_at") else ("wip" if pr.get("state") == "open" else "blocked")
                    doc, path, _ = day_doc(created)
                    eid = f"gh-pr-{name}-{num}"
                    if any(e.get("id") == eid for e in doc["entries"]):
                        skipped += 1
                        continue
                    body = (pr.get("body") or "").strip().split("\n")[0][:160]
                    did = f"#{num} {pr.get('title', '')} — {('merged' if pr.get('merged_at') else pr.get('state'))}"
                    if body:
                        did += f": {body}"
                    doc["entries"].append({
                        "id": eid,
                        "time": (pr.get("created_at") or "")[11:16],
                        "model": "github",
                        "agent": (pr.get("user") or {}).get("login") or "?",
                        "repo": full,
                        "task": "(pull request via gh)",
                        "did": did[:280],
                        "status": state,
                        "source": "github",
                        "links": {
                            "repo": f"https://github.com/{full}",
                            "pr": pr.get("html_url"),
                        },
                    })
                    save_doc(doc, path)
                    touched_days.add(created)
                    added_p += 1
    except StopIteration:
        pass

    # keep manifest in sync
    idx_path = os.path.join(LOGS_DIR, "index.json")
    with open(idx_path) as f:
        idx = json.load(f)
    days = sorted(set(idx.get("days", [])) | touched_days)
    if days != idx.get("days"):
        idx["days"] = days
        idx["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        save_doc(idx, idx_path)

    print(f"done: +{added_c} commits, +{added_p} prs, {skipped} already present, days touched: {sorted(touched_days) or 'none'}")


if __name__ == "__main__":
    main()
