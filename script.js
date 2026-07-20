document.documentElement.classList.add("js");
requestAnimationFrame(() => {
  document.documentElement.classList.add("is-ready");
});

const projectLinks = [
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

    item.append(titleLink, actions);
    list.append(item);
  });
}

renderLinks();
