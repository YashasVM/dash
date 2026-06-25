document.documentElement.classList.add("js");
requestAnimationFrame(() => {
  document.documentElement.classList.add("is-ready");
});

const projectLinks = [
  { name: "openstream", url: "https://openstream.pages.dev" },
  { name: "Holen", url: "https://holen.yvmx.dpdns.org/" },
  { name: "wisper-low", url: "https://github.com/YashasVM/Wisper-Low" },
  { name: "yt-cmd", url: "https://github.com/YashasVM/yt-cmd" },
  { name: "cd", url: "https://cd.yvm.workers.dev/" },
  { name: "img-gen", url: "https://img00.pages.dev/" },
];

const list = document.querySelector("#project-list");

function renderLinks() {
  list.innerHTML = "";

  projectLinks.forEach((link, index) => {
    const item = document.createElement("article");
    item.className = "project-item";
    item.style.setProperty("--index", index);

    const anchor = document.createElement("a");
    anchor.className = "project-link";
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";

    const title = document.createElement("span");
    title.className = "project-title";

    const name = document.createElement("strong");
    name.textContent = link.name;

    title.append(name);
    anchor.append(title);
    item.append(anchor);
    list.append(item);
  });
}

renderLinks();
