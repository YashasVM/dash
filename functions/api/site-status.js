const sites = [
  { id: "cd", url: "https://cd.yash0.in/" },
  { id: "holen", url: "https://holen.yash0.in/" },
  { id: "wisper-low", url: "https://wisper-low.yash0.in/" },
  { id: "openstream", url: "https://openstream.yash0.in/" },
  { id: "img-gen", url: "https://img-gen.yash0.in/" },
  { id: "localhost", url: "https://yvmx.dpdns.org/" },
];

async function check(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, { method: "HEAD", redirect: "manual", signal: controller.signal });
    clearTimeout(timer);
    return response.status < 500;
  } catch {
    return false;
  }
}

export async function onRequestGet() {
  const results = await Promise.all(
    sites.map(async (site) => ({ id: site.id, live: await check(site.url) }))
  );
  return Response.json(
    { checkedAt: new Date().toISOString(), sites: results },
    { headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } }
  );
}
