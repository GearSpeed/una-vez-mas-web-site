/**
 * Punto único de carga del contenido.
 *
 * Dos orígenes, y conviene no confundirlos:
 *
 * - **El catálogo** (`catalogo.json`) lo manda la aplicación de gestión. Este archivo es
 *   la copia que `scripts/generar-catalogo.mjs` baja al construir, y que el navegador
 *   vuelve a pedir en cuanto carga la página (ver `core/services/catalog.ts`). No se
 *   edita a mano: lo que se escriba aquí se pierde en el siguiente build.
 * - **Lo demás** (destacados, vitrinas, FAQ, enlaces, datos del sitio) es maquetado y sí
 *   vive en este repositorio.
 *
 * Los JSON se compilan dentro del bundle, así que asignarlos a los tipos del dominio
 * hace que un campo faltante o mal escrito **rompa el build**. Lo que TypeScript no
 * puede comprobar solo son las uniones de cadena (`tono`, `estilo`, `disponibilidad`),
 * porque de un JSON infiere `string`: esas se estrechan aquí con un guard que lanza
 * durante el prerender si trae un valor desconocido.
 */
import type { Categoria, Disponibilidad, Producto } from '../core/models/producto';
import type { Enlace, Faq, Sitio } from '../core/models/contenido';

import catalogoJson from './catalogo.json';
import catalogoOrigenJson from './catalogo-origen.json';
import faqJson from './faq.json';
import linksJson from './links.json';
import siteJson from './site.json';

const ESTILOS: readonly Enlace['estilo'][] = ['destacado', 'whatsapp', 'normal'];
const DISPONIBILIDADES: readonly Disponibilidad[] = ['disponible', 'ultimas_piezas', 'agotado'];

function unaDe<T extends string>(valores: readonly T[], valor: string, campo: string): T {
  if ((valores as readonly string[]).includes(valor)) return valor as T;
  throw new Error(`Contenido inválido: ${campo} = "${valor}". Se esperaba ${valores.join(' | ')}.`);
}

/* Las formas "crudas": iguales al dominio salvo las uniones, que llegan como string. */
type Crudo<T, K extends keyof T> = Omit<T, K> & { [P in K]: string };

const productosCrudos: readonly Crudo<Producto, 'disponibilidad'>[] = catalogoJson.productos;
const enlacesCrudos: readonly Crudo<Enlace, 'estilo'>[] = linksJson;

/** La API contra la que se compiló esta copia, y contra la que el sitio se refresca. */
export const ORIGEN_CATALOGO: string = catalogoOrigenJson.url;

/**
 * Las familias del catálogo, en el orden en que las manda la aplicación, cada una con la
 * tarjeta que le toca en Inicio (o `null` si no tiene foto). **No se deducen de los
 * productos**: una categoría recién dada de alta todavía no tiene ninguno, y el sitio la
 * anuncia igual.
 */
export const CATEGORIAS: readonly Categoria[] = catalogoJson.categorias;

/** La copia del catálogo que trae el bundle: con lo que arranca el sitio. */
export const PRODUCTOS: readonly Producto[] = productosCrudos.map((p) => ({
  ...p,
  disponibilidad: unaDe(
    DISPONIBILIDADES,
    p.disponibilidad,
    `catalogo.json[${p.slug}].disponibilidad`,
  ),
}));

export const ENLACES: readonly Enlace[] = enlacesCrudos.map((e) => ({
  ...e,
  estilo: unaDe(ESTILOS, e.estilo, `links.json[${e.id}].estilo`),
}));

export const FAQS: readonly Faq[] = faqJson;
export const SITIO: Sitio = siteJson;
