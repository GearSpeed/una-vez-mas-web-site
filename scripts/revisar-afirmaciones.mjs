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

  // Descartadas al confirmar con el proveedor (producción industrial, endulzado
  // con piloncillo y no con miel de abeja):
  /al 70%/i,
  /miel de campo/i,
  /flor silvestre/i,
  /miel (pura |virgen )?de abeja/i,
  /siembra (local|limpia)/i,
  /origen campesino/i,
  /jarabe artificial/i,
  /sin conservadores/i,
  /hecho fresco/i,

  // Verbos de producción y posesión del cultivo que se escaparon de las primeras
  // pasadas: conviene el patrón amplio, no la frase exacta.
  /cosecham|sembram|cultivam|amasam|horneam|cocinam|endulzam|mezclam|freím/i,
  // Ojo: "nuestra tierra" en singular es el modismo de "nuestro país" y es válido;
  // aquí sólo van las formas que implican ser dueño del cultivo.
  /nuestras tierras|nuestros cultivos|nuestra (parcela|siembra|cosecha)/i,
  /nuestro (comal|taller|obrador|horno)/i,
];

/**
 * Vigiladas: no son falsas, pero conviene verlas si alguien las mueve.
 * "100% Mexicano" está confirmada como verdadera y por eso no aparece aquí.
 */
const POR_CONFIRMAR = [
  // "miel" a secas se entiende como miel de abeja; el endulzante es piloncillo
  /\bmiel\b(?!\s+\w*\s*(de\s+)?piloncillo)/i,
  // Afirmaciones de salud sobre un dulce: la NOM-051 las acota, y un producto con
  // piloncillo llevaría sello de exceso de azúcares. Lo nutritivo se le atribuye al
  // grano de amaranto, no al dulce terminado.
  /saludable|\bsanos?\b|nutritiv[oa]s?|\blight\b|sin az[úu]car/i,
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
