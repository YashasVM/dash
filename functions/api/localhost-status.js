const services = ["immich", "beszel", "holen"];

export async function onRequestGet() {
  const results = await Promise.all(
    services.map(async (name) => {
      try {
        const response = await fetch(`https://yvmx.dpdns.org/health/${name}`, {
          cf: { cacheTtl: 0 },
        });
        const result = await response.json();
        return { name, live: result.live === true };
      } catch {
        return { name, live: false };
      }
    })
  );

  return Response.json(
    {
      online: results.filter((service) => service.live).length,
      total: results.length,
      services: results,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
