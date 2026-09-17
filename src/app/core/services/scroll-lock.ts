import { DOCUMENT, Injectable, inject } from '@angular/core';

/**
 * Bloqueo de scroll compartido. Lleva cuenta de quién lo pide (drawer móvil y
 * detalle de producto pueden coincidir) para que al cerrar uno no se desbloquee
 * mientras el otro sigue abierto.
 */
@Injectable({ providedIn: 'root' })
export class ScrollLockService {
  private readonly doc = inject(DOCUMENT);
  private pedidos = 0;

  bloquear(): void {
    if (++this.pedidos === 1) this.doc.body.classList.add('overflow-hidden');
  }

  liberar(): void {
    this.pedidos = Math.max(0, this.pedidos - 1);
    if (this.pedidos === 0) this.doc.body.classList.remove('overflow-hidden');
  }

  /** Aplica o quita según un estado booleano, sin descuadrar la cuenta. */
  aplicar(bloqueado: boolean, yaBloqueado: boolean): void {
    if (bloqueado && !yaBloqueado) this.bloquear();
    else if (!bloqueado && yaBloqueado) this.liberar();
  }
}
