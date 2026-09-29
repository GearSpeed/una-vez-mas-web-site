import { HttpClient } from '@angular/common/http';
import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CATEGORIAS, PRODUCTOS } from '../../content';
import type { Categoria, Imagen, Producto } from '../models/producto';

/** Lo que responde `GET /api/publico/catalogo`. Ver `docs/contrato-sitio.md`. */
interface CatalogoPublico {
  readonly categorias: readonly Categoria[];
  readonly productos: readonly Producto[];
}

/** Valor del filtro: el nombre de una categoría, o todas. */
export type Filtro = string;

/** La aplicación de gestión. Ver `docs/contrato-sitio.md` en `una_vez_mas_gestion`. */
const URL_PRODUCCION = 'https://gestion.unavezmasmx.com/api/publico/catalogo';
/** El `ng serve` de gestión, que hace de proxy a su API. */
const URL_LOCAL = 'http://localhost:4300/api/publico/catalogo';

/**
 * Contra qué aplicación se refresca el catálogo: **si el sitio se sirve desde tu máquina,
 * contra tu API local; si no, contra producción.**
 *
 * Va aquí y no en un archivo generado a propósito. Antes lo escribía el build, y eso
 * obligaba a regenerarlo para trabajar en local y a devolverlo a producción antes de cada
 * commit. Nadie se acuerda de eso siempre, y la vez que no te acuerdas el sitio local te
 * muestra los datos de producción sin decir nada.
 *
 * Si alguien sirve un build de producción desde `localhost`, buscará la API local, no la
 * encontrará y se quedará con la copia que trae el bundle: se ve lo mismo, sin refresco.
 */
export function urlDelCatalogo(host = location.hostname): string {
  return host === 'localhost' || host === '127.0.0.1' ? URL_LOCAL : URL_PRODUCCION;
}

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
   * «Nuestras Categorías Dulces»: las categorías que traen tarjeta. Quién la trae lo
   * decide la aplicación (tiene descripción y hay con qué vestirla).
   */
  readonly vitrinas = computed(() =>
    this.familias().filter((c): c is Categoria & { vitrina: NonNullable<Categoria['vitrina']> } =>
      Boolean(c.vitrina),
    ),
  );

  /**
   * El sorteo de las fotos de las tarjetas, un número por categoría.
   *
   * Vacío hasta que se hidrata, y ahí está lo importante: el HTML estático —el que indexa
   * Google y el que ve quien llega sin JavaScript— sale siempre con la primera foto, y el
   * sorteo ocurre después, ya en el navegador. Por eso la portada cambia por visitante
   * aun siendo un sitio estático; el precio es que la foto se reemplaza un instante
   * después de cargar.
   *
   * Se tira una sola vez: no se vuelve a sortear cuando el catálogo se refresca, para que
   * las fotos no bailen mientras alguien está mirando.
   */
  private readonly sorteo = signal<Readonly<Record<string, number>>>({});

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
    afterNextRender(() => {
      this.sorteo.set(Object.fromEntries(this.familias().map((c) => [c.nombre, Math.random()])));
      void this.refrescar();
    });
  }

  /**
   * La foto de la tarjeta de una categoría: la suya propia si alguien se la subió, y si
   * no, una de sus productos.
   *
   * Sólo entran productos con **foto propia**: uno sin ella sirve el logo de relleno, y un
   * logo no es la cara de una familia. El texto alternativo sale del producto elegido, que
   * ya está escrito.
   */
  imagenDeVitrina(categoria: Categoria): Imagen | null {
    if (categoria.vitrina?.imagen) return categoria.vitrina.imagen;

    const candidatas = this.lista().filter(
      (p) => p.categoria === categoria.nombre && !p.imagen.esPlaceholder,
    );
    if (candidatas.length === 0) return null;

    // El módulo es por si el catálogo se refrescó y quedan menos productos que cuando se
    // tiró el sorteo.
    const azar = this.sorteo()[categoria.nombre] ?? 0;
    return candidatas[Math.floor(azar * candidatas.length) % candidatas.length].imagen;
  }

  /**
   * Vuelve a pedir el catálogo. Si falla —la API caída, el visitante sin red, una regla
   * de caché rara— se queda lo que ya había y no se le dice nada a quien está viendo la
   * página: un precio de hace un rato es mejor que una pantalla rota.
   */
  async refrescar(): Promise<void> {
    try {
      const catalogo = await firstValueFrom(this.http.get<CatalogoPublico>(urlDelCatalogo()));
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
