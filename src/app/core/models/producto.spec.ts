import { describe, expect, it } from 'vitest';
import { avisoDisponibilidad, precioVisible, waTextoDe, type Producto } from './producto';

describe('precioVisible', () => {
  it('quita los centavos cuando son cero, como se lee en el mostrador', () => {
    expect(precioVisible('30.00')).toBe('30');
  });

  it('los conserva cuando los hay', () => {
    expect(precioVisible('30.50')).toBe('30.50');
  });

  it('sin precio, no hay precio', () => {
    expect(precioVisible(null)).toBeNull();
  });

  it('un cero se lee como «Consulta precio», nunca como $0', () => {
    // Un producto en $0 es una captura a medias o un dedazo. Anunciarlo obligaría a
    // respetar ese precio ante quien lo viera.
    expect(precioVisible('0.00')).toBeNull();
    expect(precioVisible('0')).toBeNull();
    expect(precioVisible('-1.00')).toBeNull();
  });
});

describe('avisoDisponibilidad', () => {
  it('avisa lo que urge saber', () => {
    expect(avisoDisponibilidad('agotado')).toBe('Agotado');
    expect(avisoDisponibilidad('ultimas_piezas')).toBe('Últimas piezas');
  });

  it('que algo esté disponible no hace falta decirlo', () => {
    expect(avisoDisponibilidad('disponible')).toBeNull();
  });
});

describe('waTextoDe', () => {
  it('arma el mensaje con el nombre del producto', () => {
    const producto = { nombre: 'Galletas de Avena' } as Producto;
    expect(waTextoDe(producto)).toBe(
      'Hola, vi Galletas de Avena en el catálogo de Una vez más y me gustaría recibir información',
    );
  });
});
