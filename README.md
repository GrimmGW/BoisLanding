# 🥊 BoisGang · Landing platform fighters

> 🎮 *Una vitrina web para la escena de platform fighters y los eventos de la comunidad.*

Landing **personal** para BoisGang: presenta la comunidad, próximos torneos en start.gg, enlaces a redes y contacto. Está hecha con React y Bulma, pensada para verse bien en móvil y escritorio.

---

## ✨ Qué hace la página

| Área | Descripción |
|------|-------------|
| 🏠 **Hero** | Identidad visual, navegación al resto del sitio y accesos rápidos a redes. |
| 🏆 **Torneos** | Lista y cuadrícula de eventos **próximos** (paginación) y modal con **todos** los torneos del organizador; etiqueta **NUEVO** en los que siguen siendo “upcoming”. |
| 👥 **Nosotros** | Sección “Quiénes somos”, métricas y enlace a Instagram. |
| 🖼 **Galería** | Bento en escritorio, carrusel en móvil; **preview ligera** en tarjetas y **imagen grande** al abrir el lightbox (ver abajo). |
| 📬 **Contacto** | Formulario y enlaces (WhatsApp, correo, etc.). |
| 🔗 **Footer** | CTA a Telegram, branding y enlaces. |

En **desarrollo local**, las rutas `/api/*` pueden servirse con un proxy Express. En **producción (Vercel)**, la misma lógica corre como **serverless functions** bajo `/api`.

### Galería: una foto en repo, dos salidas en build

En [`src/gallery/gallerySources.js`](src/gallery/gallerySources.js) cada archivo de [`assets/images/gallery-assets/`](assets/images/gallery-assets/) se importa **dos veces** con query params de [`vite-imagetools`](https://github.com/JonasKruckenberg/imagetools) (p. ej. ancho y calidad distintos). En `npm run build`, Vite genera WebP optimizado: **preview** para la cuadrícula/carrusel y **full** para el lightbox, sin duplicar los originales en el repositorio.

---

## 🔌 Conexión con start.gg y GraphQL

La app **no** llama a start.gg desde el navegador: el token vive solo en el servidor.

- **Endpoint:** `https://api.start.gg/gql/alpha` (API GraphQL “alpha” de start.gg).
- **Autenticación:** cabecera `Authorization: Bearer <STARTGG_API_TOKEN>`.
- **Consultas:** se usa una query que filtra torneos por **`ownerId`** (organizador) y, según el caso, por **`upcoming: true`** para los próximos eventos.
- **Datos normalizados:** cada torneo expone al frontend campos como `id`, `nombre`, `startAt`, `url`, `imagen`, etc., tras mapear la respuesta de GraphQL.

Variables de entorno relevantes (ver [`.env.example`](.env.example)):

- `STARTGG_API_TOKEN` — obligatorio para que funcionen `/api/tournaments/*`.
- `STARTGG_OWNER_ID` — ID del organizador en start.gg cuyos torneos se muestran.

---

## 🛠️ Scripts útiles

```bash
npm install
npm run dev          # frontend Vite
npm run dev:server   # proxy API local (en otra terminal, si aplica)
npm run build
npm run preview      # revisar el build
```

---

## 📜 Licencias

### Este proyecto

Proyecto **personal** de uso y portafolio; no se incluye aquí una licencia opensource genérica. Si reutilizas fragmentos, respeta las licencias de las librerías listadas abajo.

### Dependencias principales (referencia)

| Paquete | Licencia habitual |
|---------|-------------------|
| React / react-dom | MIT |
| Vite | MIT |
| vite-imagetools | MIT |
| sharp (dependencia de imagetools) | Apache-2.0 |
| Bulma | MIT |
| Express | MIT |
| cors | MIT |
| dotenv | BSD-2-Clause |

Los textos legales exactos están en cada paquete dentro de `node_modules/<paquete>/LICENSE` tras instalar dependencias.

---

## 👤 Desarrollador

**Ing. Hector Luna (Grimm)**

---

*Última actualización del README acorde al estado del repositorio.*
