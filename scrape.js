import * as cheerio from "cheerio";

const BASE_URL = "https://www.bcra.gob.ar";

const res = await fetch("https://www.bcra.gob.ar/buscador-de-comunicaciones/", {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
    "Accept-Language": "es-AR,es;q=0.9",
  },
});

const html = await res.text();
const $ = cheerio.load(html);

const links = [];

$("a[href]").each((_, el) => {
  const href = $(el).attr("href");

  if (
    href &&
    href.includes("/Comunicaciones/") &&
    !links.includes(href)
  ) {
    links.push(href.startsWith("http") ? href : BASE_URL + href);
  }
});

console.log("📄 Comunicaciones detectadas:", links.length);
console.log("🔗 Primeros links:");
links.slice(0, 5).forEach((l) => console.log(" -", l));
