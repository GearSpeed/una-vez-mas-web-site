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

  describe('resaltado del nombre del negocio', () => {
    it('envuelve el nombre entre asteriscos para que WhatsApp lo ponga en negritas', () => {
      const enlace = wa.enlace('Hola Una vez más! Me gustaría hacer un pedido');
      expect(decodeURIComponent(enlace)).toContain('*Una vez más*');
    });

    it('también lo resalta a media frase', () => {
      const enlace = wa.enlace('Hola, vi Galletas de Coco en el catálogo de Una vez más');
      expect(decodeURIComponent(enlace)).toContain('catálogo de *Una vez más*');
    });

    it('no vuelve a envolverlo si ya venía resaltado', () => {
      const texto = decodeURIComponent(wa.enlace('Hola *Una vez más*!'));
      expect(texto).toContain('*Una vez más*');
      expect(texto).not.toContain('**');
    });

    it('el asterisco viaja sin escapar, si no WhatsApp no aplicaría la negrita', () => {
      expect(wa.enlace('Hola Una vez más!')).toContain('*Una%20vez%20m%C3%A1s*');
    });

    it('deja igual un mensaje que no menciona al negocio', () => {
      const texto = 'Hola, me gustaría conocer más sobre sus productos';
      const enviado = new URL(wa.enlace(texto)).searchParams.get('text');
      expect(enviado).toBe(texto);
    });
  });

  it('sin mensaje no agrega el parámetro', () => {
    expect(wa.enlace()).not.toContain('?');
    expect(wa.enlace('')).not.toContain('?');
  });
});
