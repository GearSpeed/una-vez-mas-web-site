import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';

export const routes: Routes = [
  // Link-in-bio: va fuera del shell, sin header ni footer.
  {
    path: 'enlaces',
    loadComponent: () => import('./pages/enlaces/enlaces').then((m) => m.Enlaces),
    data: {
      seo: {
        titulo: 'Enlaces y redes',
        descripcion:
          'Todos nuestros enlaces en un solo lugar: catálogo, WhatsApp, Instagram, TikTok, YouTube y contacto directo.',
      },
    },
  },
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
        data: {
          seo: {
            titulo: 'Antojitos ancestrales de amaranto',
            descripcion:
              'Alegrías, galletas y borrachitos de amaranto mexicano: los dulces de siempre, escogidos uno por uno. Pide directo por WhatsApp.',
          },
        },
      },
      {
        path: 'catalogo',
        loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.Catalogo),
        data: {
          seo: {
            titulo: 'Catálogo de dulces mexicanos',
            descripcion:
              'Galletas de avena, chocolate, coco y nuez; borrachitos de tequila, ron y Baileys; y alegrías tradicionales de amaranto. Los sabores de siempre, escogidos para compartir.',
          },
        },
        children: [
          {
            // El detalle vive sobre la grilla, en el <router-outlet> del catálogo.
            path: ':slug',
            loadComponent: () =>
              import('./pages/catalogo/producto-modal').then((m) => m.ProductoModal),
          },
        ],
      },
      {
        path: 'nosotros',
        loadComponent: () => import('./pages/nosotros/nosotros').then((m) => m.Nosotros),
        data: {
          seo: {
            titulo: 'Nuestra historia, Ami y Ranto',
            descripcion:
              'El amaranto es memoria, fortaleza y fiesta. Conoce el proyecto detrás de Una vez más y a Ami y Ranto, la semilla y la flor.',
            imagen: 'img/marca/ami-y-ranto.jpg',
          },
        },
      },
      {
        path: 'contacto',
        loadComponent: () => import('./pages/contacto/contacto').then((m) => m.Contacto),
        data: {
          seo: {
            titulo: 'Contacto y pedidos',
            descripcion:
              'Escríbenos por WhatsApp al +52 55 2660 4734 o por correo. Cotizamos mesas de dulces, eventos y pedidos especiales.',
          },
        },
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
        data: {
          seo: {
            titulo: 'Página no encontrada',
            descripcion: 'La página que buscas ya no existe. Vuelve al catálogo de antojitos.',
          },
        },
      },
    ],
  },
];
