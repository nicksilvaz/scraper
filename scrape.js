const res = await fetch("https://www.bcra.gob.ar/buscador-de-comunicaciones/", {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
    "Accept-Language": "es-AR,es;q=0.9",
  },
});

const html = await res.text();

console.log("HTML recibido, largo:", html.length);
console.log(html.slice(0, 300));
