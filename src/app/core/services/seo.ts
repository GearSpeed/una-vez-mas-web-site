import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SITIO } from '../../content';

/** Lo que cada ruta declara en su `data.seo`. */
export interface Seo {
  readonly titulo: string;
  readonly descripcion: string;
  /**
   * Ruta bajo /public, o una URL absoluta (las fotos de producto las sirve el bucket
   * de la aplicación). Por defecto, la portada.
   */
  readonly imagen?: string;
}

const IMAGEN_POR_DEFECTO = 'og/og-default.jpg';

/** Las vistas previas de WhatsApp y Google necesitan la URL completa, venga de donde venga. */
function absoluta(imagen: string): string {
  return /^https?:\/\//.test(imagen) ? imagen : `${SITIO.url}/${imagen}`;
}

/**
 * Aplica title, description, canonical y Open Graph en cada navegación.
 * Corre también durante el prerender, así que cada HTML estático sale ya con
 * sus etiquetas — que es lo que leen Google y las vistas previas de WhatsApp.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  /** Se llama una vez desde el componente raíz. */
  observarRutas(): void {
    this.aplicarDesdeRuta();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.aplicarDesdeRuta();
    });
  }

  private aplicarDesdeRuta(): void {
    let ruta: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let seo: Seo | undefined;
    while (ruta) {
      seo = (ruta.data['seo'] as Seo | undefined) ?? seo;
      ruta = ruta.firstChild;
    }
    if (seo) this.aplicar(seo);
  }

  aplicar(seo: Seo): void {
    const titulo = `${seo.titulo} · ${SITIO.nombre}`;
    const imagen = absoluta(seo.imagen ?? IMAGEN_POR_DEFECTO);
    const canonica = `${SITIO.url}${this.router.url.split('?')[0].split('#')[0]}`;

    this.title.setTitle(titulo);
    for (const [attr, name, content] of [
      ['name', 'description', seo.descripcion],
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', SITIO.nombre],
      ['property', 'og:locale', 'es_MX'],
      ['property', 'og:title', titulo],
      ['property', 'og:description', seo.descripcion],
      ['property', 'og:image', imagen],
      ['property', 'og:url', canonica],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', titulo],
      ['name', 'twitter:description', seo.descripcion],
      ['name', 'twitter:image', imagen],
    ] as const) {
      this.meta.updateTag({ [attr]: name, content }, `${attr}='${name}'`);
    }

    this.canonica(canonica);
  }

  private canonica(href: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  /** Inserta un bloque JSON-LD en el head (schema.org). */
  datosEstructurados(id: string, datos: object): void {
    const existente = this.doc.getElementById(id);
    existente?.remove();
    const script = this.doc.createElement('script');
    script.id = id;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(datos);
    this.doc.head.appendChild(script);
  }
}
