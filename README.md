# Una vez más — sitio web

Embudo de ventas de **Una vez más**, productos artesanales de amaranto (alegrías, galletas y
borrachitos). Angular 21, sólo front end: no hay backend y el "checkout" es WhatsApp con el
mensaje precargado. El sitio se compila a **HTML estático prerenderizado**, listo para publicar
en Netlify, Firebase Hosting, Vercel o GitHub Pages.

Portado del maquetado de Google Stitch que vive en
`Descargas/Una Vez Mas/sitio web/stitch_sitio_web_una_vez_m_s`.

## Correr y compilar

```bash
npm start          # http://localhost:4200
npm run build      # genera dist/una_vez_mas_web_site/browser (15 HTML estáticos)
npm test           # Vitest
npm run sitemap    # regenera public/sitemap.xml (el build ya lo hace solo)
```

`npm run build` no necesita servidor de Node: `outputMode: static` en `angular.json` deja HTML
plano. Se sube la carpeta `dist/una_vez_mas_web_site/browser` tal cual.

## Editar el contenido

Todo el texto, los productos y los datos de contacto están en **`src/app/content/`**. No hace
falta tocar componentes.

| Archivo         | Qué controla                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `products.json` | Los 9 productos del catálogo: nombre, descripción, ingredientes, imagen, **precio** y presentación |
| `featured.json` | Los 4 "Favoritos de la Casa" de Inicio (referencian un producto por `productoId`)                  |
| `showcase.json` | Las 3 tarjetas de categoría de Inicio                                                              |
| `faq.json`      | Las preguntas frecuentes de Contacto                                                               |
| `links.json`    | Los botones del link-in-bio de `/enlaces`                                                          |
| `site.json`     | WhatsApp, correo, horario, redes y textos de marca                                                 |

### Poner precios

En `products.json`, `precio` está en `null` y se muestra como **«Consulta precio»**. Para
publicar precios:

```json
"precio": 65,
"presentacion": "Paquete x 5 pzas"
```

Luego `npm run build` y subir. Los JSON se compilan dentro del bundle y se validan contra los
tipos de `src/app/core/models/`: **si falta un campo o el tipo no cuadra, el build falla** en vez
de romperse en producción.

> Si más adelante quieres cambiar precios sin recompilar, mueve `products.json` a
> `public/content/` y léelo con `HttpClient`. El único archivo a tocar es
> `src/app/core/services/catalog.ts`, que es la puerta única a los datos.

## Estructura

```
src/app/
├─ content/     los JSON de arriba + index.ts (carga tipada y validada)
├─ core/
│  ├─ layout/   shell, header (con drawer móvil), footer, dock de WhatsApp
│  ├─ models/   Producto, Destacado, Vitrina, Sitio, Faq, Enlace
│  └─ services/ catalog, whatsapp, seo, scroll-lock
└─ pages/       inicio, catalogo (+ producto-modal), nosotros, contacto, enlaces, no-encontrada
```

Rutas: `/inicio`, `/catalogo`, `/catalogo/:slug`, `/nosotros`, `/contacto` van dentro del shell.
`/enlaces` va **fuera** (es el link-in-bio de Instagram y TikTok, sin header ni footer).
`/catalogo/:slug` abre el detalle sobre la grilla como ruta hija: el enlace se puede compartir y
cada producto queda como HTML indexable.

## Design system

Los tokens del design system "Herencia y Alegría Artesanal" están en el bloque `@theme` de
`src/styles.css` (Tailwind v4). Son los mismos que el maquetado: `bg-primary-container`,
`font-body-md`, `text-headline-xl`, `px-margin`, `py-space-2xl`, etc.

⚠️ **Ojo con `DESIGN.md`**: su prosa nombra una paleta (`#800F35`, `#C91C59`, `#E8AD52`) distinta
a la de su frontmatter, y lo que manda es el **frontmatter**. Los hex de la prosa corresponden a
los tonos `*-container`; salieron de los colores reales del logo.

## Pendientes

- **Ilustraciones de Ami y Ranto**: las tarjetas de `/nosotros` usan los retratos que generó
  Stitch, que no siguen el estilo plano oficial de los personajes. Hacen falta recortes limpios
  de `Imágenes/Ami_diseño.png` y `Ranto_diseño.png` (el fondo del pliego tiene textura y no se
  recorta bien por programa).
- **Aviso de privacidad**: el maquetado tenía el enlace en el footer apuntando a `/enlaces`. Se
  retiró hasta que exista la página real.
- **Fotografía de producto**: las 20 imágenes son las que generó la IA de Stitch. Al haber foto
  real de los productos, se reemplazan en `public/img/` con el mismo nombre.
- **Precios y presentaciones** de los 9 productos.
- Revisar el mapeo de `featured.json` → `products.json` (los 4 destacados de Inicio usan otros
  nombres y precios que el catálogo, tal como venía el maquetado).
