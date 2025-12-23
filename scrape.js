import fs from "fs";
import fetch from "node-fetch";
import cheerio from "cheerio";

const URL_BUSCADOR = "https://www.bcra.gob.ar/buscador-de-comunicaciones/";

function hoy() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log("Scrapeando BCRA…");

  const res = await fetch(URL_BUSCADOR, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const comunicaciones = [];

  $("a").each((_, a) => {
    const href = $(a).attr("href") || "";
    const titulo = $(a).text().trim();

    if (
      href.includes("/Comunicaciones/") &&
      titulo.toLowerCase().includes("comunicación")
    ) {
      comunicaciones.push({
        titulo,
        url: href.startsWith("http")
          ? href
          : "https://www.bcra.gob.ar" + href
      });
    }
  });

  const resultados = [];

  for (const c of comunicaciones) {
    console.log("Leyendo:", c.titulo);

    const r = await fetch(c.url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!r.ok) continue;

    const detalleHtml = await r.text();
    const $$ = cheerio.load(detalleHtml);

    const contenido = $$(".contenido, .entry-content")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    resultados.push({
      fecha: hoy(),
      titulo: c.titulo,
      contenido,
      url: c.url
    });
  }

  fs.writeFileSync(
    "output.json",
    JSON.stringify(resultados, null, 2),
    "utf8"
  );

  console.log(`OK – ${resultados.length} comunicaciones`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
