/* agents.yash0.in — static calendar ledger. Zero deps. Reads exp/logs/*.json */
(function () {
  "use strict";

  var state = {
    cursor: startOfMonth(new Date()),
    selected: toISODate(new Date()),
    days: {}, // "YYYY-MM-DD" -> { date, entries: [] }
    dayList: [],
    filters: { source: "", model: "", repo: "", q: "", status: "" },
  };

  var els = {};
  ["cal-grid", "month-label", "day-label", "day-meta", "day-list",
   "filter-source", "filter-model", "filter-repo", "filter-q", "filter-status",
   "stat-runs", "stat-models", "stat-repos", "stat-day",
  ].forEach(function (id) { els[id] = document.getElementById(id); });

  document.getElementById("prev-btn").addEventListener("click", function () {
    state.cursor = addMonths(state.cursor, -1);
    render();
  });
  document.getElementById("next-btn").addEventListener("click", function () {
    state.cursor = addMonths(state.cursor, 1);
    render();
  });
  document.getElementById("today-btn").addEventListener("click", function () {
    state.cursor = startOfMonth(new Date());
    state.selected = toISODate(new Date());
    render();
  });

  els["filter-source"].addEventListener("change", function (e) { state.filters.source = e.target.value; render(); });
  els["filter-model"].addEventListener("change", function (e) { state.filters.model = e.target.value; render(); });
  els["filter-repo"].addEventListener("change", function (e) { state.filters.repo = e.target.value; render(); });
  els["filter-status"].addEventListener("change", function (e) { state.filters.status = e.target.value; render(); });
  els["filter-q"].addEventListener("input", function (e) { state.filters.q = e.target.value.toLowerCase(); renderDay(); renderStats(); });

  boot();

  function boot() {
    fetch("./logs/index.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("no index"); return r.json(); })
      .then(function (idx) {
        state.dayList = (idx && idx.days) || [];
        return loadDays(state.dayList);
      })
      .catch(function () {
        // Fallback: probe nearby dates so `python3 -m http.server` still works
        // even if index.json is stale. Agents keep index.json updated via log-agent.sh.
        var probe = neighborDates(new Date(), 45);
        state.dayList = probe;
        return loadDays(probe);
      })
      .then(function () {
        buildFilterOptions();
        // If selected day has no logs, jump to most recent logged day.
        if (!state.days[state.selected] && state.dayList.length) {
          var known = Object.keys(state.days).sort();
          if (known.length) {
            state.selected = known[known.length - 1];
            state.cursor = startOfMonth(parseISO(state.selected));
          }
        }
        render();
      });
  }

  function loadDays(days) {
    return Promise.all(days.map(function (d) {
      return fetch("./logs/" + d + ".json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (doc) {
          if (doc && doc.date) state.days[doc.date] = doc;
        })
        .catch(function () {});
    }));
  }

  function render() {
    renderCal();
    renderDay();
    renderStats();
  }

  /* ---------- calendar ---------- */
  function renderCal() {
    var y = state.cursor.getFullYear(), m = state.cursor.getMonth();
    els["month-label"].textContent = state.cursor.toLocaleString("en", { month: "long", year: "numeric" });

    var first = new Date(y, m, 1);
    var lead = (first.getDay() + 6) % 7; // Monday-first
    var dim = new Date(y, m + 1, 0).getDate();
    var todayISO = toISODate(new Date());

    els["cal-grid"].innerHTML = "";
    for (var i = 0; i < lead; i++) {
      var pad = document.createElement("span");
      pad.className = "cell dim";
      pad.setAttribute("aria-hidden", "true");
      els["cal-grid"].appendChild(pad);
    }
    for (var d = 1; d <= dim; d++) {
      (function (day) {
        var iso = isoOf(y, m, day);
        var doc = state.days[iso];
        var entries = doc ? filterEntries(doc.entries) : [];
        var b = document.createElement("button");
        b.type = "button";
        b.className = "cell" + (iso === state.selected ? " selected" : "")
          + (iso === todayISO ? " today" : "")
          + (!doc || !doc.entries.length ? " empty" : "");
        b.setAttribute("role", "gridcell");
        b.setAttribute("aria-label", iso + (doc ? ", " + doc.entries.length + " runs" : ", no runs"));

        var top = document.createElement("span");
        top.className = "d";
        top.textContent = String(day).padStart(2, "0");
        b.appendChild(top);

        if (doc && doc.entries.length) {
          var dots = document.createElement("span");
          dots.className = "dots";
          uniq(doc.entries.map(function (e) { return modelColor(e); })).slice(0, 5).forEach(function (c) {
            var dot = document.createElement("span");
            dot.className = "dot";
            dot.style.background = c;
            dots.appendChild(dot);
          });
          var count = document.createElement("span");
          count.className = "c";
          // Show filtered count when a filter is active, total otherwise.
          var showFiltered = state.filters.source || state.filters.model || state.filters.repo || state.filters.q || state.filters.status;
          count.textContent = showFiltered ? entries.length + "/" + doc.entries.length : doc.entries.length + (doc.entries.length === 1 ? " run" : " runs");
          b.appendChild(dots);
          b.appendChild(count);
        } else {
          var z = document.createElement("span");
          z.className = "c";
          z.textContent = "—";
          b.appendChild(z);
        }
        b.addEventListener("click", function () {
          state.selected = iso;
          renderCal();
          renderDay();
          renderStats();
        });
        els["cal-grid"].appendChild(b);
      })(d);
    }
  }

  /* ---------- day detail ---------- */
  function renderDay() {
    var doc = state.days[state.selected];
    var entries = doc ? filterEntries(doc.entries) : [];
    els["day-label"].textContent = prettyDate(state.selected);
    els["day-meta"].textContent = doc
      ? entries.length + " of " + doc.entries.length + " runs shown · " + state.selected
      : "no log file yet · " + state.selected;

    els["day-list"].innerHTML = "";
    if (!entries.length) {
      var empty = document.createElement("div");
      empty.className = "empty-note";
      empty.innerHTML = doc
        ? "nothing matches these filters on this day. clear search / model / repo."
        : "no agent runs logged for this date yet.<br>agents: see <code>exp/AGENTS.md</code> + <code>exp/log-agent.sh</code>.";
      els["day-list"].appendChild(empty);
      return;
    }

    entries
      .slice()
      .sort(function (a, b) { return (a.time || "").localeCompare(b.time || ""); })
      .forEach(function (e, i) {
        var isGh = (e.source || "agent") === "github";
        var card = document.createElement("article");
        card.className = "entry" + (isGh ? " gh" : "");
        card.style.animationDelay = Math.min(i * 40, 280) + "ms";

        var top = document.createElement("div");
        top.className = "entry-top";
        var model = document.createElement("span");
        if (isGh) {
          model.className = "badge model-gh";
          model.textContent = "gh";
        } else {
          model.className = "badge " + modelKey(e.model);
          model.textContent = e.model || "unknown model";
        }
        var st = document.createElement("span");
        st.className = "status " + (e.status || "wip");
        st.textContent = "● " + (e.status || "wip");
        var time = document.createElement("span");
        time.className = "status";
        time.textContent = e.time || "";
        top.appendChild(model); top.appendChild(st); top.appendChild(time);

        var title = document.createElement("h3");
        title.textContent = (e.repo || "no repo") + (e.agent ? " · " + e.agent : "");

        var task = document.createElement("p");
        task.className = "task";
        task.innerHTML = "";
        var taskLabel = document.createElement("b");
        taskLabel.textContent = isGh
          ? ((e.task || "").indexOf("pull request") !== -1 ? "pull request" : "commit")
          : "task given";
        var taskBody = document.createElement("span");
        taskBody.textContent = e.task || "—";
        task.appendChild(taskLabel); task.appendChild(taskBody);

        var did = document.createElement("p");
        did.className = "did";
        var didLabel = document.createElement("b");
        didLabel.textContent = isGh ? "message" : "what it did";
        var didBody = document.createElement("span");
        didBody.textContent = e.did || "—";
        did.appendChild(didLabel); did.appendChild(didBody);

        var meta = document.createElement("div");
        meta.className = "entry-meta";
        if (e.duration_min != null) meta.appendChild(tag((e.duration_min) + " min"));
        (e.links ? linkTags(e.links) : []).forEach(function (a) { meta.appendChild(a); });

        card.appendChild(top); card.appendChild(title);
        card.appendChild(task); card.appendChild(did); card.appendChild(meta);

        if (e.files_touched && e.files_touched.length) {
          var files = document.createElement("p");
          files.className = "entry-files";
          files.textContent = "touched: " + e.files_touched.join(", ");
          card.appendChild(files);
        }
        els["day-list"].appendChild(card);
      });
  }

  function renderStats() {
    var prefix = toISODate(state.cursor).slice(0, 7);
    var monthEntries = [];
    Object.keys(state.days).forEach(function (k) {
      if (k.slice(0, 7) === prefix) monthEntries = monthEntries.concat(state.days[k].entries || []);
    });
    var sel = state.days[state.selected];
    var selShown = sel ? filterEntries(sel.entries).length : 0;
    els["stat-runs"].textContent = monthEntries.length;
    els["stat-models"].textContent = uniq(monthEntries.map(function (e) { return e.model || "?"; }).filter(function (m) { return m !== "github" && m !== "?"; })).length;
    els["stat-repos"].textContent = uniq(monthEntries.map(function (e) { return e.repo || "?"; })).length;
    els["stat-day"].textContent = selShown;
    document.getElementById("stat-day-label").textContent = "shown on " + state.selected.slice(5);
  }

  function buildFilterOptions() {
    var models = [], repos = [];
    Object.keys(state.days).forEach(function (k) {
      (state.days[k].entries || []).forEach(function (e) {
        if (e.model && e.model !== "github") models.push(e.model);
        if (e.repo) repos.push(e.repo);
      });
    });
    fillSelect(els["filter-model"], uniq(models).sort(), "all models");
    fillSelect(els["filter-repo"], uniq(repos).sort(), "all repos");
  }

  function fillSelect(sel, values, placeholder) {
    var cur = sel.value;
    sel.innerHTML = "";
    var o = document.createElement("option");
    o.value = ""; o.textContent = placeholder;
    sel.appendChild(o);
    values.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = v; opt.textContent = v;
      sel.appendChild(opt);
    });
    sel.value = cur;
  }

  /* ---------- filtering ---------- */
  function filterEntries(entries) {
    var f = state.filters;
    return (entries || []).filter(function (e) {
      if (f.source && (e.source || "agent") !== f.source) return false;
      if (f.model && e.model !== f.model) return false;
      if (f.repo && e.repo !== f.repo) return false;
      if (f.status && (e.status || "") !== f.status) return false;
      if (f.q) {
        var hay = [e.model, e.agent, e.repo, e.task, e.did,
          (e.files_touched || []).join(" "), (e.tags || []).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(f.q) === -1) return false;
      }
      return true;
    });
  }

  /* ---------- helpers ---------- */
  function tag(t) { var s = document.createElement("span"); s.textContent = t; return s; }

  function linkTags(links) {
    var out = [];
    [["commit", "commit"], ["pr", "pr"], ["run", "run"], ["repo", "repo"]].forEach(function (pair) {
      var key = pair[0], label = pair[1];
      if (links[key]) {
        var a = document.createElement("a");
        a.href = links[key]; a.target = "_blank"; a.rel = "noreferrer";
        a.textContent = "↗ " + label;
        out.push(a);
      }
    });
    return out;
  }

  function modelKey(m) {
    m = (m || "").toLowerCase();
    if (m === "github") return "model-gh";
    if (m.indexOf("opus") !== -1) return "model-opus";
    if (m.indexOf("sonnet") !== -1) return "model-sonnet";
    if (m.indexOf("haiku") !== -1) return "model-haiku";
    if (m.indexOf("gpt") !== -1 || m.indexOf("o1") !== -1 || m.indexOf("o3") !== -1) return "model-gpt";
    return "model-other";
  }

  function modelColor(m) {
    var k = modelKey(typeof m === "string" ? m : (m && m.model));
    if (k === "model-gh") return "#d4d4d4";
    if (k === "model-opus") return "#7dd3fc";
    if (k === "model-sonnet") return "#a8d5ad";
    if (k === "model-haiku") return "#e2b882";
    if (k === "model-gpt") return "#d3b8e2";
    return "#525252";
  }

  function uniq(a) { return Array.from(new Set(a)); }
  function toISODate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function isoOf(y, m, d) {
    return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }
  function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
  function parseISO(s) {
    var p = s.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function prettyDate(iso) {
    var d = parseISO(iso);
    return d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }
  function neighborDates(center, span) {
    var out = [];
    for (var i = span; i >= 0; i--) {
      var d = new Date(center.getFullYear(), center.getMonth(), center.getDate() - i);
      out.push(toISODate(d));
    }
    return out;
  }
})();
