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
    if (!texto) return base;
    return `${base}?text=${encodeURIComponent(this.resaltarNombre(texto))}`;
  }

  /**
   * WhatsApp muestra en negritas lo que va entre asteriscos, y `encodeURIComponent`
   * no los escapa, así que llegan intactos en la URL.
   *
   * Se aplica aquí y no en cada mensaje por tres razones: ningún mensaje se queda
   * sin resaltar, los JSON de contenido se siguen leyendo en limpio, y si cambia
   * el nombre del negocio en `site.json` el resaltado lo sigue solo.
   */
  private resaltarNombre(texto: string): string {
    const nombre = SITIO.nombre;
    const patron = nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Los lookarounds evitan volver a envolver un nombre que ya venga resaltado.
    return texto.replace(new RegExp(`(?<!\\*)${patron}(?!\\*)`, 'g'), `*${nombre}*`);
  }
}
