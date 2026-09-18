/**
 * Revisa que no reaparezcan afirmaciones falsas sobre el producto.
 *
 * El producto lo surte un proveedor y la producción es industrial: el sitio no
 * puede decir que Una vez más lo elabora. Ver "Cómo hablamos del producto" en
 * el README.
 *
 * Normaliza los espacios antes de buscar, porque Prettier parte las frases
 * entre líneas ("Hecho a\n  mano en México") y un grep normal no las encuentra:
 * así se escondieron dos veces.
 *
 *   node scripts/revisar-afirmaciones.mjs          revisa src/
 *   node scripts/revisar-afirmaciones.mjs dist     revisa el HTML compilado
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const PROHIBIDAS = [
  /artesanal(es|mente)?/i,
  /hechos? a mano/i,
  /hornead[ao]s?/i,
  /elaborad[ao]s?|elaboram/i,
  /tostam|tostando|comales/i,
  /honramos|transformam/i,
  /hech[oa]s con dedicaci/i,
  /preparam|te los prepar/i,
  /comercio justo/i,
  /sin intermediarios/i,
  /producci[oó]n 100%/i,
  /nuestra cosecha/i,
];

/** Ciertas o no según la ficha del proveedor: sólo avisa. */
const POR_CONFIRMAR = [
  /miel de campo[^.<]{0,25}pura/i,
  /al 70%/i,
  /100% Mexicano/i,
  /Siembra local/i,
  /Origen campesino local/i,
  /Jarabe artificial/i,
  /Hecho fresco bajo pedido/i,
  /Hecho con miel/i,
];

const raiz = process.argv[2] === 'dist' ? 'dist/una_vez_mas_web_site/browser' : 'src';
const EXT = process.argv[2] === 'dist' ? ['.html'] : ['.html', '.ts', '.json'];

function* archivos(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* archivos(p);
    else if (EXT.some((e) => p.endsWith(e))) yield p;
  }
}

const fallos = [];
const avisos = [];
for (const f of archivos(raiz)) {
  const plano = readFileSync(f, 'utf8').replace(/\s+/g, ' ');
  const sinEtiquetas = plano.replace(/<[^>]*>/g, ' ');
  for (const [lista, destino] of [
    [PROHIBIDAS, fallos],
    [POR_CONFIRMAR, avisos],
  ]) {
    for (const rx of lista) {
      const m = sinEtiquetas.match(rx);
      if (m) destino.push(`${relative('.', f)}: «${m[0]}»`);
    }
  }
}

if (avisos.length) {
  console.log(`\nPor confirmar con el proveedor (${avisos.length}):`);
  for (const a of avisos) console.log(`  · ${a}`);
}
if (fallos.length) {
  console.error(`\nAfirmaciones prohibidas (${fallos.length}):`);
  for (const f of fallos) console.error(`  ✘ ${f}`);
  console.error('\nVer "Cómo hablamos del producto" en el README.\n');
  process.exit(1);
}
console.log(`\nSin afirmaciones prohibidas en ${raiz}/\n`);
