/**
 * Baja el catálogo de la aplicación de gestión y lo deja en
 * `src/app/content/catalogo.json`, que se commitea.
 *
 * Es la copia que queda dentro del HTML: gracias a ella cada producto sale con su
 * precio y su ficha en el prerender, sin depender de que el visitante tenga JavaScript
 * ni de que la API conteste en ese momento. Ya en el navegador, `CatalogService` vuelve
 * a pedirla y la refresca (ver `src/app/core/services/catalog.ts`).
 *
 * `npm run build` lo dispara vía `prebuild`, antes del sitemap, que lee este archivo.
 *
 * **Si la API no contesta, no rompe el build**: se queda la copia commiteada y lo avisa.
 * Publicar el sitio con precios de ayer es mucho mejor que no poder publicarlo. Pasa
 * siempre, por ejemplo, en la red de la oficina, que bloquea el dominio.
 *
 *   npm run catalogo
 *   CATALOGO_URL=http://localhost:4300/api/publico/catalogo npm run catalogo
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { POR_CONFIRMAR, PROHIBIDAS } from './afirmaciones.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'src/app/content/catalogo.json');
/**
 * De dónde salió la copia. Lo lee `CatalogService` para refrescarse contra la misma
 * aplicación: así un build local apunta a la API local sin configurar nada aparte, y no
 * pueden acabar desalineados el catálogo que trae el bundle y el que pide el navegador.
 */
const destinoOrigen = join(raiz, 'src/app/content/catalogo-origen.json');
const url = process.env.CATALOGO_URL ?? 'https://gestion.unavezmasmx.com/api/publico/catalogo';
const ESPERA_MS = 15_000;

/** Se queda con lo que hay y sale bien: el build sigue. */
function conservar(motivo) {
  const cuantos = JSON.parse(readFileSync(destino, 'utf8')).productos.length;
  console.warn(`catalogo.json: ${motivo}`);
  console.warn(`catalogo.json: se usa la copia del repositorio (${cuantos} productos).`);
  process.exit(0);
}

/**
 * Lo que `docs/contrato-sitio.md` promete. No se valida por gusto: si la respuesta
 * cambiara de forma, el error sale aquí y no como una pantalla en blanco en producción.
 */
function esProducto(p) {
  return (
    p !== null &&
    typeof p === 'object' &&
    typeof p.slug === 'string' &&
    p.slug.length > 0 &&
    typeof p.nombre === 'string' &&
    typeof p.categoria === 'string' &&
    typeof p.resumen === 'string' &&
    typeof p.descripcion === 'string' &&
    Array.isArray(p.ingredientes) &&
    (p.precio === null || typeof p.precio === 'string') &&
    (p.presentacion === null || typeof p.presentacion === 'string') &&
    ['disponible', 'ultimas_piezas', 'agotado'].includes(p.disponibilidad) &&
    typeof p.imagen?.url === 'string' &&
    typeof p.imagen?.urlChica === 'string' &&
    typeof p.imagen?.alt === 'string' &&
    typeof p.imagen?.esPlaceholder === 'boolean' &&
    esDestacado(p.destacado)
  );
}

/** Su nombre y, si tiene foto, la tarjeta que dibuja en «Nuestras Categorías Dulces». */
function esCategoria(categoria) {
  return (
    categoria !== null &&
    typeof categoria === 'object' &&
    typeof categoria.nombre === 'string' &&
    categoria.nombre.length > 0 &&
    esVitrina(categoria.vitrina)
  );
}

function esVitrina(vitrina) {
  if (vitrina === null) return true;
  return (
    typeof vitrina === 'object' &&
    typeof vitrina.titulo === 'string' &&
    typeof vitrina.insignia === 'string' &&
    typeof vitrina.icono === 'string' &&
    typeof vitrina.descripcion === 'string' &&
    typeof vitrina.cta === 'string' &&
    typeof vitrina.imagen?.url === 'string' &&
    typeof vitrina.imagen?.urlChica === 'string' &&
    typeof vitrina.imagen?.alt === 'string'
  );
}

/** `null`, o los tres textos de su tarjeta en «Los Favoritos de la Casa». */
function esDestacado(destacado) {
  if (destacado === null) return true;
  return (
    typeof destacado === 'object' &&
    typeof destacado.etiqueta === 'string' &&
    typeof destacado.quip === 'string' &&
    typeof destacado.texto === 'string'
  );
}

/** Las fichas ahora se escriben en la aplicación, donde nadie ve el README del sitio. */
function revisarAfirmaciones(productos) {
  const fallos = [];
  const avisos = [];
  for (const p of productos) {
    const texto = `${p.nombre} ${p.resumen} ${p.descripcion} ${p.ingredientes.join(' ')}`;
    for (const [lista, destino] of [
      [PROHIBIDAS, fallos],
      [POR_CONFIRMAR, avisos],
    ]) {
      for (const rx of lista) {
        const m = texto.match(rx);
        if (m) destino.push(`${p.slug}: «${m[0]}»`);
      }
    }
  }
  if (avisos.length) {
    console.warn(`\ncatalogo.json: por confirmar con el proveedor (${avisos.length}):`);
    for (const a of avisos) console.warn(`  · ${a}`);
  }
  if (fallos.length) {
    // Avisa, no detiene: el texto ya está publicado en la aplicación y el sitio no
    // puede hacer nada por él. Se corrige en Productos y se vuelve a publicar.
    console.warn(`\ncatalogo.json: AFIRMACIONES PROHIBIDAS en fichas de la aplicación:`);
    for (const f of fallos) console.warn(`  ✘ ${f}`);
    console.warn('  Corrígelas en Productos. Ver "Cómo hablamos del producto" en el README.\n');
  }
}

let respuesta;
try {
  respuesta = await fetch(url, { signal: AbortSignal.timeout(ESPERA_MS) });
} catch (error) {
  conservar(`no se pudo leer ${url} (${error.message}).`);
}
if (!respuesta.ok) conservar(`${url} respondió ${respuesta.status}.`);

let catalogo;
try {
  catalogo = await respuesta.json();
} catch {
  conservar(`${url} no respondió JSON.`);
}
if (
  catalogo === null ||
  typeof catalogo !== 'object' ||
  !Array.isArray(catalogo.categorias) ||
  !Array.isArray(catalogo.productos)
) {
  conservar('la respuesta no tiene la forma { categorias, productos }.');
}
if (catalogo.categorias.length === 0 || catalogo.productos.length === 0) {
  conservar('la respuesta llegó sin categorías o sin productos.');
}
if (!catalogo.categorias.every((c) => esCategoria(c))) {
  conservar('las categorías no cumplen el contrato.');
}
const malos = catalogo.productos.filter((p) => !esProducto(p));
if (malos.length > 0) {
  conservar(
    `${malos.length} de ${catalogo.productos.length} productos no cumplen el contrato (${malos[0]?.slug ?? '¿sin slug?'}…).`,
  );
}

revisarAfirmaciones(catalogo.productos);
writeFileSync(destino, `${JSON.stringify(catalogo, null, 2)}\n`);
writeFileSync(destinoOrigen, `${JSON.stringify({ url }, null, 2)}\n`);
console.log(
  `catalogo.json: ${catalogo.productos.length} productos y ${catalogo.categorias.length} categorías desde ${url}`,
);
