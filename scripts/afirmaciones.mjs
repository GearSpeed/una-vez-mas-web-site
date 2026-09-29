/**
 * Las frases que el sitio no puede decir, y las que conviene mirar dos veces.
 *
 * Viven aparte porque las usan dos scripts: `revisar-afirmaciones.mjs`, que peina el
 * repositorio y el HTML compilado, y `generar-catalogo.mjs`, que revisa las fichas que
 * bajan de la aplicación. Ahora que los textos de producto se escriben allá, nadie se va
 * a acordar de esta regla mientras captura una ficha.
 *
 * El porqué de cada una está en "Cómo hablamos del producto" del README.
 */
export const PROHIBIDAS = [
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
export const POR_CONFIRMAR = [
  // "miel" a secas se entiende como miel de abeja; el endulzante es piloncillo
  /\bmiel\b(?!\s+\w*\s*(de\s+)?piloncillo)/i,
  // Afirmaciones de salud sobre un dulce: la NOM-051 las acota, y un producto con
  // piloncillo llevaría sello de exceso de azúcares. Lo nutritivo se le atribuye al
  // grano de amaranto, no al dulce terminado.
  /saludable|\bsanos?\b|nutritiv[oa]s?|\blight\b|sin az[úu]car/i,
];
