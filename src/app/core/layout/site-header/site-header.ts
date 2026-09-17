import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { SITIO } from '../../../content';
import { ScrollLockService } from '../../services/scroll-lock';
import { WhatsappService } from '../../services/whatsapp';

interface ItemNav {
  readonly ruta: string;
  readonly texto: string;
}

@Component({
  selector: 'uvm-site-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'cerrarMenu()',
  },
})
export class SiteHeader {
  private readonly scrollLock = inject(ScrollLockService);
  private readonly wa = inject(WhatsappService);

  protected readonly sitio = SITIO;
  protected readonly menuAbierto = signal(false);

  protected readonly nav: readonly ItemNav[] = [
    { ruta: '/inicio', texto: 'Inicio' },
    { ruta: '/catalogo', texto: 'Catálogo' },
    { ruta: '/nosotros', texto: 'Nosotros' },
    { ruta: '/contacto', texto: 'Contacto' },
    { ruta: '/enlaces', texto: 'Enlaces' },
  ];

  /** Clases del maquetado para la pastilla de navegación de escritorio. */
  protected readonly navBase = 'px-4 py-2 rounded-full font-label-md text-label-md transition-all';
  protected readonly navActivo = `${this.navBase} bg-primary-container text-on-primary shadow-sm`;
  protected readonly navInactivo = `${this.navBase} text-on-surface-variant hover:text-primary hover:bg-surface-container`;

  protected readonly waPedido = this.wa.enlace('Hola Una vez más! Me gustaría hacer un pedido');

  constructor() {
    const router = inject(Router);
    // el drawer no debe sobrevivir a una navegación
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.cerrarMenu());

    // bloquear el scroll del fondo mientras el drawer está abierto
    let bloqueado = false;
    effect(() => {
      const abierto = this.menuAbierto();
      this.scrollLock.aplicar(abierto, bloqueado);
      bloqueado = abierto;
    });
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
