import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITIO } from '../../content';
import { WhatsappService } from '../../core/services/whatsapp';

interface Mascota {
  readonly nombre: string;
  readonly papel: string;
  readonly insignia: string;
  readonly estatura: string;
  readonly imagen: string;
  readonly alt: string;
  readonly puntoColor: string;
  readonly manchaColor: string;
  readonly descripcion: string;
  readonly rasgos: readonly {
    readonly icono: string;
    readonly color: string;
    readonly texto: string;
  }[];
  readonly frase: string;
  readonly fraseIconoColor: string;
}

@Component({
  selector: 'uvm-nosotros',
  imports: [RouterLink],
  templateUrl: './nosotros.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nosotros {
  protected readonly sitio = SITIO;
  protected readonly waSaludo = inject(WhatsappService).enlace(
    'Hola Una vez más! Leí sobre Ami y Ranto y me gustaría hacer un pedido',
  );

  protected readonly mascotas: readonly Mascota[] = [
    {
      nombre: 'Ami',
      papel: '· La semilla',
      insignia: 'La Semilla Curiosa',
      estatura: 'Estatura chibi: ~6 cm',
      imagen: 'img/mascotas/ami.jpg',
      alt: 'Ami, la semilla de amaranto, con sombrero de palma, hoja verde, paliacate borgoña y su canastita de antojitos',
      puntoColor: 'bg-tertiary-fixed-dim',
      manchaColor: 'bg-tertiary-fixed/30',
      descripcion:
        'Ami es una pequeña semilla de amaranto llena de energía, curiosidad y alegría. Representa la pureza de nuestra semilla, la tradición y el amor por lo hecho de manera natural.',
      rasgos: [
        { icono: 'grass', color: 'text-primary', texto: 'Sombrero con hoja tierna' },
        { icono: 'loyalty', color: 'text-secondary', texto: 'Paliacate borgoña' },
        {
          icono: 'shopping_basket',
          color: 'text-on-tertiary-fixed-variant',
          texto: 'Canastita de antojitos',
        },
      ],
      frase: '«¡Pequeñas semillas, grandes historias llenas de amor y antojo!»',
      fraseIconoColor: 'text-primary',
    },
    {
      nombre: 'Ranto',
      papel: '· La flor',
      insignia: 'La Flor Protectora',
      estatura: 'Estatura chibi: ~7 cm',
      imagen: 'img/mascotas/ranto.jpg',
      alt: 'Ranto, la flor de amaranto magenta, con sombrero de campo y una canasta de mimbre llena de dulces tradicionales',
      puntoColor: 'bg-secondary',
      manchaColor: 'bg-primary-fixed/40',
      descripcion:
        'Ranto es la flor de amaranto hecha personaje. Representa la fuerza, la tradición y la generosidad de nuestra tierra. Siempre está listo para compartir lo mejor de nuestra esencia.',
      rasgos: [
        { icono: 'palette', color: 'text-secondary', texto: 'Tonalidad magenta viva' },
        { icono: 'spa', color: 'text-primary', texto: 'Textura floreada de espiga' },
        {
          icono: 'sentiment_very_satisfied',
          color: 'text-on-tertiary-fixed-variant',
          texto: 'Sonrisa cálida y generosa',
        },
      ],
      frase: '«¡Tradición que florece siempre contigo en cada rincón de México!»',
      fraseIconoColor: 'text-secondary',
    },
  ];

  protected readonly compromisos = [
    {
      icono: 'bakery_dining',
      fondo: 'bg-primary-container text-on-primary',
      titulo: 'Sabores de siempre, bien escogidos',
      texto:
        'Probamos cada producto antes de ofrecerlo y trabajamos con proveedores que cuidan el punto del tostado y del caramelo.',
      pieIcono: 'check_circle',
      pieTexto: 'Calidad en cada lote',
      pieColor: 'text-primary',
    },
    {
      icono: 'support_agent',
      fondo: 'bg-secondary text-on-secondary',
      titulo: 'Trato humano, cercano y directo',
      texto:
        'Sin formularios fríos ni carritos enredados. Te atendemos directamente en WhatsApp como en una tiendita de barrio, resolviendo pedidos y antojos personalizados.',
      pieIcono: 'chat',
      pieTexto: 'Respuesta rápida y atenta',
      pieColor: 'text-secondary',
    },
    {
      icono: 'featured_seasonal_and_gifts',
      fondo: 'bg-tertiary-container text-on-tertiary-container',
      titulo: 'Empaques pensados para regalar',
      texto:
        'Detalles listos para obsequiar a tus seres queridos, compartir en reuniones o consentirte con un antojo que luce tan hermoso como sabe.',
      pieIcono: 'favorite',
      pieTexto: 'Presentaciones con amor',
      pieColor: 'text-primary',
    },
  ] as const;
}
