# Una vez más — sitio web

Embudo de ventas de **Una vez más**, dulces mexicanos de amaranto (alegrías, galletas y
borrachitos). Angular 21, sólo front end: no hay backend y el "checkout" es WhatsApp con el
mensaje precargado. El sitio se compila a **HTML estático prerenderizado**, listo para publicar
en Netlify, Firebase Hosting, Vercel o GitHub Pages.

Portado del maquetado de Google Stitch que vive en
`Descargas/Una Vez Mas/sitio web/stitch_sitio_web_una_vez_m_s`.

## Correr y compilar

```bash
npm start            # http://localhost:4200
npm run build        # genera dist/una_vez_mas_web_site/browser (un HTML por página y por producto)
npm test             # Vitest
npm run test:scripts # las pruebas de los scripts de build
npm run catalogo     # baja el catálogo de la aplicación (el build ya lo hace solo)
npm run sitemap      # regenera public/sitemap.xml (el build ya lo hace solo)
```

`npm run build` no necesita servidor de Node: `outputMode: static` en `angular.json` deja HTML
plano. Se sube la carpeta `dist/una_vez_mas_web_site/browser` tal cual.

Antes de compilar, `prebuild` baja el catálogo de la aplicación de gestión y luego regenera el
sitemap. **Si la API no contesta, el build no se rompe**: usa la copia que está en el
repositorio y lo avisa en el log. Eso pasa siempre, por ejemplo, en la red de la oficina, que
bloquea el dominio. Para compilar contra una aplicación local:

```bash
CATALOGO_URL=http://localhost:4300/api/publico/catalogo npm run build
```

## Editar el contenido

Hay dos orígenes, y conviene no confundirlos.

### El catálogo lo manda la aplicación de gestión

Productos, categorías, fotos, precios, disponibilidad, descripción e ingredientes **se capturan
en la pantalla de Catálogo** de `gestion.unavezmasmx.com`, no aquí. Este repositorio no tiene
precios ni fotos de producto.

Ahí mismo se elige **quién sale en «Los Favoritos de la Casa»** de la portada: cada producto
tiene un switch y, cuando está prendido, su etiqueta («Clásico», «Para el café»), su guiño («El
favorito de Ami») y el texto de la tarjeta. Caben cuatro. El nombre, la foto, el precio y la
disponibilidad de esa tarjeta salen del propio producto; el color de la etiqueta, del lugar que
ocupa en la fila. Si no hay ninguno prendido, la sección no se pinta.

Y las tarjetas de **«Nuestras Categorías Dulces»** se capturan en la categoría, en la pestaña
Categorías de esa misma pantalla: título, insignia con su ícono, descripción, foto y texto del
enlace. **Sin foto no hay tarjeta**: la categoría sigue saliendo en las pastillas del catálogo,
pero no se anuncia en la portada. El color también sale del lugar que ocupa.

El sitio los lee de `GET /api/publico/catalogo`, cuyo contrato está en `docs/contrato-sitio.md`
del repositorio `una_vez_mas_gestion`. Llegan por dos caminos:

1. **Al compilar**, `scripts/generar-catalogo.mjs` guarda una copia en
   `src/app/content/catalogo.json`, junto con la URL de la que la bajó
   (`catalogo-origen.json`, que es contra la que se refresca el navegador). Esa copia es la que
   queda dentro del HTML estático: lo que indexa Google y lo que ve quien llega con JavaScript
   apagado. **No se edita a mano**; la que está commiteada arrancó siendo el catálogo tal como
   estaba escrito a mano, y el primer build contra la aplicación la sustituyó.
2. **En el navegador**, `CatalogService` vuelve a pedir el catálogo al cargar la página. Un
   precio nuevo o un producto agotado se ven en minutos, sin volver a publicar el sitio. Si la
   API no contesta, se queda a la vista la copia anterior.

Así que para cambiar un precio: se captura en la aplicación y ya. Publicar el sitio sólo hace
falta cuando entra un **producto nuevo**, para que tenga su propia página estática.

### Lo que sí vive aquí

Es maquetado, y está en **`src/app/content/`**:

