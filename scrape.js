import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://www.bcra.gob.ar";
const SEARCH_URL = "https://www.bcra.gob.ar/buscador-de-comunicaciones/";

function todayArgentina() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
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
    throw new Error(`Error ${res.status} al acceder a ${url}`);
  }

  return await res.text();
}

async function fetchBCRAComunicaciones() {
  const fecha = todayArgentina();
  console.log("📅 Buscando comunicaciones del:", fecha);

  // El buscador carga resultados en la misma URL con POST,
  // pero el HTML final incluye los links renderizados
  const html = await fetchHtml(SEARCH_URL);
  const $ = cheerio.load(html);

  const links = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (
      href &&
      href.includes("/Comunicaciones/") &&
      !links.includes(href)
    ) {
      links.push(href.startsWith("http") ? href : BASE_URL + href);
    }
  });

  console.log(`🔗 Comunicaciones encontradas: ${links.length}`);

  const results = [];

  for (const link of links) {
    try {
      const detailHtml = await fetchHtml(link);
      const $$ = cheerio.load(detailHtml);

      const titulo =
        $$("h1").first().text().trim() ||
        $$("title").text().trim();

      const contenido = $$("article").text().trim();

      if (!titulo || !contenido) continue;

      results.push({
        fecha,
