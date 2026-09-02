# Agente IA + Landing + CRM — Óptica ALaVision

Sistema completo, propio, sin Kommo: una landing page profesional que vende y
agenda citas, un agente de WhatsApp con IA real (Claude, con Gemini como
respaldo automático), y un panel administrativo con CRM, control de imágenes
de la página, seguimiento de campañas de Meta Ads, remarketing secuenciado y
reportes en PDF.

## Qué incluye

- **Landing page** (`/`) — hero, banda animada de logos de marcas, sección de
  "más vendidos", precios, cómo funciona, **Encuentra tu combo ideal** y
  **Encuentra tu montura ideal** (ver abajo), testimonios, ubicación (Google
  Maps) y formulario de "Agenda tu cita". Botón flotante de **"Asesoría
  virtual"** (chat en vivo) además del de WhatsApp. Botones con efecto de
  brillo/luz al pasar el mouse. Todo lo editable (logo, foto de portada,
  opacidad, direcciones, mapas, marcas, productos) sale del panel
  administrativo, no del código.
- **Tienda virtual** (`/tienda`) — sub-landing estilo Shopify: catálogo
  filtrable por marca, carrito (guardado en el navegador) y checkout que arma
  el pedido y lo manda por WhatsApp (no hay pasarela de pagos conectada).
- **Chat en vivo ("Asesoría virtual")** — botón flotante en toda la landing
  que abre una ventana de chat real con Vale (el mismo agente con IA del
  WhatsApp, ver abajo), sin salir de la página. Cada conversación queda en el
  CRM (`/admin` → Conversaciones) igual que las de WhatsApp, identificada como
  origen "chat_web" — si una asesora pausa la IA y responde desde el panel, su
  respuesta le llega al visitante ahí mismo (con una sincronización de fondo
  cada pocos segundos).
- **Encuentra tu combo ideal**: el visitante elige cómo contarte su caso —
  responder 4 preguntas cortas, subir la foto de su fórmula, o escribir su
  situación con sus propias palabras — y Claude/Gemini lo analiza (leyendo la
  foto si la envió) para darle un resultado personalizado con el combo
  recomendado y el porqué, nunca una respuesta genérica repetida. Siempre
  termina con un botón "Agendar por WhatsApp" que abre el chat con un mensaje
  ya redactado con su nombre y su resultado, listo para que la asesora lo lea
  y cierre la cita o la venta. Cada análisis queda guardado (con la foto, si
  la hubo) y aparece en el panel → Reportes, exportable en CSV.
- **Encuentra tu montura ideal**, con **probador en vivo estilo filtro de
  Instagram/Snapchat**: el visitante activa la cámara y ve las monturas
  puestas sobre su propio rostro en tiempo real, moviéndose con él —
  calculando la posición, el tamaño y la inclinación exacta según sus ojos
  en cada cuadro de video, cuadro por cuadro (misma tecnología de detección
  facial que apps como la de Ray-Ban o Warby Parker — corre en el navegador
  del visitante, sin costo de IA). Toca cualquier miniatura de la fila de
  abajo para cambiar de montura al instante, sin cortar la cámara, y puede
  guardar una foto del resultado. Es la puerta de entrada más rápida, desde
  el botón dorado "🎥 Probador en vivo con la cámara". También sigue
  disponible la opción de tomar o subir una foto para que la IA analice la
  forma del rostro (ovalado, redondo, cuadrado, etc.) y recomiende estilos
  primero — desde ese resultado, "Pruébatelas ahora" abre el mismo probador
  en vivo, ya con esas recomendaciones priorizadas en la fila de miniaturas.
  Termina con "Me gusta, agendar por WhatsApp" para la montura elegida.
  **Para que una montura aparezca en el probador**, necesita su "foto sin
  fondo" — y no hace falta ninguna herramienta externa: desde `/admin` →
  Tienda → Productos, el botón **"✂️ Recortar"** (en cada producto ya
  cargado) o **"✂️ o recórtala aquí mismo"** (al agregar uno nuevo) abre un
  editor propio donde solo hay que hacer clic sobre el fondo de la foto para
  volverlo transparente (repite el clic si el fondo tiene varias zonas o
  colores) y guardar. Las monturas sin esa foto igual aparecen normalmente
  en la tienda, solo no salen en el probador. El análisis de forma de rostro
  (con IA) y el probador virtual (sin IA, gratis) tienen límites de
  solicitudes por visitante independientes para evitar abuso.
