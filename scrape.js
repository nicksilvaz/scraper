import { chromium } from "playwright";
import fs from "fs";

const URL = "https://www.bcra.gob.ar/buscador-de-comunicaciones/";

function hoy() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("🌐 Abriendo sitio...");
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  // Esperar que existan formularios
  await page.waitForSelector('form[name="fecha"]', { timeout: 30000 });

  const fecha = hoy();
  console.log("📅 Fecha:", fecha);

  // Tomar el formulario "Por fecha"
  const formFecha = page.locator('form[name="fecha"]');

  // Tomar inputs de ese formulario
  const inputs = await formFecha.locator("input").all();

  if (inputs.length < 2) {
    throw new Error("No se encontraron inputs de fecha");
  }

  // Desde
  await inputs[0].click({ clickCount: 3 });
  await inputs[0].type(fecha, { delay: 50 });

  // Hasta
  await inputs[1].click({ clickCount: 3 });
  await inputs[1].type(fecha, { delay: 50 });

  // Click en el botón Buscar DEL FORM POR FECHA
  await formFecha.getByRole("button", { name: "Buscar" }).click();

  // Esperar que carguen resultados
  await page.waitForTimeout(6000);

  const comunicaciones = await page.evaluate(() => {
    const results = [];

    document.querySelectorAll("a[href*='Comunicaciones']").forEach(a => {
      const titulo = a.innerText.trim();
      const link = a.href;

      if (titulo && titulo.length > 10) {
        results.push({ titulo, link });
      }
    });

    return results;
  });

  console.log(`📄 Comunicaciones encontradas: ${comunicaciones.length}`);

  fs.writeFileSync("output.json", JSON.stringify(comunicaciones, null, 2));
  console.log("✅ output.json generado");

  await browser.close();
})();
