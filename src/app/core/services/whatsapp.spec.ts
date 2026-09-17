import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { WhatsappService } from './whatsapp';

describe('WhatsappService', () => {
  let wa: WhatsappService;

  beforeEach(() => {
    wa = TestBed.inject(WhatsappService);
  });

  it('usa el número oficial sin espacios ni signos', () => {
    expect(wa.enlace()).toBe('https://wa.me/525526604734');
  });

  it('codifica el mensaje en el parámetro text', () => {
    expect(wa.enlace('Hola, ¿me pasan precios?')).toBe(
      'https://wa.me/525526604734?text=Hola%2C%20%C2%BFme%20pasan%20precios%3F',
    );
  });

  it('codifica acentos y ñ', () => {
    const enlace = wa.enlace('Alegrías de mañana');
    expect(enlace).toContain('Alegr%C3%ADas');
    expect(enlace).toContain('ma%C3%B1ana');
  });

  it('sin mensaje no agrega el parámetro', () => {
    expect(wa.enlace()).not.toContain('?');
    expect(wa.enlace('')).not.toContain('?');
  });
});
