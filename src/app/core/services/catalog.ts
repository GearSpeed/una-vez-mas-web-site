import { Injectable } from '@angular/core';
import { DESTACADOS, PRODUCTOS, VITRINAS } from '../../content';
import type { Categoria, Destacado, Producto, Vitrina } from '../models/producto';

/** Valor del filtro de categoría: una categoría concreta o todas. */
export type Filtro = Categoria | 'todos';

/**
 * Quita acentos y pasa a minúsculas, para que "alegrias" encuentre "Alegrías".
 * El maquetado resolvía esto duplicando los términos a mano en un data-attribute.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Puerta única a los datos del catálogo. Hoy lee los JSON compilados en el
 * bundle; cuando haya API, sólo cambia esta clase.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly productos: readonly Producto[] = PRODUCTOS;
  readonly destacados: readonly Destacado[] = DESTACADOS;
  readonly vitrinas: readonly Vitrina[] = VITRINAS;

  porId(id: string): Producto | undefined {
    return this.productos.find((p) => p.id === id);
  }

  /** El producto del catálogo al que apunta un destacado de Inicio. */
  productoDeDestacado(destacado: Destacado): Producto | undefined {
    return this.porId(destacado.productoId);
  }

  /**
   * Filtra por categoría y por texto libre. La búsqueda mira nombre, categoría,
   * resumen e ingredientes, así que "canela" o "piloncillo" también encuentran.
   */
  filtrar(filtro: Filtro, busqueda: string): readonly Producto[] {
    const q = normalizar(busqueda);
    return this.productos.filter((p) => {
      if (filtro !== 'todos' && p.categoria !== filtro) return false;
      if (!q) return true;
      const heno = normalizar(`${p.nombre} ${p.categoria} ${p.resumen} ${p.ingredientes}`);
      return heno.includes(q);
    });
  }
}
