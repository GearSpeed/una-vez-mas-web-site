import { Injectable } from '@angular/core';
import { SITIO } from '../../content';

/**
 * Único lugar donde se arman los enlaces a WhatsApp. Hoy hacen de checkout;
 * el día que exista carrito y backend, los mensajes siguen saliendo de aquí.
 */
@Injectable({ providedIn: 'root' })
export class WhatsappService {
  readonly numero = SITIO.whatsapp.numero;
  readonly visible = SITIO.whatsapp.visible;

  /** `texto` va en claro; la codificación es responsabilidad de este método. */
  enlace(texto?: string): string {
    const base = `https://wa.me/${this.numero}`;
    return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
  }
}
