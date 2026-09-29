import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { CATEGORIAS, PRODUCTOS } from '../../content';
import type { Producto } from '../models/producto';
import { CatalogService, normalizar, URL_CATALOGO } from './catalog';

describe('normalizar', () => {
  it('quita acentos y baja a minúsculas', () => {
    expect(normalizar('Alegrías DE Amaranto')).toBe('alegrias de amaranto');
  });

  it('recorta espacios de los extremos', () => {
    expect(normalizar('  Coco  ')).toBe('coco');
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

    const respuesta = (extra = {}) => ({
      categorias: ['Galletas'],
      productos: [producto()],
      ...extra,
    });

    it('el precio que llega de la API sustituye al de la copia', async () => {
      const refresco = catalogo.refrescar();
      http.expectOne(URL_CATALOGO).flush(respuesta());
      await refresco;

      expect(catalogo.porId('galletas-avena')?.precio).toBe('99.00');
      expect(catalogo.productos()).toHaveLength(1);
    });

    it('trae categorías que todavía no tienen ningún producto', async () => {
      const refresco = catalogo.refrescar();
      http.expectOne(URL_CATALOGO).flush(respuesta({ categorias: ['Galletas', 'Paletas'] }));
      await refresco;

      expect(catalogo.categorias()).toEqual(['Galletas', 'Paletas']);
      expect(catalogo.estaVacia('Paletas')).toBe(true);
      expect(catalogo.estaVacia('Galletas')).toBe(false);
    });

    it('la portada sale del catálogo y respeta su orden', async () => {
      const refresco = catalogo.refrescar();
      http.expectOne(URL_CATALOGO).flush(
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
      http.expectOne(URL_CATALOGO).flush(respuesta());
      await refresco;

      expect(catalogo.destacados()).toEqual([]);
    });

    it('si la API falla, se queda el catálogo anterior', async () => {
      const antes = catalogo.productos();
      const refresco = catalogo.refrescar();
      http.expectOne(URL_CATALOGO).error(new ProgressEvent('error'), { status: 503 });
      await refresco;

      expect(catalogo.productos()).toBe(antes);
    });

    it('una respuesta vacía tampoco borra el catálogo', async () => {
      const antes = catalogo.productos();
      const refresco = catalogo.refrescar();
      http.expectOne(URL_CATALOGO).flush({ categorias: [], productos: [] });
      await refresco;

      expect(catalogo.productos()).toBe(antes);
    });

    it('media respuesta no se aplica: categorías y productos van juntos', async () => {
      // Si sólo entraran las categorías, una con productos se vería «Próximamente».
      const productosAntes = catalogo.productos();
      const categoriasAntes = catalogo.categorias();
      const refresco = catalogo.refrescar();
      http.expectOne(URL_CATALOGO).flush({ categorias: ['Paletas'], productos: [] });
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
