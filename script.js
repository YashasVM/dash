document.documentElement.classList.add("js");
requestAnimationFrame(() => {
  document.documentElement.classList.add("is-ready");
});

const projectLinks = [
  {
    name: "LocalHost",
    website: "https://yvmx.dpdns.org/",
    status: true,
  },
  {
    name: "openstream",
    website: "https://openstream.pages.dev",
    github: "https://github.com/YashasVM/OpenStream",
  },
  {
    name: "Holen",
    website: "https://holen.yvmx.dpdns.org/",
    github: "https://github.com/YashasVM/HOLEN",
  },
  {
    name: "wisper-low",
    website: "https://wisperlow.pages.dev/",
    github: "https://github.com/YashasVM/Wisper-Low",
  },
  {
    name: "cd",
    website: "https://cd.yvm.workers.dev/",
    github: "https://github.com/YashasVM/cd",
  },
  {
    name: "yt-cmd",
    github: "https://github.com/YashasVM/yt-cmd",
  },
  {
    name: "img-gen",
    website: "https://img00.pages.dev/",
    github: "https://github.com/YashasVM/Img-gen",
  },
];

const list = document.querySelector("#project-list");

function renderLinks() {
  list.innerHTML = "";

  projectLinks.forEach((link, index) => {
    const item = document.createElement("article");
    item.className = "project-item";
    item.style.setProperty("--index", index);

    const titleLink = document.createElement("a");
    titleLink.className = "project-link";
    titleLink.href = link.website ?? link.github;
    titleLink.target = "_blank";
    titleLink.rel = "noreferrer";
    titleLink.setAttribute(
      "aria-label",
      `${link.name} ${link.website ? "website" : "GitHub"}`
    );

    const title = document.createElement("span");
    title.className = "project-title";

    const name = document.createElement("strong");
    name.textContent = link.name;

    title.append(name);
    titleLink.append(title);

    const actions = document.createElement("span");
    actions.className = "project-actions";
    let status;

    if (link.status) {
      status = document.createElement("span");
      status.className = "project-status";
      status.textContent = "checking";
      status.setAttribute("aria-live", "polite");
      status.tabIndex = 0;
      checkLocalHostStatus(status);
    }

    [
      ["site", link.website],
      ["gh", link.github],
    ].forEach(([label, url]) => {
      if (!url) return;

      const anchor = document.createElement("a");
      anchor.className = "project-link";
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.textContent = label;
      anchor.setAttribute("aria-label", `${link.name} ${label === "gh" ? "GitHub" : "website"}`);
      actions.append(anchor);
    });

    item.append(titleLink);
    if (status) item.append(status);
    item.append(actions);
    list.append(item);
  });
}

async function checkLocalHostStatus(status) {
  try {
    const response = await fetch("/api/localhost-status", { cache: "no-store" });
    const result = await response.json();
    const offline = result.services.filter((service) => !service.live).map((service) => service.name);
    status.className = `project-status ${offline.length ? "offline" : "online"}`;
    status.textContent = `${result.online}/${result.total} online`;
    status.dataset.tooltip = offline.length ? `Offline: ${offline.join(", ")}` : "All services online";
    status.title = status.dataset.tooltip;
  } catch {
    status.className = "project-status offline";
    status.textContent = "offline";
    status.dataset.tooltip = "Status check unavailable";
    status.title = status.dataset.tooltip;
  }
}

renderLinks();
