import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from '../site-footer/site-footer';
import { SiteHeader } from '../site-header/site-header';
import { WhatsappDock } from '../whatsapp-dock/whatsapp-dock';

/**
 * Cascarón del sitio: header, footer y dock de WhatsApp.
 * En el export de Stitch estos tres bloques eran idénticos byte a byte en las
 * cinco páginas; aquí viven una sola vez. /enlaces queda fuera a propósito.
 */
@Component({
  selector: 'uvm-shell',
  imports: [RouterOutlet, SiteHeader, SiteFooter, WhatsappDock],
  template: `
    <uvm-site-header />
    <main class="w-full pt-20 bg-surface">
      <router-outlet />
    </main>
    <uvm-whatsapp-dock />
    <uvm-site-footer />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {}
