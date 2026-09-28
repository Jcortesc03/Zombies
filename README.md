# 🎮 Zombi AI Assistant

Asistente de IA **responsive** que responde preguntas sobre la **saga de Call of Duty: Black Ops Zombies**.

Web app construida con **Node.js + JavaScript puro** (sin framework de frontend ni build step), con un asistente que usa **Gemini (plan gratuito)** y una base de conocimiento propia sobre la saga para responder con información fundamentada en lugar de inventar datos (*lore* de Zombies llena de trampas para los modelos).

---

## 📌 Características

- **Frontend responsive** (HTML + CSS + JS vanilla) adaptado a móvil, tablet y escritorio.
- **Chat en tiempo real** con interfaz de burbujas, indicador de "escribiendo" y autoguardado en `localStorage`.
- **Backend en Node.js + Express** con arquitectura por capas (rutas → controladores → servicios).
- **IA con Gemini** (`gemini-2.0-flash`) mediante el SDK oficial `@google/genai`.
- **RAG ligero**: recuperación de fragmentos relevantes de una base de conocimiento en JSON antes de generar la respuesta, para reducir alucinaciones sobre juegos concretos.
- **Historial de conversaciones persistente en SQLite** (`better-sqlite3`), sin servidor de base de datos externo.
- **Rate limiting y seguridad**: `helmet`, `cors`, `express-rate-limit` y validación de entrada.
- **Modo sin API key**: si no hay credenciales, el asistente responde con un proveedor simulado para poder desarrollar la interfaz sin depender de la red.

---

## 🗂️ Estructura de carpetas

