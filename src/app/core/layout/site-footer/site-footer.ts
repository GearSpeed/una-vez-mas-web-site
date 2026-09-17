import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITIO } from '../../../content';
import { WhatsappService } from '../../services/whatsapp';

@Component({
  selector: 'uvm-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  private readonly wa = inject(WhatsappService);

  protected readonly sitio = SITIO;
  protected readonly anio = new Date().getFullYear();
  protected readonly waDirecto = this.wa.enlace();

  protected readonly nav = [
    { ruta: '/inicio', texto: 'Inicio' },
    { ruta: '/catalogo', texto: 'Catálogo de delicias' },
    { ruta: '/nosotros', texto: 'Nuestra historia' },
    { ruta: '/contacto', texto: 'Contacto & Eventos' },
    { ruta: '/enlaces', texto: 'Enlaces y Redes' },
  ] as const;
}
