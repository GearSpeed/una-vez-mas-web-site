import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FAQS, SITIO } from '../../content';
import { SeoService } from '../../core/services/seo';
import { WhatsappService } from '../../core/services/whatsapp';

@Component({
  selector: 'uvm-contacto',
  imports: [RouterLink],
  templateUrl: './contacto.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contacto {
  private readonly wa = inject(WhatsappService);

  protected readonly sitio = SITIO;
  protected readonly faqs = FAQS;

  /** Sólo una respuesta abierta a la vez; la primera arranca desplegada. */
  protected readonly abierta = signal<number | null>(1);

  protected readonly waInfo = this.wa.enlace(
    'Hola, me gustaría recibir información sobre los productos de Una vez más',
  );
  protected readonly waPregunta = this.wa.enlace('Hola Una vez más, tengo una pregunta específica');

  constructor() {
    // Las FAQ como datos estructurados: Google las puede mostrar en el resultado.
    inject(SeoService).datosEstructurados('ld-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.pregunta,
        acceptedAnswer: { '@type': 'Answer', text: f.respuesta.join(' ') },
      })),
    });
  }

  protected alternar(id: number): void {
    this.abierta.update((actual) => (actual === id ? null : id));
  }
}
