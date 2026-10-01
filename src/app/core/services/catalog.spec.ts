import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { CATEGORIAS, PRODUCTOS } from '../../content';
import type { Categoria, Imagen, Producto } from '../models/producto';
import { CatalogService, normalizar, urlDelCatalogo } from './catalog';

describe('normalizar', () => {
  it('quita acentos y baja a minúsculas', () => {
    expect(normalizar('Alegrías DE Amaranto')).toBe('alegrias de amaranto');
  });

  it('recorta espacios de los extremos', () => {
    expect(normalizar('  Coco  ')).toBe('coco');
  });
});

describe('urlDelCatalogo', () => {
  it('desde tu máquina, contra tu API local', () => {
    // Para que trabajar en local no exija tocar ningún archivo, ni acordarse de
    // devolverlo a producción antes de commitear.
    expect(urlDelCatalogo('localhost')).toContain('localhost:4300');
    expect(urlDelCatalogo('127.0.0.1')).toContain('localhost:4300');
  });

  it('publicado, contra producción', () => {
    expect(urlDelCatalogo('www.unavezmasmx.com')).toBe(
      'https://gestion.unavezmasmx.com/api/publico/catalogo',
    );
  });
});

describe('CatalogService', () => {
  let catalogo: CatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    catalogo = TestBed.inject(CatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('arranca con la copia del catálogo que trae el bundle', () => {
    expect(catalogo.productos()).toEqual(PRODUCTOS);
    expect(catalogo.productos().length).toBeGreaterThan(0);
  });

  it('las categorías son las que manda la aplicación, en su orden', () => {
    expect(catalogo.categorias()).toEqual(CATEGORIAS);
  });

  it('las vitrinas son las categorías con tarjeta, nada escrito en el sitio', () => {
    expect(catalogo.vitrinas()).toEqual(CATEGORIAS.filter((c) => c.vitrina));
  });

  it('los destacados son productos del catálogo, no un dato aparte', () => {
    for (const destacado of catalogo.destacados()) {
      expect(catalogo.porId(destacado.slug)).toBe(destacado);
      expect(destacado.destacado).not.toBeNull();
    }
  });

  describe('refrescar', () => {
    /** Lo mínimo que pide el contrato, con lo que hace falta para la prueba. */
    const producto = (extra: Partial<Producto> = {}): Producto => ({
      slug: 'galletas-avena',
      nombre: 'Galletas de Avena',
      categoria: 'Galletas',
      presentacion: '6 pzas',
      resumen: 'Avena y amaranto.',
      descripcion: '',
      ingredientes: [],
      precio: '99.00',
      disponibilidad: 'disponible',
      imagen: {
        url: 'https://img.ejemplo/1200.webp',
        urlChica: 'https://img.ejemplo/600.webp',
        alt: 'Galletas de avena',
        esPlaceholder: false,
      },
      destacado: null,
      ...extra,
    });

    /** Una categoría del catálogo. Sin `vitrina` no dibuja tarjeta en Inicio. */
    const categoria = (nombre: string, vitrina: Categoria['vitrina'] = null) => ({
      nombre,
      vitrina,
    });

    const laVitrina = {
      titulo: 'Galletas de Amaranto',
      insignia: 'Tradición dulce',
      icono: 'cookie',
      descripcion: 'Todas llevan amaranto.',
      cta: 'Ver nuestras galletas',
      imagen: {
        url: 'https://img.ejemplo/cat-1200.webp',
        urlChica: 'https://img.ejemplo/cat-600.webp',
        alt: 'Galletas de amaranto',
      },
    };

    const respuesta = (extra = {}) => ({
      categorias: [categoria('Galletas')],
      productos: [producto()],
      ...extra,
    });

    it('el precio que llega de la API sustituye al de la copia', async () => {
      const refresco = catalogo.refrescar();
      http.expectOne((r) => r.url.startsWith(urlDelCatalogo())).flush(respuesta());
      await refresco;

      expect(catalogo.porId('galletas-avena')?.precio).toBe('99.00');
      expect(catalogo.productos()).toHaveLength(1);
    });

    it('trae categorías que todavía no tienen ningún producto', async () => {
      const refresco = catalogo.refrescar();
      http
        .expectOne((r) => r.url.startsWith(urlDelCatalogo()))
        .flush(respuesta({ categorias: [categoria('Galletas'), categoria('Paletas')] }));
      await refresco;

      expect(catalogo.categorias().map((c) => c.nombre)).toEqual(['Galletas', 'Paletas']);
      expect(catalogo.estaVacia('Paletas')).toBe(true);
      expect(catalogo.estaVacia('Galletas')).toBe(false);
    });

    it('la portada sale del catálogo y respeta su orden', async () => {
      const refresco = catalogo.refrescar();
      http
        .expectOne((r) => r.url.startsWith(urlDelCatalogo()))
        .flush(
          respuesta({
            productos: [
              producto({ slug: 'sin-portada' }),
              producto({
                slug: 'en-portada',
                destacado: { etiqueta: 'Clásico', quip: 'El favorito de Ami', texto: 'Rico.' },
              }),
            ],
          }),
        );
      await refresco;

      expect(catalogo.destacados().map((p) => p.slug)).toEqual(['en-portada']);
    });

    it('sin ninguno prendido, la portada se queda sin tarjetas', async () => {
      const refresco = catalogo.refrescar();
      http.expectOne((r) => r.url.startsWith(urlDelCatalogo())).flush(respuesta());
      await refresco;

      expect(catalogo.destacados()).toEqual([]);
    });

    it('solo las categorías con tarjeta salen en «Nuestras Categorías Dulces»', async () => {
      const refresco = catalogo.refrescar();
      http
        .expectOne((r) => r.url.startsWith(urlDelCatalogo()))
        .flush(
          respuesta({
            categorias: [
              categoria('Obleas'),
              categoria('Galletas', laVitrina),
              categoria('Paletas'),
            ],
          }),
        );
      await refresco;

      // Las tres siguen sirviendo para filtrar el catálogo…
      expect(catalogo.categorias()).toHaveLength(3);
      // …pero solo la que tiene foto dibuja tarjeta, y en el orden en que llegó.
      expect(catalogo.vitrinas().map((c) => c.nombre)).toEqual(['Galletas']);
      expect(catalogo.vitrinas()[0].vitrina.titulo).toBe('Galletas de Amaranto');
    });

    describe('la foto de la tarjeta', () => {
      /** Un producto de esa categoría con foto propia. */
      const conFoto = (slug: string, cat: string, url: string) =>
        producto({
          slug,
          categoria: cat,
          imagen: { url, urlChica: url, alt: `foto de ${slug}`, esPlaceholder: false },
        });

      /** Una categoría con tarjeta; `imagen` es la suya propia, que manda sobre el sorteo. */
      const conVitrina = (nombre: string, imagen: Imagen | null = null) =>
        categoria(nombre, { ...laVitrina, imagen });

      const refrescarCon = async (cuerpo: object) => {
        const refresco = catalogo.refrescar();
        http.expectOne((r) => r.url.startsWith(urlDelCatalogo())).flush(cuerpo);
        await refresco;
      };

      it('sin foto propia, la saca de un producto de esa categoría', async () => {
        await refrescarCon({
          categorias: [conVitrina('Galletas')],
          productos: [
            conFoto('avena', 'Galletas', 'https://img.ejemplo/avena.webp'),
            conFoto('borracho', 'Borrachitos', 'https://img.ejemplo/borracho.webp'),
          ],
        });

        const galletas = catalogo.categorias()[0];
        // De su familia, nunca de otra.
        expect(catalogo.imagenDeVitrina(galletas)?.url).toBe('https://img.ejemplo/avena.webp');
      });

      it('nunca elige un producto que sirve el logo de relleno', async () => {
        await refrescarCon({
          categorias: [conVitrina('Galletas')],
          productos: [
            producto({
              slug: 'sin-foto',
              categoria: 'Galletas',
              imagen: {
                url: 'https://img.ejemplo/logo.webp',
                urlChica: 'https://img.ejemplo/logo.webp',
                alt: '',
                esPlaceholder: true,
              },
            }),
          ],
        });

        // Un logo no es la cara de una familia: mejor ninguna que esa.
        expect(catalogo.imagenDeVitrina(catalogo.categorias()[0])).toBeNull();
      });

      it('la foto propia de la categoría manda sobre el sorteo', async () => {
        const propia = {
          url: 'https://img.ejemplo/cat.webp',
          urlChica: 'https://img.ejemplo/cat.webp',
          alt: 'la de la categoría',
        };
        await refrescarCon({
          categorias: [conVitrina('Galletas', propia)],
          productos: [conFoto('avena', 'Galletas', 'https://img.ejemplo/avena.webp')],
        });

        expect(catalogo.imagenDeVitrina(catalogo.categorias()[0])?.url).toBe(propia.url);
      });

      it('el sorteo no se vuelve a tirar cuando el catálogo se refresca', async () => {
        const productos = [
          conFoto('a', 'Galletas', 'https://img.ejemplo/a.webp'),
          conFoto('b', 'Galletas', 'https://img.ejemplo/b.webp'),
          conFoto('c', 'Galletas', 'https://img.ejemplo/c.webp'),
        ];
        await refrescarCon({ categorias: [conVitrina('Galletas')], productos });
        const primera = catalogo.imagenDeVitrina(catalogo.categorias()[0])?.url;

        // Otro refresco con los mismos datos: las fotos no deben bailar mientras
        // alguien está mirando la página.
        await refrescarCon({ categorias: [conVitrina('Galletas')], productos });
        expect(catalogo.imagenDeVitrina(catalogo.categorias()[0])?.url).toBe(primera);
      });
    });

    it('si la API falla, se queda el catálogo anterior', async () => {
      const antes = catalogo.productos();
      const refresco = catalogo.refrescar();
      http
        .expectOne((r) => r.url.startsWith(urlDelCatalogo()))
        .error(new ProgressEvent('error'), { status: 503 });
      await refresco;

      expect(catalogo.productos()).toBe(antes);
    });

    it('una respuesta vacía tampoco borra el catálogo', async () => {
      const antes = catalogo.productos();
      const refresco = catalogo.refrescar();
      http
        .expectOne((r) => r.url.startsWith(urlDelCatalogo()))
        .flush({ categorias: [], productos: [] });
      await refresco;

      expect(catalogo.productos()).toBe(antes);
    });

    it('media respuesta no se aplica: categorías y productos van juntos', async () => {
      // Si sólo entraran las categorías, una con productos se vería «Próximamente».
      const productosAntes = catalogo.productos();
      const categoriasAntes = catalogo.categorias();
      const refresco = catalogo.refrescar();
      http
        .expectOne((r) => r.url.startsWith(urlDelCatalogo()))
        .flush({ categorias: [categoria('Paletas')], productos: [] });
      await refresco;

      expect(catalogo.productos()).toBe(productosAntes);
      expect(catalogo.categorias()).toBe(categoriasAntes);
    });
  });

  describe('filtrar', () => {
    const todos = () => catalogo.filtrar('todos', '');

    it('sin filtro ni búsqueda devuelve todo', () => {
      expect(todos()).toHaveLength(PRODUCTOS.length);
    });

    it('filtra por categoría', () => {
      const galletas = catalogo.filtrar('Galletas', '');
      expect(galletas.length).toBeGreaterThan(0);
      expect(galletas.every((p) => p.categoria === 'Galletas')).toBe(true);
    });

    it('busca sin depender de los acentos', () => {
      // "alegrias" sin tilde debe encontrar la categoría "Alegrías"
      const sinTilde = catalogo.filtrar('todos', 'alegrias');
      const conTilde = catalogo.filtrar('todos', 'Alegrías');
      expect(sinTilde.map((p) => p.slug)).toEqual(conTilde.map((p) => p.slug));
      expect(sinTilde.length).toBeGreaterThan(0);
    });

    it('busca también en los ingredientes, que ahora son una lista', () => {
      // el maquetado sólo miraba el nombre: "piloncillo" no encontraba nada
      const conPiloncillo = PRODUCTOS.filter((p) =>
        p.ingredientes.some((i) => normalizar(i).includes('piloncillo')),
      );
      const resultado = catalogo.filtrar('todos', 'piloncillo');
      expect(resultado.length).toBeGreaterThanOrEqual(conPiloncillo.length);
      expect(resultado.length).toBeGreaterThan(0);
    });

    it('devuelve vacío cuando nada coincide', () => {
      expect(catalogo.filtrar('todos', 'xyz')).toHaveLength(0);
    });

    it('la categoría manda sobre la búsqueda', () => {
      expect(catalogo.filtrar('Borrachitos', 'galleta')).toHaveLength(0);
    });
  });

  describe('porId', () => {
    it('encuentra un producto por su slug', () => {
      const alguno = PRODUCTOS[0];
      expect(catalogo.porId(alguno.slug)?.nombre).toBe(alguno.nombre);
    });

    it('devuelve undefined para un slug inexistente', () => {
      expect(catalogo.porId('no-existe')).toBeUndefined();
    });
  });
});
