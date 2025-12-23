import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://www.bcra.gob.ar";
const SEARCH_URL = "https://www.bcra.gob.ar/buscador-de-comunicaciones/";

function todayArgentina() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
      "Accept-Language": "es-AR,es;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} en ${url}`);
  }

  return await res.text();
}

async function fetchBCRAComunicaciones() {
  const fecha = todayArgentina();
  console.log("📅 Fecha:", fecha);

  const html = await fetchHtml(SEARCH_URL);
  const $ = cheerio.load(html);

  const links = new Set();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("/Comunicaciones/")) {
      links.add(href.startsWith("http") ? href : BASE_URL + href);
    }
  });

  console.log("🔗 Links encontrados:", links.size);

  const results = [];

  for (const link of links) {
    try {
      const detail = await fetchHtml(link);
      const $$ = cheerio.load(detail);

      const titulo =
        $$("h1").first().text().trim() ||
        $$("title").text().trim();

      const contenido = $$("article").text().trim();

      if (!titulo || !contenido) continue;

      results.push({
        fecha,
        titulo,
        contenido,
        link,
