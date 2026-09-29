/**
 * Genera public/sitemap.xml a partir de las rutas reales y del catálogo que bajó
 * `generar-catalogo.mjs`, para que no se desincronice cuando la aplicación publique o
 * retire un producto. Se ejecuta solo: npm run build lo dispara vía `prebuild`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (p) => JSON.parse(readFileSync(join(raiz, p), 'utf8'));

const { url: base } = leer('src/app/content/site.json');
const { productos } = leer('src/app/content/catalogo.json');

const rutas = [
  { ruta: '/inicio', prioridad: '1.0', frecuencia: 'weekly' },
  { ruta: '/catalogo', prioridad: '0.9', frecuencia: 'weekly' },
  ...productos.map((p) => ({
    ruta: `/catalogo/${p.slug}`,
    prioridad: '0.8',
    frecuencia: 'monthly',
  })),
  { ruta: '/nosotros', prioridad: '0.6', frecuencia: 'monthly' },
  { ruta: '/contacto', prioridad: '0.7', frecuencia: 'monthly' },
  { ruta: '/enlaces', prioridad: '0.5', frecuencia: 'monthly' },
];

const hoy = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas
  .map(
    ({ ruta, prioridad, frecuencia }) => `  <url>
    <loc>${base}${ruta}</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>${frecuencia}</changefreq>
    <priority>${prioridad}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(raiz, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml: ${rutas.length} rutas`);