| Archivo         | Qué controla                                                                       |
| --------------- | ---------------------------------------------------------------------------------- |
| `catalogo.json` | La copia del catálogo de la aplicación. **La genera el build**; no se edita a mano |
| `featured.json` | Los 4 "Favoritos de la Casa" de Inicio (apuntan a un producto por `productoId`)    |
| `showcase.json` | Las 3 tarjetas de categoría de Inicio                                              |
| `faq.json`      | Las preguntas frecuentes de Contacto                                               |
| `links.json`    | Los botones del link-in-bio de `/enlaces`                                          |
| `site.json`     | WhatsApp, correo, horario, redes y textos de marca                                 |
| `products.json` | **Ya no lo usa el sitio**: ver abajo                                               |

### `products.json`, `featured.json` y `showcase.json`, el puente

Son el catálogo y la portada como estaban escritos a mano antes de que la aplicación se hiciera
cargo. El sitio ya no los lee; se quedan porque dos herramientas de la aplicación los usan para
poblarla —los productos por slug, las categorías por nombre—:

```bash
# desde el repositorio una_vez_mas_gestion
npm run importar-fichas -- ../una_vez_mas_web_site   # fichas, portada y tarjetas de categoría
npm run subir-imagenes  -- ../una_vez_mas_web_site   # las fotos de productos/ y categorias/
```

Cuando las fichas, las tarjetas y las fotos estén en producción, estos tres archivos y las
fotos de `public/img/productos/`, `public/img/categorias/` y `public/img/destacados/` se pueden
borrar. Las de `destacados/`
están mejor compuestas que varias de producto: conviene subirlas en gestión como foto del
producto antes de perderlas. Las demás imágenes (portada, vitrinas, destacados,
mascotas) sí son del sitio y se quedan.

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

Las afirmaciones sobre el producto ya se revisaron una por una con el proveedor. El endulzante es
**miel de piloncillo**, no miel de abeja: "miel" a secas se entiende como miel de abeja en México,
así que el sitio dice piloncillo en todos lados. "100% Mexicano" es la única del grupo original
que quedó, porque es verdad. Se retiraron "Cacao mexicano al 70%", "Miel de campo 100% pura",
"Siembra local", "100% Origen campesino local", "0% Jarabe artificial o aditivos", "Hecho fresco
bajo pedido", "Hecho con miel", "Producción 100% Fresca", "comercio justo" y "Sin intermediarios".

Las métricas de la sección del amaranto salen del catálogo (`totalFamilias`, `totalProductos` en
`inicio.ts`), no de números escritos a mano: antes decían "100% Origen campesino local" y "0%
Jarabe artificial", y ahora no pueden quedarse viejas.

Un gancho que sí se puede usar y conviene repetir: **todas las galletas llevan amaranto**. Está en
el resumen de cada una, que ahora se escribe en la aplicación, y en la tarjeta de categoría de
Inicio. Por eso `scripts/generar-catalogo.mjs` pasa las fichas que bajan por esta misma lista de
frases prohibidas y avisa en el log: quien captura un producto no está leyendo este README.

Tampoco van **afirmaciones de salud** sobre el producto terminado ("sano", "nutritivo",
"saludable"): la NOM-051 las acota, y un dulce endulzado con piloncillo llevaría sello de exceso
de azúcares. Lo nutricional se le atribuye al **grano de amaranto**, que sí tiene fama ganada
("un grano mexicano que alimenta como pocos"), no al dulce.

Nota sobre "nuestra tierra": en singular es el modismo de "nuestro país" y es válido. Lo que no
va es "nuestras tierras", "nuestros cultivos", "nuestra cosecha" ni "cosechamos", que implican
ser dueño del cultivo.

**`npm run afirmaciones`** revisa que no reaparezcan: falla si encuentra una prohibida y avisa
de las que están por confirmar. Normaliza los espacios antes de buscar, porque Prettier parte
las frases entre líneas ("Hecho a\n mano en México") y un grep normal no las encuentra — así se
escondieron dos de ellas. Con `npm run afirmaciones dist` revisa el HTML ya compilado.

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
- **Fotografía de producto**: las que generó la IA de Stitch. Las fotos reales se suben en la
  aplicación, desde la pantalla de Catálogo; las editoriales (portada, vitrinas, destacados,
  mascotas) se reemplazan en `public/img/` con el mismo nombre.
- **Precios y presentaciones**: se capturan en la aplicación. Mientras estén en blanco, el sitio
  dice «Consulta precio».
- Los 4 destacados de Inicio ya no tienen nombre ni foto propios: la tarjeta usa los del
  producto. Lo que se escribe aparte es la etiqueta, el guiño y el texto, en la aplicación.