```
agentes-de-ia/
├── public/                        # Frontend estático (servido por Express)
│   ├── index.html                 # Estructura de la página
│   ├── css/
│   │   ├── style.css              # Estilos base, tema oscuro y layout
│   │   └── responsive.css         # Breakpoints (móvil / tablet / escritorio)
│   ├── js/
│   │   ├── main.js                # Punto de entrada del cliente
│   │   ├── chat.js                # Lógica del chat (burbujas, scroll, estados)
│   │   ├── api.js                 # Cliente HTTP hacia /api
│   │   ├── ui.js                  # Renderizado de componentes y estados
│   │   └── storage.js             # Historial local (localStorage)
│   ├── assets/
│   │   ├── img/                   # Imágenes, logos, fondos
│   │   └── icons/                 # Iconos SVG
│   └── data/                      # Datos estáticos de UI (filtros de juegos, etc.)
│
├── src/                           # Backend Node.js
│   ├── server.js                  # Entry point: Express + middlewares + rutas
│   ├── config/
│   │   └── env.js                 # Carga y validación de variables de entorno
│   ├── routes/                    # Definición de endpoints (no contienen lógica)
│   │   ├── chat.routes.js         # POST /api/chat, streaming
│   │   ├── history.routes.js      # Historial de conversaciones
│   │   └── games.routes.js        # Catálogo de juegos de la saga
│   ├── controllers/               # Traducen HTTP <-> dominio
│   │   ├── chat.controller.js
│   │   ├── history.controller.js
│   │   └── games.controller.js
│   ├── services/                  # Lógica de negocio
│   │   ├── ai/
│   │   │   ├── gemini.service.js  # Cliente de Gemini (chat + embeddings)
│   │   │   ├── provider.js        # Selección de proveedor (real / mock)
│   │   │   └── prompt.builder.js  # Construcción del system prompt
│   │   ├── rag/
│   │   │   ├── knowledge.service.js  # Carga la base de conocimiento
│   │   │   ├── chunker.js            # Trocea documentos por entradas
│   │   │   └── retriever.js          # Búsqueda por relevancia (keyword scoring)
│   │   └── chat.service.js        # Orquesta IA + RAG + persistencia
│   ├── db/
│   │   ├── database.js            # Conexión SQLite + inicialización
│   │   ├── schema.sql             # Tablas: conversations, messages
│   │   └── seed.js                # Datos iniciales
│   ├── middleware/
│   │   ├── errorHandler.js        # Manejo centralizado de errores
│   │   ├── rateLimit.js           # Límite de peticiones
│   │   └── logger.js              # Log de peticiones
│   └── utils/
│       ├── logger.js
│       └── validation.js          # Validación de payloads
│
├── data/                          # Base de conocimiento de la saga
│   ├── knowledge/                 # Un JSON por juego (RAG)
│   │   ├── world-at-war.json      # Origins, Ascension, Verklungt...
│   │   ├── blackops.json          # Shangri-La, Nacht der Untoten...
│   │   ├── blackops2.json         # Nuketown, Origins2, Buried...
│   │   ├── blackops3.json         # Shadows of Evil, The Giant...
│   │   ├── blackops4.json         # Cold War, Alpha Omega, Mauer der Toten
│   │   ├── blackops6.json         # Liberty Falls, Terminus...
│   │   ├── cold-war.json          # Zombies de la Guerra Fría (1984)
│   │   └── vanguard.json          # Vanguarda, Der Eisendrache, Der Wunderland
│   ├── prompts/
│   │   └── system-prompt.md       # Prompt base del asistente
│   └── schemas/                   # Esquemas de validación de los JSON
│
├── scripts/
│   ├── seed-db.js                 # Crea la BD y carga los juegos
│   ├── test-gemini.js             # Prueba de conexión con la API
│   └── build-knowledge.js         # Reindexa la base de conocimiento
│
├── tests/
│   ├── unit/                      # Tests de servicios aislados
│   └── integration/               # Tests de endpoints con supertest
│
├── docs/
│   ├── api.md                     # Documentación de la API
│   └── arquitectura.md            # Decisiones de diseño
│
├── storage/                       # Base de datos SQLite generada (ignorada por git)
├── .env.example                   # Plantilla de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

---

## 🧠 Base de conocimiento

La IA se apoya en documentos propios por cada título de la saga. Cada archivo `data/knowledge/*.json` sigue este formato:

```json
{
  "game": "blackops3",
  "title": "Call of Duty: Black Ops III Zombies",
  "release": 2015,
  "maps": [
    {
      "name": "Shadows of Evil",
      "setting": "Morgan City, 1963",
      "characters": ["J Richtoff", "Maxis", "Richtoff"],
      "mysteries": "...",
      "perks": ["Juggernog", "Speed Cola", "Double Tap"],
      "weapons": "...",
      "easterEggs": ["Lost Tomb", "Shovel", "Yz(Player)"],
      "trivia": "..."
    }
  ]
}
```

El campo `trivia` es clave: alimenta la sección de **curiosidades** del chat y es donde el modelo suele inventar datos sin este contexto.

### Flujo de una pregunta

```
Usuario pregunta
   -> POST /api/chat
   -> chat.service
      -> rag.retriever  (busca en data/knowledge los mapas/jugadores/jóvenes relevantes)
      -> prompt.builder (system prompt + lore recuperado + historial)
      -> ai.provider     (Gemini o mock)
      -> db             (guarda usuario y respuesta)
   <- Respuesta en JSON
```

---

## 🚀 Instalación

### Requisitos previos

- **Node.js 20+** (`node -v`)
- Una **API key de Gemini** (gratis): [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar las variables de entorno
cp .env.example .env
# Edita .env y pega tu GEMINI_API_KEY

# 3. (Opcional) Comprobar la conexión con Gemini
npm run test:ai

# 4. Crear la base de datos y cargar los datos iniciales
npm run seed

# 5. Arrancar en desarrollo (con recarga automática)
npm run dev
```

Abre **http://localhost:3000** en el navegador.

### Producción

```bash
npm start
```

---

## 📜 Scripts disponibles

| Comando             | Descripción                                              |
| ------------------- | -------------------------------------------------------- |
| `npm start`         | Arranca el servidor en modo producción.                  |
| `npm run dev`       | Arranca con recarga automática (`node --watch`).          |
| `npm run seed`      | Crea la base SQLite y la rellena con los datos base.     |
| `npm run test:ai`   | Verifica que la clave de Gemini y el modelo responden.   |
| `npm run build:kb`  | Reindexa la base de conocimiento desde `data/knowledge`. |
| `npm test`          | Ejecuta la batería de tests.                             |
| `npm run lint`      | Revisa el estilo del código.                             |

---

## ⚙️ Variables de entorno

| Variable                 | Por defecto            | Descripción                                      |
| ------------------------ | ---------------------- | ------------------------------------------------ |
| `PORT`                   | `3000`                 | Puerto del servidor.                             |
| `NODE_ENV`               | `development`          | Entorno de ejecución.                            |
| `GEMINI_API_KEY`         | —                      | Clave de Gemini (obligatoria para IA real).      |
| `GEMINI_MODEL`           | `gemini-2.0-flash`     | Modelo usado. Flash por coste/latencia.          |
| `GEMINI_RPM`             | `10`                   | Requests por minuto (límite del plan gratuito).  |
| `GEMINI_MAX_TOKENS`      | `2048`                 | Tokens máximos por respuesta.                    |
| `GEMINI_TEMPERATURE`     | `0.7`                  | Temperatura de la generación.                    |
| `DB_PATH`                | `./storage/zombies.db` | Ruta del fichero SQLite.                         |
| `DB_ENABLED`             | `true`                 | Activa/desactiva la persistencia.                |
| `RAG_ENABLED`            | `true`                 | Activa la recuperación de contexto.              |
| `RAG_TOP_K`              | `5`                    | Fragmentos de contexto recuperados.              |
| `RAG_MIN_RELEVANCE`      | `0.3`                  | Corte de relevancia mínimo.                      |

> **Sobre el plan gratuito de Gemini**: el tier `free` tiene límites de peticiones por
> minuto y por día. `express-rate-limit` y el contador en `rateLimit.js` evitan que
> llegues al `429`, y el `retriever` recorta el contexto para gastar menos tokens.

---

## 🔌 API

| Método | Ruta                        | Descripción                                    |
| ------ | --------------------------- | ---------------------------------------------- |
| `GET`  | `/api/health`               | Estado del servidor y del proveedor de IA.     |
| `GET`  | `/api/games`                | Catálogo de juegos soportados.                 |
| `POST` | `/api/chat`                 | Envía una pregunta y recibe la respuesta.      |
| `GET`  | `/api/history`              | Lista las conversaciones guardadas.            |
| `GET`  | `/api/history/:id`          | Detalle de una conversación con sus mensajes. |
| `DELETE`| `/api/history/:id`         | Borra una conversación.                        |

Detalle de requests y ejemplos en [`docs/api.md`](docs/api.md).

---

## 📱 Responsive

- **Móvil (< 640px):** columna única, burbujas a pantalla completa, menú desplegable.
- **Tablet (640–1024px):** chat con panel lateral de historial plegable.
- **Escritorio (> 1024px):** chat en dos columnas (historial + conversación) y ancho máximo de lectura cómodo.

Todo el layout usa CSS Grid + Flexbox, sin frameworks ni dependencias de CSS.

---

## 🛡️ Seguridad

- `helmet` para cabeceras de seguridad.
- `cors` restringido a los orígenes permitidos.
- `express-rate-limit` en los endpoints de IA.
- Validación de payloads antes de llegar al servicio de IA.
- La `GEMINI_API_KEY` **solo existe en el servidor**; nunca se expone al navegador.

---

## 🧪 Tests

```bash
npm test
```

- `tests/unit/` — retriever, chunker, validación de la base de conocimiento.
- `tests/integration/` — endpoints `/api/chat` y `/api/history` con el proveedor simulado.

---

## 🗺️ Roadmap

- [ ] Cargar los JSON de `data/knowledge/` con la cronología completa de la saga.
- [ ] Sugerencias de preguntas en la interfaz ("¿Quién es Richtoff?").
- [ ] Filtro por juego en el selector del chat.
- [ ] Sistema de "ficha de mapa" cuando la respuesta menciona un nivel.
- [ ] Exportar conversaciones a Markdown.
- [ ] Docker + despliegue en un hosting gratuito (Render / Railway).

---

## 📄 Licencia

MIT — proyecto educativo.
