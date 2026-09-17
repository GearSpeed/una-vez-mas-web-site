export interface RedSocial {
  readonly id: string;
  readonly nombre: string;
  readonly usuario: string;
  readonly url: string;
  readonly icono: string;
  /** Qué se publica ahí; se muestra encima del nombre. */
  readonly tema: string;
}

export interface Sitio {
  readonly nombre: string;
  readonly lema: string;
  readonly descriptor: string;
  readonly claim: string;
  readonly dominio: string;
  readonly url: string;
  readonly whatsapp: { readonly numero: string; readonly visible: string };
  readonly correo: string;
  readonly horario: string;
  readonly redes: readonly RedSocial[];
}

export interface Faq {
  readonly id: number;
  readonly pregunta: string;
  /** Párrafos de la respuesta. */
  readonly respuesta: readonly string[];
  /** Si la respuesta remata con un botón al catálogo. */
  readonly enlaceCatalogo?: string;
}

/** Botón del link-in-bio de /enlaces. */
export interface Enlace {
  readonly id: string;
  readonly titulo: string;
  readonly detalle: string | null;
  readonly icono: string;
  /** `ruta` navega dentro del sitio; `url` sale a otro dominio o a mailto. */
  readonly ruta?: string;
  readonly url?: string;
  /** Mensaje de WhatsApp, cuando aplica. */
  readonly waTexto?: string;
  readonly estilo: 'destacado' | 'whatsapp' | 'normal';
  readonly iconoColor?: string;
}