- **Panel administrativo** (`/admin`, con usuario y clave) con 8 secciones:
  - **Conversaciones**: el CRM — ver cada chat, pausar la IA y escribir como
    humano, marcar un lead como cliente (con el valor de la venta), correo
    rápido.
  - **Embudo**: tablero por etapas (Nuevo, Calificando, Propuesta enviada,
    Objeción, Cita agendada, Ganado, Perdido), igual a los de Kommo o
    HubSpot — cada lead que llega, incluyendo los que entran desde un
    anuncio de Meta Ads (se les ve una etiqueta azul "📣" con el nombre de
    la campaña), aparece como una tarjeta en su etapa actual. Arrastra una
    tarjeta a otra columna para cambiar su etapa, o usa el enlace "Mover
    a..." de la tarjeta; un clic en la tarjeta abre esa conversación
    completa. Un filtro "Solo leads de Meta Ads" deja ver nada más los que
    vienen de pauta, para priorizar el remarketing sobre esos.
  - **Citas**: todas las reservas hechas desde la landing, con su estado.
  - **Remarketing**: hasta 10 mensajes por lead, en secuencia — el botón de
    "Enviar" solo se activa cuando ya pasó el tiempo configurado desde el
    mensaje anterior (así se manda uno por uno, a tiempo, sin saturar el
    número de WhatsApp). Las 10 plantillas y sus tiempos de espera son
    editables ahí mismo.
  - **Tienda**: subir logos de marcas (alimentan la banda animada) y
    productos (imagen, precio, marca, categoría, si aparece en "más
    vendidos").
  - **Configuración**: subir logo y foto de portada, ajustar la opacidad del
    overlay, direcciones y URLs de Google Maps de las 2 sedes, número de
    WhatsApp.
  - **Reportes**: seguimiento en vivo (leads totales, de Meta Ads,
    convertidos, tasa de conversión, valor vendido), descarga de PDF por
    rango de fechas, y la base de datos de la Asesoría virtual en CSV (con
    el análisis de cada persona y el link a su foto, si subió una).
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
2. **Solo necesitas UNA clave de IA, no las dos:**
   - **Si solo tienes Gemini** (tu caso): deja `ANTHROPIC_API_KEY` vacía en el
     `.env` y llena `GEMINI_API_KEY` con tu clave de Gemini (la de tu cuenta
     paga, o una gratis en
     [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).
     El agente usa Gemini directamente como motor principal — no necesita
     Claude para nada. Si en algún momento Google cambia el nombre del
     modelo y empieza a fallar, ajusta `GEMINI_MODEL` en las variables de
     entorno.

     ⚠️ **Importante sobre tu clave de Gemini**: tu suscripción paga de
     Gemini (la app de Gemini / Google One) es una cosa, y la **clave de la
     API de desarrollador** (la que pusiste en `GEMINI_API_KEY`) es otra
     totalmente aparte — no se conectan automáticamente. Mientras el
     proyecto de Google Cloud detrás de esa clave no tenga facturación
     activada, queda en el **nivel gratuito**, con un límite muy bajo (por
     ejemplo, 20 solicitudes al día para algunos modelos) — se agota en
     minutos con clientes reales usando el chat y las herramientas de la
     landing. Para que el bot funcione de verdad en producción:
     1. Ve a [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
        (con la misma cuenta de tu clave) → busca la opción de **facturación
        / upgrade a pago por uso ("Pay-as-you-go")**.
     2. Vincula una tarjeta o cuenta de facturación de Google Cloud a ese
        proyecto — el costo por conversación es bajo (ver "Costos
        aproximados" más abajo), pero sin esto el límite gratuito se queda
        corto casi de inmediato.
     3. Si ves respuestas fallidas o el mensaje de error mencionando "quota"
        o "Free Tier" en los logs de Railway, esta es la causa.
   - **Si más adelante consigues también Anthropic** (`ANTHROPIC_API_KEY`,
     console.anthropic.com), el agente pasa a usar Claude como principal y
     Gemini queda de respaldo automático si Claude falla.
3. **Resend** (`RESEND_API_KEY`) — para los correos de confirmación de cita.
   Cuenta gratis en [resend.com](https://resend.com) (alcanza de sobra para
   el volumen de una óptica). Necesitas verificar tu dominio ahí para que los
   correos no caigan en spam — Resend te guía paso a paso.
4. **URLs de Google Maps** de tus 2 sedes — se configuran desde el panel
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

- **Anthropic (Claude) o Gemini**: por uso/tokens. Barato por conversación o
  análisis típico; pide una estimación con tu volumen real antes de lanzar a
  toda la pauta. Ahora hay cuatro puntos que consumen IA: el agente de
  WhatsApp, el chat en vivo de la landing, "Encuentra tu combo ideal" y
  "Encuentra tu montura ideal" (los tres de la landing tienen límite de
  solicitudes por visitante para controlar el gasto). Ver la nota sobre
  facturación de Gemini más arriba — sin eso, ninguno de estos va a
  funcionar más allá de unas pocas pruebas al día.
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
- **Pagos en línea en la tienda** — el carrito arma el pedido y lo manda por
  WhatsApp para cerrar la venta ahí; si más adelante quieres cobro real
  (tarjeta/PSE), se conecta una pasarela como Wompi o PayU, pero necesita
  cuenta comercial propia primero.
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
