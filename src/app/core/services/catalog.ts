import { HttpClient } from '@angular/common/http';
import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CATEGORIAS, ORIGEN_CATALOGO, PRODUCTOS } from '../../content';
import type { Categoria, Producto } from '../models/producto';

/** Lo que responde `GET /api/publico/catalogo`. Ver `docs/contrato-sitio.md`. */
interface CatalogoPublico {
  readonly categorias: readonly Categoria[];
  readonly productos: readonly Producto[];
}

/** Valor del filtro: el nombre de una categoría, o todas. */
export type Filtro = string;

/**
 * De dónde sale el catálogo. La escribe el build, que es quien sabe contra qué
 * aplicación se compiló: así un build local se refresca contra la API local. Ver
 * `docs/contrato-sitio.md` en `una_vez_mas_gestion`.
 */
export const URL_CATALOGO = ORIGEN_CATALOGO;

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
 * Puerta única a los datos del catálogo, y el único lugar del sitio que sabe que hay
 * una API.
 *
 * Arranca con la copia que `scripts/generar-catalogo.mjs` dejó dentro del bundle, así
 * que el HTML estático ya sale con precios y fichas —eso es lo que indexa Google y lo
 * que ve quien llega con JavaScript apagado—. Ya en el navegador pide el catálogo otra
 * vez: un precio que cambió en la aplicación se ve en minutos, sin volver a publicar el
 * sitio.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  private readonly lista = signal<readonly Producto[]>(PRODUCTOS);
  private readonly familias = signal<readonly Categoria[]>(CATEGORIAS);

  readonly productos = this.lista.asReadonly();
  /**
   * Las familias que existen hoy, en el orden en que las manda la aplicación. Vienen de
   * la API y no se deducen de los productos: una categoría recién dada de alta todavía
   * no tiene ninguno, y el sitio la anuncia igual («Próximamente»).
   */
  readonly categorias = this.familias.asReadonly();

  /**
   * «Nuestras Categorías Dulces»: las categorías que tienen tarjeta, o sea las que
   * tienen foto. Se capturan en la aplicación, junto a la categoría.
   */
  readonly vitrinas = computed(() =>
    this.familias().filter((c): c is Categoria & { vitrina: NonNullable<Categoria['vitrina']> } =>
      Boolean(c.vitrina),
    ),
  );

  /**
   * «Los Favoritos de la Casa» de la portada: los productos que traen su tarjeta escrita,
   * en el orden en que los manda la aplicación. Son cuatro como mucho, y pueden ser cero:
   * ahí la portada simplemente no pinta la sección.
   */
  readonly destacados = computed(() => this.lista().filter((p) => p.destacado !== null));

  constructor() {
    // Sólo en el navegador y después de hidratar: durante el prerender cada página
    // quedaría congelada con el catálogo del momento del build, que es justo lo que ya
    // trae dentro.
    afterNextRender(() => void this.refrescar());
  }

  /**
   * Vuelve a pedir el catálogo. Si falla —la API caída, el visitante sin red, una regla
   * de caché rara— se queda lo que ya había y no se le dice nada a quien está viendo la
   * página: un precio de hace un rato es mejor que una pantalla rota.
   */
  async refrescar(): Promise<void> {
    try {
      const catalogo = await firstValueFrom(this.http.get<CatalogoPublico>(URL_CATALOGO));
      // Los dos juntos o ninguno: media respuesta dejaría categorías y productos de
      // momentos distintos, y con ellos un «Próximamente» sobre una vitrina con cosas.
      if (catalogo?.productos?.length > 0 && catalogo.categorias?.length > 0) {
        this.lista.set(catalogo.productos);
        this.familias.set(catalogo.categorias);
      }
    } catch {
      // a propósito en silencio
    }
  }

  porId(slug: string): Producto | undefined {
    return this.lista().find((p) => p.slug === slug);
  }

  /** Si una categoría todavía no tiene nada publicado: el sitio dice «Próximamente». */
  estaVacia(nombre: string): boolean {
    return !this.lista().some((p) => p.categoria === nombre);
  }

  /**
   * Filtra por categoría y por texto libre. La búsqueda mira nombre, categoría,
   * resumen e ingredientes, así que "canela" o "piloncillo" también encuentran.
   */
  filtrar(filtro: Filtro, busqueda: string): readonly Producto[] {
    const q = normalizar(busqueda);
    return this.lista().filter((p) => {
      if (filtro !== 'todos' && p.categoria !== filtro) return false;
      if (!q) return true;
      const heno = normalizar(
        `${p.nombre} ${p.categoria} ${p.resumen} ${p.ingredientes.join(' ')}`,
      );
      return heno.includes(q);
    });
  }
}
