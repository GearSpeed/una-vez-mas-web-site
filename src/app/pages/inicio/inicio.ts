import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITIO } from '../../content';
import { CatalogService } from '../../core/services/catalog';
import { SeoService } from '../../core/services/seo';
import { WhatsappService } from '../../core/services/whatsapp';
import {
  avisoDisponibilidad,
  precioVisible,
  type Producto,
  type Tono,
  TONOS,
  waTextoDe,
} from '../../core/models/producto';

@Component({
  selector: 'uvm-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio {
  private readonly catalogo = inject(CatalogService);
  private readonly wa = inject(WhatsappService);

  protected readonly sitio = SITIO;
  protected readonly vitrinas = this.catalogo.vitrinas;
  /**
   * «Los Favoritos de la Casa»: cuáles salen y qué dice su tarjeta se elige en la
   * aplicación. Si no hay ninguno, la sección entera no se pinta.
   */
  protected readonly destacados = this.catalogo.destacados;

  /**
   * Las métricas de la sección del amaranto salen del catálogo, no de números
   * escritos a mano: así no envejecen cuando se agreguen o quiten productos.
   */
  protected readonly totalProductos = computed(() => this.catalogo.productos().length);
  protected readonly totalFamilias = this.catalogo.vitrinas.length;

  protected readonly waProductos = this.wa.enlace(
    'Hola Una vez más! Me gustaría conocer más sobre sus productos',
  );
  protected readonly waAntojo = this.wa.enlace(
    'Hola Una vez más! Se me antojaron sus productos, ¿me pueden compartir más detalles?',
  );

  /** Color del texto de la píldora de categoría y del enlace de la tarjeta. */
  protected readonly textoTono: Record<Tono, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-on-tertiary-fixed-variant',
  };

  /** Mancha decorativa de la esquina de cada tarjeta de categoría. */
  protected readonly manchaTono: Record<Tono, string> = {
    primary: 'bg-primary-fixed/20',
    secondary: 'bg-secondary-fixed/30',
    tertiary: 'bg-tertiary-fixed/30',
  };

  /** Tono del texto de la etiqueta de un destacado ("Clásico", "Intenso"...). */
  protected readonly etiquetaTono: Record<Tono, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-on-tertiary-fixed-variant',
  };

  constructor() {
    inject(SeoService).datosEstructurados('ld-negocio', {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: SITIO.nombre,
      description: SITIO.descriptor,
      url: SITIO.url,
      image: `${SITIO.url}/og/og-default.jpg`,
      telephone: `+${SITIO.whatsapp.numero}`,
      email: SITIO.correo,
      priceRange: '$',
      address: { '@type': 'PostalAddress', addressCountry: 'MX' },
      openingHours: 'Mo-Sa 09:00-19:00',
      sameAs: SITIO.redes.map((r) => r.url),
    });
  }

  protected waDestacado(producto: Producto): string {
    return this.wa.enlace(waTextoDe(producto));
  }

  protected precio(producto: Producto): string | null {
    return precioVisible(producto.precio);
  }

  protected aviso(producto: Producto): string | null {
    return avisoDisponibilidad(producto.disponibilidad);
  }

  /** El color sale del lugar que ocupa la tarjeta: así nunca quedan cuatro iguales. */
  protected tonoDe(posicion: number): Tono {
    return TONOS[posicion % TONOS.length];
  }
}
