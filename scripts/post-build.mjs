/**
 * Pasos posteriores al build, para el despliegue en Cloudflare Pages.
 *
 * Cloudflare sirve `404.html` cuando una ruta no existe. Angular ya emite
 * `index.csr.html`, que es su cascarón de cliente; al copiarlo como 404.html,
 * una URL inventada responde con status 404 (lo correcto para buscadores) y
 * el router de Angular resuelve la ruta comodín mostrando nuestra página
 * "Aquí no hay antojitos" en lugar del 404 genérico de Cloudflare.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const salida = join(raiz, 'dist/una_vez_mas_web_site/browser');
const origen = join(salida, 'index.csr.html');
const destino = join(salida, '404.html');

if (!existsSync(origen)) {
  console.error(`post-build: no encontré ${origen}. ¿Corrió "ng build" con outputMode static?`);
  process.exit(1);
}

copyFileSync(origen, destino);
console.log('post-build: 404.html listo (copia de index.csr.html)');
