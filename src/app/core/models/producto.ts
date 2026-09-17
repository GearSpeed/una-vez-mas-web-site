/** Las tres familias del catálogo. Coincide con las etiquetas visibles. */
export type Categoria = 'Galletas' | 'Borrachitos' | 'Alegrías';

export const CATEGORIAS: readonly Categoria[] = ['Galletas', 'Borrachitos', 'Alegrías'];

/** Tono de la píldora de categoría, según el design system. */
export type Tono = 'primary' | 'secondary' | 'tertiary';

export interface Producto {
  /** Slug; es también el segmento de URL en /catalogo/:id. */
  readonly id: string;
  readonly nombre: string;
  readonly categoria: Categoria;
  /** Una o dos líneas para la tarjeta del catálogo. */
  readonly resumen: string;
  /** Párrafo completo para la vista de detalle. */
  readonly descripcion: string;
  readonly ingredientes: string;
  /** Ruta relativa a /img. */
  readonly imagen: string;
  readonly alt: string;
  /** Precio en MXN. `null` se muestra como "Consulta precio". */
  readonly precio: number | null;
  /** Presentación o gramaje. `null` si aún no se define. */
  readonly presentacion: string | null;
  /** Mensaje que se precarga en WhatsApp, en texto plano. */
  readonly waTexto: string;
}

/**
 * Un producto tal como aparece en "Los Favoritos de la Casa" de Inicio.
 * El maquetado usa ahí otros nombres, imágenes y precios que en el catálogo,
 * así que estos campos sobreescriben al producto que referencian.
 */
export interface Destacado {
  readonly productoId: string;
  readonly nombre: string;
  readonly etiqueta: string;
  readonly etiquetaTono: Tono;
  /** Guiño de Ami o Ranto sobre el producto. */
  readonly quip: string;
  readonly resumen: string;
  readonly imagen: string;
  readonly alt: string;
  readonly precio: number | null;
  readonly presentacion: string | null;
  readonly waTexto: string;
}

/** Las tres tarjetas de "Nuestras Categorías Dulces" en Inicio. */
export interface Vitrina {
  readonly categoria: Categoria;
  readonly titulo: string;
  readonly insignia: string;
  readonly insigniaIcono: string;
  readonly tono: Tono;
  readonly descripcion: string;
  readonly imagen: string;
  readonly alt: string;
  readonly cta: string;
}
