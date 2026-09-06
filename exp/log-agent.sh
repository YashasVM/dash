#!/usr/bin/env bash
# log-agent.sh — append one entry to exp/logs/YYYY-MM-DD.json (file-based, no backend).
# Usage: ./exp/log-agent.sh --model ... --repo ... --task ... --did ... [options]
set -euo pipefail

EXP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$EXP_DIR/logs"
DATE="$(date +%F)"
TIME_NOW="$(date +%H:%M)"
FILE="$LOGS_DIR/$DATE.json"
INDEX="$LOGS_DIR/index.json"

MODEL=""; AGENT="opencode"; REPO=""; TASK=""; DID=""; STATUS="shipped"
DURATION=""; FILES=""; TAGS=""; COMMIT=""; PR=""; RUN=""; REPO_URL=""

while [ $# -gt 0 ]; do
  case "$1" in
    --date) DATE="$2"; FILE="$LOGS_DIR/$DATE.json"; shift 2 ;;
    --time) TIME_NOW="$2"; shift 2 ;;
    --model) MODEL="$2"; shift 2 ;;
    --agent) AGENT="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    --task) TASK="$2"; shift 2 ;;
    --did) DID="$2"; shift 2 ;;
    --status) STATUS="$2"; shift 2 ;;
    --duration) DURATION="$2"; shift 2 ;;
    --files) FILES="$2"; shift 2 ;;
    --tags) TAGS="$2"; shift 2 ;;
    --commit) COMMIT="$2"; shift 2 ;;
    --pr) PR="$2"; shift 2 ;;
    --run) RUN="$2"; shift 2 ;;
    --repo-url) REPO_URL="$2"; shift 2 ;;
    -h|--help) sed -n '1,12p' "$0"; exit 0 ;;
    *) echo "unknown flag: $1" >&2; exit 1 ;;
  esac
done

if [ -z "$MODEL" ] || [ -z "$REPO" ] || [ -z "$TASK" ] || [ -z "$DID" ]; then
  echo "missing required: --model --repo --task --did" >&2
  exit 1
fi

mkdir -p "$LOGS_DIR"
if [ ! -f "$FILE" ]; then
  printf '{\n  "date": "%s",\n  "entries": []\n}\n' "$DATE" > "$FILE"
fi

export EXP_FILE="$FILE" EXP_INDEX="$INDEX" EXP_DATE="$DATE" EXP_TIME="$TIME_NOW"
export EXP_MODEL="$MODEL" EXP_AGENT="$AGENT" EXP_REPO="$REPO" EXP_TASK="$TASK"
export EXP_DID="$DID" EXP_STATUS="$STATUS" EXP_DURATION="$DURATION"
export EXP_FILES="$FILES" EXP_TAGS="$TAGS" EXP_COMMIT="$COMMIT"
export EXP_PR="$PR" EXP_RUN="$RUN" EXP_REPO_URL="$REPO_URL"

if command -v python3 >/dev/null 2>&1; then
  python3 - "$EXP_FILE" <<'PY'
import json, os, sys
path = sys.argv[1]
with open(path) as f:
    doc = json.load(f)
entries = doc.get("entries", [])
nid = f'{os.environ["EXP_DATE"]}-{len(entries)+1:02d}'
def split_csv(s):
    return [x.strip() for x in s.split(",") if x.strip()] if s else []
links = {}
if os.environ.get("EXP_COMMIT"): links["commit"] = os.environ["EXP_COMMIT"]
if os.environ.get("EXP_PR"): links["pr"] = os.environ["EXP_PR"]
if os.environ.get("EXP_RUN"): links["run"] = os.environ["EXP_RUN"]
if os.environ.get("EXP_REPO_URL"): links["repo"] = os.environ["EXP_REPO_URL"]
entry = {
    "id": nid,
    "time": os.environ["EXP_TIME"],
    "model": os.environ["EXP_MODEL"],
    "agent": os.environ.get("EXP_AGENT", "opencode"),
    "repo": os.environ["EXP_REPO"],
    "task": os.environ["EXP_TASK"],
    "did": os.environ["EXP_DID"],
    "status": os.environ.get("EXP_STATUS", "shipped"),
}
if os.environ.get("EXP_DURATION"):
    try: entry["duration_min"] = float(os.environ["EXP_DURATION"])
    except ValueError: entry["duration_min"] = os.environ["EXP_DURATION"]
files = split_csv(os.environ.get("EXP_FILES", ""))
if files: entry["files_touched"] = files
tags = split_csv(os.environ.get("EXP_TAGS", ""))
if tags: entry["tags"] = tags
if links: entry["links"] = links
entries.append(entry)
doc["date"] = os.environ["EXP_DATE"]
doc["entries"] = entries
with open(path, "w") as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)
    f.write("\n")
print(f"appended {nid} to {path}")
PY
elif command -v jq >/dev/null 2>&1; then
  COUNT="$(jq '.entries | length' "$FILE")"
  NID="$(printf '%s-%02d' "$DATE" $((COUNT + 1)))"
  jq --arg id "$NID" --arg t "$TIME_NOW" --arg m "$MODEL" --arg a "$AGENT" \
     --arg r "$REPO" --arg task "$TASK" --arg did "$DID" --arg s "$STATUS" \
     '.entries += [{id:$id,time:$t,model:$m,agent:$a,repo:$r,task:$task,did:$did,status:$s}] | .date=$id[0:10]' \
     "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
  echo "appended $NID to $FILE (jq fallback: re-run with python3 for full fields)"
else
  echo "need python3 or jq to append safely" >&2
  exit 1
fi

# keep index.json in sync
if [ -f "$INDEX" ] && command -v python3 >/dev/null 2>&1; then
  python3 - "$INDEX" <<'PY'
import json, os, sys, datetime
path = sys.argv[1]
with open(path) as f:
    idx = json.load(f)
days = idx.get("days", [])
d = os.environ["EXP_DATE"]
if d not in days:
    days.append(d); days.sort()
idx["days"] = days
idx["updated"] = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
with open(path, "w") as f:
    json.dump(idx, f, indent=2)
    f.write("\n")
print(f"index now tracks {len(days)} days")
PY
fi
