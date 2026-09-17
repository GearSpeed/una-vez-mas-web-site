import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { CatalogService, normalizar } from './catalog';

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

  beforeEach(() => {
    catalogo = TestBed.inject(CatalogService);
  });

  it('carga los 9 productos del catálogo', () => {
    expect(catalogo.productos).toHaveLength(9);
  });

  it('todos los destacados apuntan a un producto existente', () => {
    for (const destacado of catalogo.destacados) {
      expect(catalogo.productoDeDestacado(destacado)).toBeDefined();
    }
  });

  describe('filtrar', () => {
    it('sin filtro ni búsqueda devuelve todo', () => {
      expect(catalogo.filtrar('todos', '')).toHaveLength(9);
    });

    it('filtra por categoría', () => {
      const galletas = catalogo.filtrar('Galletas', '');
      expect(galletas).toHaveLength(4);
      expect(galletas.every((p) => p.categoria === 'Galletas')).toBe(true);
    });

    it('busca sin depender de los acentos', () => {
      // "alegrias" sin tilde debe encontrar "Alegrías de Amaranto Tradicionales"
      const sinTilde = catalogo.filtrar('todos', 'alegrias');
      const conTilde = catalogo.filtrar('todos', 'Alegrías');
      expect(sinTilde.map((p) => p.id)).toEqual(conTilde.map((p) => p.id));
      expect(sinTilde.length).toBeGreaterThan(0);
    });

    it('busca también en los ingredientes, no sólo en el nombre', () => {
      // el maquetado sólo miraba el nombre: "piloncillo" no encontraba nada
      const resultado = catalogo.filtrar('todos', 'piloncillo');
      expect(resultado.length).toBeGreaterThan(1);
      expect(resultado.some((p) => p.id === 'alegrias-tradicionales')).toBe(true);
    });

    it('combina categoría y búsqueda', () => {
      expect(catalogo.filtrar('Borrachitos', 'tequila').map((p) => p.id)).toEqual([
        'borrachitos-tequila',
      ]);
    });

    it('devuelve vacío cuando nada coincide', () => {
      expect(catalogo.filtrar('todos', 'xyz')).toHaveLength(0);
    });

    it('la categoría manda sobre la búsqueda', () => {
      // "canela" está en los ingredientes de una galleta, no de un borrachito
      expect(catalogo.filtrar('Borrachitos', 'canela')).toHaveLength(0);
    });
  });

  describe('porId', () => {
    it('encuentra un producto por su slug', () => {
      expect(catalogo.porId('galletas-coco')?.nombre).toBe('Galletas de Coco');
    });

    it('devuelve undefined para un slug inexistente', () => {
      expect(catalogo.porId('no-existe')).toBeUndefined();
    });
  });
});
