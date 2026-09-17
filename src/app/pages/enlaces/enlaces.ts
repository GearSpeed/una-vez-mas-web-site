import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ENLACES, SITIO } from '../../content';
import type { Enlace } from '../../core/models/contenido';
import { WhatsappService } from '../../core/services/whatsapp';

/**
 * Link-in-bio. Va fuera del shell del sitio: sin header, sin footer y sin dock,
 * porque es la página que se pega en la bio de Instagram y TikTok.
 */
@Component({
  selector: 'uvm-enlaces',
  imports: [RouterLink],
  templateUrl: './enlaces.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Enlaces {
  private readonly wa = inject(WhatsappService);

  protected readonly sitio = SITIO;
  protected readonly enlaces = ENLACES;
  protected readonly anio = new Date().getFullYear();

  protected href(enlace: Enlace): string {
    return enlace.waTexto ? this.wa.enlace(enlace.waTexto) : (enlace.url ?? '#');
  }

  protected externo(enlace: Enlace): boolean {
    return (enlace.url ?? '').startsWith('http');
  }
}
