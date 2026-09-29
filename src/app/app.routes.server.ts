import { RenderMode, ServerRoute } from '@angular/ssr';
import { PRODUCTOS } from './content';

export const serverRoutes: ServerRoute[] = [
  {
    // Un HTML estático por producto: enlaces que se pueden compartir por
    // WhatsApp y que Google puede indexar.
    path: 'catalogo/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PRODUCTOS.map((p) => ({ slug: p.slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
