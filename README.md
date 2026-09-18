# Una vez más — sitio web

Embudo de ventas de **Una vez más**, dulces mexicanos de amaranto (alegrías, galletas y
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

## Cómo hablamos del producto

El producto lo surte un proveedor y **la producción es industrial**. El sitio no debe decir
"artesanal", "hecho a mano", "horneado" ni ningún verbo que implique que Una vez más produce
("elaboramos", "tostamos", "transformamos"). En México esas son declaraciones sustantivas y la
LFPC las puede tratar como publicidad engañosa.

La voz es **"nosotros lo escogemos"**, no "nosotros lo hacemos": escogemos, seleccionamos,
traemos, armamos (las charolas y canastitas sí las armamos). "Elegidos uno por uno" y "escogido
a mano" conservan la calidez sin mentir.

Afirmaciones que siguen en el sitio y **están pendientes de comprobar con la ficha técnica del
proveedor**: "miel de campo 100% pura", "Cacao mexicano al 70%", "100% Mexicano · Siembra
local", "100% Origen campesino local", "0% Jarabe artificial o aditivos", "Producción 100%
Fresca", "Hecho fresco bajo pedido", "Siembra limpia & comercio justo" y "Sin intermediarios".
Si el proveedor no las sostiene, hay que quitarlas.

## Desplegar

El sitio vive en **Cloudflare Pages**, conectado a este repo: cada `git push` a `main` publica solo.

**Ajustes del proyecto en Cloudflare** (Workers & Pages -> el proyecto -> Settings -> Build):

| Campo                  | Valor                               |
| ---------------------- | ----------------------------------- |
| Framework preset       | None                                |
| Build command          | `npm run build`                     |
| Build output directory | `dist/una_vez_mas_web_site/browser` |
| Root directory         | `/`                                 |

La versión de Node la fija `.node-version` (22.12.0, que es lo que pide Angular 21). El build
corre `prebuild` (regenera `sitemap.xml`) y `postbuild` (crea `404.html`) sin que haya que
configurar nada más.

**Dominio**: la dirección canónica es `www.unavezmasmx.com` — es la que emiten las etiquetas
`canonical`, Open Graph y el `sitemap.xml`, y sale de `url` en `site.json`. Si algún día cambia el
dominio, se cambia ahí y se regenera. El apex `unavezmasmx.com` redirige a `www` con una Redirect
Rule en Cloudflare.

**Archivos que sólo existen para el despliegue**:

- `public/_headers` — cabeceras de seguridad y de caché. Los bundles llevan hash en el nombre, así
  que van `immutable`; las imágenes se cachean una semana con `stale-while-revalidate`, para que al
  reemplazar una foto de producto no tarde en verse. El HTML lo revalida Cloudflare por omisión.
- `scripts/post-build.mjs` — copia `index.csr.html` a `404.html`. Cloudflare sirve ese archivo en
  las rutas que no existen: la URL responde 404 de verdad (lo correcto para buscadores) y el router
  de Angular muestra nuestra página de 404 en lugar de la genérica de Cloudflare.

Para publicar a mano sin pasar por GitHub: `npm run build` y subir la carpeta de salida, o
`npx wrangler pages deploy dist/una_vez_mas_web_site/browser` si tienes `wrangler` autenticado.

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
