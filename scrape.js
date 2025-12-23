import * as cheerio from "cheerio";

const URL = "https://www.bcra.gob.ar/Comunicaciones/";

const res = await fetch(URL, {
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
    href.match(/^\/Comunicaciones\/[A-Z]/) &&
    !href.endsWith(".pdf")
  ) {
    links.push("https://www.bcra.gob.ar" + href);
  }
});

console.log("📄 Comunicaciones encontradas:", links.length);
links.slice(0, 10).forEach((l) => console.log(" -", l));
