import { describe, expect, it } from 'vitest';
import {
  avisoDescuento,
  avisoDisponibilidad,
  precioVisible,
  waTextoDe,
  type Producto,
} from './producto';

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

describe('avisoDescuento', () => {
  it('sin escalones, no hay nada que avisar', () => {
    expect(avisoDescuento([])).toBeNull();
  });

  it('con un escalón, dice el porcentaje y desde cuántas piezas', () => {
    expect(avisoDescuento([{ desde: 12, tasa: '0.1500' }])).toBe('15% desde 12 piezas');
  });

  it('con los dos escalones, los muestra ambos en orden', () => {
    expect(
      avisoDescuento([
        { desde: 6, tasa: '0.1000' },
        { desde: 12, tasa: '0.1500' },
      ]),
    ).toBe('10% desde 6 piezas · 15% desde 12');
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
