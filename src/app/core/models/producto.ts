/**
 * El catálogo lo manda la aplicación de gestión, no este repositorio: el contrato
 * completo está en `docs/contrato-sitio.md` de `una_vez_mas_gestion`. Aquí sólo se
 * describe lo que llega. Lo único que decide el sitio es el color de cada tarjeta.
 */

/**
 * Una familia del catálogo. Ya no es una lista cerrada: las categorías se dan de alta en
 * la aplicación, y el sitio pinta las que lleguen.
 */
export interface Categoria {
  /** Con el que se filtra el catálogo. Es el `categoria` de cada producto. */
  readonly nombre: string;
  /** Su tarjeta en Inicio, o `null` si no tiene foto: sin foto no hay tarjeta. */
  readonly vitrina: Vitrina | null;
  /**
   * Escalones de su descuento por llevar cantidad, de menor a mayor piezas. Vacío: no
   * tiene. Las piezas se cuentan sumando toda la categoría, no por producto. Ver
   * `avisoDescuento()`.
   */
  readonly descuentoVolumen: readonly EscalonDescuento[];
}

/** Un escalón del descuento por volumen de una categoría. */
export interface EscalonDescuento {
  /** Piezas de la categoría a partir de las cuales entra este escalón. */
  readonly desde: number;
  /** Proporción cruda: `"0.1000"` = 10 %. Ver `avisoDescuento()`. */
  readonly tasa: string;
}

/** Tono de la píldora de categoría, según el design system. */
export type Tono = 'primary' | 'secondary' | 'tertiary';

/**
 * Los tres tonos, en el orden en que se reparten entre las tarjetas de portada: el color
 * sale del lugar que ocupa cada una, para que nunca queden cuatro iguales.
 */
export const TONOS: readonly Tono[] = ['primary', 'secondary', 'tertiary'];

/** Si hay, si quedan pocas o si se acabó. El número exacto no sale del negocio. */
export type Disponibilidad = 'disponible' | 'ultimas_piezas' | 'agotado';

/** Una foto servida por el bucket, en sus dos tamaños. */
export interface Imagen {
  /** 1200 px, para el detalle. Absoluta: el dominio lo decide la aplicación. */
  readonly url: string;
  /** 600 px, para la tarjeta. */
  readonly urlChica: string;
  readonly alt: string;
}

/**
 * La de un producto, que **siempre llega**: sin foto propia, la aplicación manda el logo
 * y lo dice. La de una categoría no lleva esto, porque ahí no hay relleno: sin foto
 * simplemente no hay tarjeta.
 */
export interface ImagenDeProducto extends Imagen {
  /** `true` cuando es el logo de relleno y no una foto del producto. */
  readonly esPlaceholder: boolean;
}

/**
 * Lo que le toca escribir a la portada. El nombre, la foto, el precio y la
 * disponibilidad de la tarjeta salen del propio producto, para que no puedan
 * contradecirse con el catálogo.
 */
export interface Destacado {
  /** La píldora de la esquina: «Clásico», «Para el café». */
  readonly etiqueta: string;
  /** El guiño junto a la estrellita: «El favorito de Ami». */
  readonly quip: string;
  /** Ya resuelto por la API: si no se capturó, es el `resumen` del producto. */
  readonly texto: string;
}

export interface Producto {
  /** Slug; es también el segmento de URL en /catalogo/:slug. */
  readonly slug: string;
  readonly nombre: string;
  /** El `nombre` de una de las categorías del catálogo. */
  readonly categoria: string;
  /** Presentación o gramaje. `null` si aún no se define. */
  readonly presentacion: string | null;
  /** Una o dos líneas para la tarjeta del catálogo. Vacío: la tarjeta no lo pinta. */
  readonly resumen: string;
  /** Párrafo completo para la vista de detalle. Vacío: no se pinta. */
  readonly descripcion: string;
  /** Ingredientes destacados, en el orden en que se capturaron. */
  readonly ingredientes: readonly string[];
  /**
   * Precio en MXN **como texto decimal** (`"30.00"`), para que no se pierdan centavos
   * al convertirlo. `null` se muestra como "Consulta precio". Ver `precioVisible()`.
   */
  readonly precio: string | null;
  readonly disponibilidad: Disponibilidad;
  readonly imagen: ImagenDeProducto;
  /** Sus textos en «Los Favoritos de la Casa», o `null` si no sale en la portada. */
  readonly destacado: Destacado | null;
}

/** Una tarjeta de «Nuestras Categorías Dulces» en Inicio. El color lo pone el sitio. */
export interface Vitrina {
  /** Ya resuelto por la API: si no se capturó, es el nombre de la categoría. */
  readonly titulo: string;
  /** La píldora. Vacía: no se pinta. */
  readonly insignia: string;
  /** El ícono de Material Symbols que la acompaña. Vacío: no se pinta. */
  readonly icono: string;
  readonly descripcion: string;
  /** Ya resuelto: si no se capturó, es «Ver {nombre}». */
  readonly cta: string;
  /**
   * Su foto propia, cuando alguien le subió una para dejarla fija. **`null` es lo normal
   * y significa «sácala de sus productos»**: ahí el sitio sortea una, y por eso la
   * portada cambia un poco en cada visita.
   */
  readonly imagen: Imagen | null;
}

/**
 * El mensaje que se precarga en WhatsApp. Se arma con el nombre en vez de guardarse
 * producto por producto: es la misma frase para los nueve que había escritos a mano, y
 * así un producto nuevo de la aplicación ya llega con el suyo.
 */
export function waTextoDe(producto: Producto): string {
  return `Hola, vi ${producto.nombre} en el catálogo de Una vez más y me gustaría recibir información`;
}

/**
 * El precio llega como `"30.00"`. Se pintan los centavos sólo cuando los hay, que es
 * como se lee el precio de mostrador.
 *
 * Un cero **no se muestra**: sale «Consulta precio». Un producto en $0 es una captura a
 * medias o un dedazo, y anunciarlo así obligaría a respetar ese precio. La aplicación ya
 * no lo manda (ver `precioPublicable` en la API), pero la regla se repite aquí porque el
 * sitio también pinta la copia del catálogo, que puede traer datos de otro momento.
 */
export function precioVisible(precio: string | null): string | null {
  if (precio === null || Number(precio) <= 0) return null;
  return precio.replace(/\.00$/, '');
}

/** Lo que se anuncia en la tarjeta. Que algo esté disponible no hace falta decirlo. */
export function avisoDisponibilidad(disponibilidad: Disponibilidad): string | null {
  switch (disponibilidad) {
    case 'agotado':
      return 'Agotado';
    case 'ultimas_piezas':
      return 'Últimas piezas';
    default:
      return null;
  }
}

/**
 * El texto de la etiqueta de descuento de una categoría: «10% desde 6 piezas» o, con los
 * dos escalones activos, «10% desde 6 piezas · 15% desde 12». Sin escalones, `null`: que
 * no hay descuento no hace falta decirlo.
 */
export function avisoDescuento(escalones: readonly EscalonDescuento[]): string | null {
  if (escalones.length === 0) return null;
  return escalones
    .map((escalon, i) => {
      const porcentaje = Math.round(Number(escalon.tasa) * 100);
      return i === 0
        ? `${porcentaje}% desde ${escalon.desde} piezas`
        : `${porcentaje}% desde ${escalon.desde}`;
    })
    .join(' · ');
}
