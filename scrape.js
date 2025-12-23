import { chromium } from "playwright";
import fs from "fs";

const URL = "https://www.bcra.gob.ar/buscador-de-comunicaciones/";

function hoy() {
  const d = new Date();
  return d.toLocaleDateString("es-AR");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("🌐 Abriendo sitio...");
  await page.goto(URL, { waitUntil: "networkidle" });

  const fecha = hoy();
  console.log("📅 Fecha:", fecha);

  // Completar fechas
  await page.fill('input[name="desde"]', fecha);
  await page.fill('input[name="hasta"]', fecha);

  // Click buscar
  await page.click("button:has-text('Buscar')");

  // Esperar resultados
  await page.waitForTimeout(4000);

  const comunicaciones = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll("article, .resultado, li").forEach(el => {
      const titulo = el.querySelector("a")?.innerText?.trim();
      const link = el.querySelector("a")?.href;
      const texto = el.innerText?.trim();

      if (titulo && link) {
        items.push({ titulo, link, texto });
      }
    });
    return items;
  });

  console.log(`📄 Comunicaciones encontradas: ${comunicaciones.length}`);

  fs.writeFileSync("output.json", JSON.stringify(comunicaciones, null, 2));
  console.log("✅ output.json generado");

  await browser.close();
})();
