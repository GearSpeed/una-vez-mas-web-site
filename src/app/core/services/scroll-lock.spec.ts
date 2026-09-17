import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { ScrollLockService } from './scroll-lock';

describe('ScrollLockService', () => {
  let lock: ScrollLockService;
  let body: HTMLElement;

  beforeEach(() => {
    lock = TestBed.inject(ScrollLockService);
    body = TestBed.inject(DOCUMENT).body;
    body.classList.remove('overflow-hidden');
  });

  it('bloquea y libera', () => {
    lock.bloquear();
    expect(body.classList.contains('overflow-hidden')).toBe(true);
    lock.liberar();
    expect(body.classList.contains('overflow-hidden')).toBe(false);
  });

  it('cerrar un bloqueo no desbloquea mientras otro sigue abierto', () => {
    // el caso real: drawer móvil y detalle de producto abiertos a la vez
    lock.bloquear();
    lock.bloquear();
    lock.liberar();
    expect(body.classList.contains('overflow-hidden')).toBe(true);
    lock.liberar();
    expect(body.classList.contains('overflow-hidden')).toBe(false);
  });

  it('liberar de más no descuadra la cuenta', () => {
    lock.liberar();
    lock.liberar();
    lock.bloquear();
    expect(body.classList.contains('overflow-hidden')).toBe(true);
  });
});
