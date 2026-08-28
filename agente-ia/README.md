# Agente IA + Landing + CRM — Óptica ALaVision

Sistema completo, propio, sin Kommo: una landing page profesional que vende y
agenda citas, un agente de WhatsApp con IA real (Claude, con Gemini como
respaldo automático), y un panel administrativo con CRM, control de imágenes
de la página, seguimiento de campañas de Meta Ads, remarketing secuenciado y
reportes en PDF.

## Qué incluye

- **Landing page** (`/`) — moderna, con hero, servicios, precios, cómo
  funciona, testimonios, ubicación (Google Maps) y formulario de "Agenda tu
  cita". Todo lo editable (logo, foto de portada, opacidad, direcciones,
  mapas) sale del panel administrativo, no del código.
- **Panel administrativo** (`/admin`, con usuario y clave) con 5 secciones:
  - **Conversaciones**: el CRM — ver cada chat, pausar la IA y escribir como
    humano, marcar un lead como cliente (con el valor de la venta), correo
    rápido.
  - **Citas**: todas las reservas hechas desde la landing, con su estado.
  - **Remarketing**: hasta 10 mensajes por lead, en secuencia — el botón de
    "Enviar" solo se activa cuando ya pasó el tiempo configurado desde el
    mensaje anterior (así se manda uno por uno, a tiempo, sin saturar el
    número de WhatsApp). Las 10 plantillas y sus tiempos de espera son
    editables ahí mismo.
  - **Configuración**: subir logo y foto de portada, ajustar la opacidad del
    overlay, direcciones y URLs de Google Maps de las 2 sedes, número de
    WhatsApp.
  - **Reportes**: seguimiento en vivo (leads totales, de Meta Ads,
    convertidos, tasa de conversión, valor vendido) + botón para descargar un
    PDF de un rango de fechas.
- **Agente con Claude** (`claude-opus-5`), y **Gemini como respaldo
  automático** si la llamada a Claude falla — como pediste, ya que Gemini es
  el que la óptica tiene contratado. Ambos leen fotos de fórmulas
  directamente (no solo "detectan que hay una imagen", como en Kommo).
- **Seguimiento de campaña**: cuando un lead llega desde un anuncio de
  "Click to WhatsApp" de Meta, se guarda automáticamente su origen; en la
  landing, los `utm_source`/`utm_campaign` del enlace también quedan
  asociados a la cita. Puedes marcar manualmente quién sí compró para medir
  la efectividad real de la pauta.
- **Confirmación de cita por correo y WhatsApp**, con botón "Cómo llegar"
  hacia la URL de Google Maps que configures.

## Lo que necesitas configurar para que todo funcione (nada de esto lo tengo yo)

1. **WhatsApp Cloud API** (igual que antes — ver más abajo).
2. **Clave de Anthropic** (`ANTHROPIC_API_KEY`) — el agente principal.
3. **Clave de Gemini** (`GEMINI_API_KEY`) — el respaldo. Se saca gratis en
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (o desde
   tu cuenta de Google Cloud si ya pagas Gemini ahí). Si en algún momento
   Google cambia el nombre del modelo y empieza a fallar, ajusta
   `GEMINI_MODEL` en las variables de entorno.
4. **Resend** (`RESEND_API_KEY`) — para los correos de confirmación de cita.
   Cuenta gratis en [resend.com](https://resend.com) (alcanza de sobra para
   el volumen de una óptica). Necesitas verificar tu dominio ahí para que los
   correos no caigan en spam — Resend te guía paso a paso.
5. **URLs de Google Maps** de tus 2 sedes — se configuran desde el panel
   (`/admin` → Configuración), no hace falta clave de API de Google Maps.
   Para conseguir la URL: busca tu sede en Google Maps → Compartir → Insertar
   un mapa → copia el `src="..."` del código que te da.

## Requisitos de WhatsApp Cloud API

- Entra a [developers.facebook.com](https://developers.facebook.com) →
  crear una app tipo "Business" → agregar el producto **WhatsApp**.
- Copia el **Token de acceso** y el **Phone Number ID** → van en `.env`.
- En "Configuration → Webhook", pon la URL de tu servidor + `/webhook`
  (ej. `https://tu-app.up.railway.app/webhook`) y el mismo
  `WHATSAPP_VERIFY_TOKEN` de tu `.env`. Suscríbete al campo `messages`.

## Instalación local

```bash
npm install
cp .env.example .env
# edita .env con tus claves reales
npm run dev
```

- Landing: `http://localhost:3000/`
- Panel administrativo: `http://localhost:3000/admin` (pide el usuario/clave
  del `.env`)

Para que Meta llame tu webhook mientras pruebas en tu computador, expón el
puerto con `ngrok http 3000` y usa esa URL en la configuración del webhook.

## Desplegarlo de verdad (recomendado: Railway)

1. Crea una cuenta en [railway.app](https://railway.app).
2. "New Project" → "Deploy from GitHub repo" → conecta este repositorio y
   selecciona la carpeta `agente-ia`.
3. En "Variables", agrega todas las del `.env.example` con tus valores reales.
4. En "Settings → Volumes", agrega un volumen montado en `/data` y cambia
   `DB_PATH` a `/data/alavision.db` — así ni la base de datos ni las
   imágenes que subas desde el panel se pierden en cada despliegue.
5. Railway te da una URL pública — úsala para el webhook de Meta y para
   compartir la landing.

## Costos aproximados a tener en cuenta

- **Anthropic (Claude)**: por uso/tokens. Barato por conversación típica;
  pide una estimación con tu volumen real antes de lanzar a toda la pauta.
- **Gemini**: solo se usa si Claude falla — el costo adicional es marginal.
- **WhatsApp Cloud API**: Meta cobra por conversación iniciada, con franja
  gratuita mensual.
- **Resend**: plan gratis cubre varios miles de correos al mes.
- **Railway**: desde unos pocos dólares al mes para este tamaño de app.

## Remarketing — cómo funciona el "botón que se enciende solo"

Cada lead avanza por hasta 10 mensajes en orden. El primero está siempre
disponible; los siguientes se habilitan según el tiempo configurado en cada
plantilla (por defecto: inmediato, +24h, +48h, +72h, +4 días, +7 días, +7
días, +14 días, +14 días, +30 días — una cadencia típica de "insistir rápido
al inicio, espaciar después"). Tú decides cuándo hacer clic en "Enviar" — el
sistema solo te dice cuándo ya es momento, nunca envía nada solo. Así evitas
sobrecostos de WhatsApp y no quemas el número por enviar de más.

## Lo que NO incluye todavía (para que no haya sorpresas)

- Envío masivo automático — es intencional, para cuidar el número de
  WhatsApp y los costos, como pediste.
- Pagos en línea.
- Multiusuario/roles en el panel — un solo usuario y clave para todo el
  equipo, pensado para un negocio pequeño.
- Sincronización automática de campañas de Meta Ads más allá del parámetro
  de referido que ya llega en el mensaje de WhatsApp y los `utm_*` de la
  landing — no hay integración directa con el Administrador de Anuncios.

## Próximos pasos sugeridos

- Conectar recordatorio automático de cita (24h y 2h antes) por WhatsApp.
- Agregar más imágenes editables por sección (servicios, testimonios).
- Exportar los leads con `#BaseEmail`/correo guardado a una herramienta de
  mail marketing.
