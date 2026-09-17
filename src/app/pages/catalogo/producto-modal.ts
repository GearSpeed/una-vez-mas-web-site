import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SITIO } from '../../content';
import { CatalogService } from '../../core/services/catalog';
import { ScrollLockService } from '../../core/services/scroll-lock';
import { SeoService } from '../../core/services/seo';
import { WhatsappService } from '../../core/services/whatsapp';

/**
 * Detalle de producto. Es una ruta hija de /catalogo, no un modal en memoria:
 * así el enlace se puede compartir por WhatsApp y cada producto queda como HTML
 * estático indexable. Se dibuja como capa sobre la grilla en lugar de usar
 * `<dialog>.showModal()` para que el contenido salga visible en el prerender.
 */
@Component({
  selector: 'uvm-producto-modal',
  templateUrl: './producto-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'cerrar()',
  },
})
export class ProductoModal implements OnDestroy {
  /** Llega de la ruta `catalogo/:slug` (withComponentInputBinding). */
  readonly slug = input.required<string>();

  private readonly catalogo = inject(CatalogService);
  private readonly wa = inject(WhatsappService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly scrollLock = inject(ScrollLockService);

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly sitio = SITIO;
  protected readonly producto = computed(() => this.catalogo.porId(this.slug()));
  protected readonly waEnlace = computed(() => {
    const p = this.producto();
    return this.wa.enlace(p?.waTexto ?? 'Hola Una vez más! Me gustaría pedir información');
  });

  constructor() {
    // SEO y datos estructurados propios de cada producto
    effect(() => {
      const p = this.producto();
      if (!p) return;
      this.seo.aplicar({
        titulo: p.nombre,
        descripcion: `${p.resumen} Ingredientes: ${p.ingredientes} Pide por WhatsApp al ${SITIO.whatsapp.visible}.`,
        imagen: `img/${p.imagen}`,
      });
      this.seo.datosEstructurados('ld-producto', {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.nombre,
        description: p.descripcion,
        category: p.categoria,
        image: `${SITIO.url}/img/${p.imagen}`,
        brand: { '@type': 'Brand', name: SITIO.nombre },
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'MXN',
          ...(p.precio !== null ? { price: p.precio } : {}),
          url: `${SITIO.url}/catalogo/${p.id}`,
        },
      });
    });

    // bloquear el scroll del fondo mientras el detalle está abierto
    this.scrollLock.bloquear();

    afterNextRender(() => this.panel()?.nativeElement.focus());
  }

  ngOnDestroy(): void {
    this.scrollLock.liberar();
  }

  protected cerrar(): void {
    void this.router.navigate(['/catalogo'], { queryParamsHandling: 'preserve' });
  }

  protected cerrarDesdeFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) this.cerrar();
  }
}
