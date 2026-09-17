/**
 * Punto único de carga del contenido.
 *
 * Los JSON se compilan dentro del bundle, así que asignarlos a los tipos del
 * dominio hace que un campo faltante o mal escrito **rompa el build**. Lo que
 * TypeScript no puede comprobar solo son las uniones de cadena (`categoria`,
 * `tono`, `estilo`), porque de un JSON infiere `string`: esas se estrechan aquí
 * con un guard que lanza durante el prerender si trae un valor desconocido.
 *
 * Para editar precios basta tocar `products.json` y volver a compilar.
 */
import type { Categoria, Destacado, Producto, Tono, Vitrina } from '../core/models/producto';
import { CATEGORIAS } from '../core/models/producto';
import type { Enlace, Faq, Sitio } from '../core/models/contenido';

import productsJson from './products.json';
import featuredJson from './featured.json';
import showcaseJson from './showcase.json';
import faqJson from './faq.json';
import linksJson from './links.json';
import siteJson from './site.json';

const TONOS: readonly Tono[] = ['primary', 'secondary', 'tertiary'];
const ESTILOS: readonly Enlace['estilo'][] = ['destacado', 'whatsapp', 'normal'];

function unaDe<T extends string>(valores: readonly T[], valor: string, campo: string): T {
  if ((valores as readonly string[]).includes(valor)) return valor as T;
  throw new Error(`Contenido inválido: ${campo} = "${valor}". Se esperaba ${valores.join(' | ')}.`);
}

/* Las formas "crudas": iguales al dominio salvo las uniones, que llegan como string. */
type Crudo<T, K extends keyof T> = Omit<T, K> & { [P in K]: string };

const productosCrudos: readonly Crudo<Producto, 'categoria'>[] = productsJson;
const destacadosCrudos: readonly Crudo<Destacado, 'etiquetaTono'>[] = featuredJson;
const vitrinasCrudas: readonly Crudo<Vitrina, 'categoria' | 'tono'>[] = showcaseJson;
const enlacesCrudos: readonly Crudo<Enlace, 'estilo'>[] = linksJson;

export const PRODUCTOS: readonly Producto[] = productosCrudos.map((p) => ({
  ...p,
  categoria: unaDe(CATEGORIAS, p.categoria, `products.json[${p.id}].categoria`),
}));

export const DESTACADOS: readonly Destacado[] = destacadosCrudos.map((d) => ({
  ...d,
  etiquetaTono: unaDe(TONOS, d.etiquetaTono, `featured.json[${d.productoId}].etiquetaTono`),
}));

export const VITRINAS: readonly Vitrina[] = vitrinasCrudas.map((v) => ({
  ...v,
  categoria: unaDe(CATEGORIAS, v.categoria, `showcase.json[${v.titulo}].categoria`),
  tono: unaDe(TONOS, v.tono, `showcase.json[${v.titulo}].tono`),
}));

export const ENLACES: readonly Enlace[] = enlacesCrudos.map((e) => ({
  ...e,
  estilo: unaDe(ESTILOS, e.estilo, `links.json[${e.id}].estilo`),
}));

export const FAQS: readonly Faq[] = faqJson;
export const SITIO: Sitio = siteJson;

/** Todo destacado debe apuntar a un producto real del catálogo. */
for (const d of DESTACADOS) {
  if (!PRODUCTOS.some((p) => p.id === d.productoId)) {
    throw new Error(`featured.json: "${d.productoId}" no existe en products.json`);
  }
}
