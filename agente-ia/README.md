# Agente IA — Óptica ALaVision

Un agente de WhatsApp con IA real (no botones de árbol rígido) + un panel CRM
propio, a la medida de la óptica. Reemplaza al bot de Kommo: aquí Vale (el
agente) entiende lo que el paciente escribe, sabe leer fotos de fórmulas, y
decide sola qué preguntar, qué combo recomendar y cuándo pasar a un humano —
siguiendo las reglas de negocio de `../estrategia-kommo/`.

## Qué incluye

- **Webhook de WhatsApp Cloud API** (oficial de Meta, sin intermediarios de pago).
- **Agente con Claude** (`claude-opus-5`) que responde de forma estructurada:
  cada turno decide el mensaje, hasta 3 botones, la etapa del pipeline, el
  nivel de interés, las etiquetas, y si hace falta un humano.
- **Lectura de fórmulas por foto**: si el paciente manda una imagen, el
  agente la mira directamente e intenta leerla (no solo "detecta que hay una
  imagen", como en Kommo).
- **Base de datos propia** (SQLite) con leads, conversación completa y estado.
- **Panel CRM** simple: lista de conversaciones, ver el hilo completo, pausar
  la IA y escribir como humano, cambiar la etapa a mano.

## Lo que NO incluye (para que no haya sorpresas)

- Calendario / agendamiento automático de citas (queda como paso manual del
  humano cuando el paciente dice que sí quiere agendar).
- Cobros o pagos en línea.
- Envío de correos (el agente pide el correo y lo guarda, pero enviar la
  cotización por email es un paso manual por ahora).
- Multiusuario/roles en el panel — es un solo usuario y clave para todo el
  equipo, pensado para un negocio pequeño.

## Requisitos antes de arrancar

1. **Cuenta de WhatsApp Cloud API de Meta** (gratis, directo de Meta, sin
   intermediario):
   - Entra a [developers.facebook.com](https://developers.facebook.com) →
     crear una app tipo "Business" → agregar el producto **WhatsApp**.
   - Ahí Meta te da: un **número de prueba** (para probar ya mismo) y luego
     puedes conectar tu número real de la óptica.
   - Copia el **Token de acceso temporal** (o genera uno permanente con un
     usuario de sistema) y el **Phone Number ID** — van en `.env`.
   - En "Configuration → Webhook", pon la URL de tu servidor +
     `/webhook` (ej. `https://tu-app.up.railway.app/webhook`) y el mismo
     `WHATSAPP_VERIFY_TOKEN` que pongas en tu `.env`. Suscríbete al campo
     `messages`.

2. **Clave de la API de Anthropic**: [console.anthropic.com](https://console.anthropic.com)
   → API Keys → crear una. Este agente usa `claude-opus-5`; el costo es por
   uso (revisa `estrategia-kommo/` para volumen esperado de conversaciones y
   así estimar el gasto mensual).

## Instalación local (para probar antes de publicar)

```bash
npm install
cp .env.example .env
# edita .env con tus claves reales
npm run dev
```

Para que Meta pueda llamar tu webhook mientras pruebas en tu computador,
necesitas exponerlo a internet temporalmente (ej. con `ngrok http 3000`) y
usar esa URL de ngrok en la configuración del webhook de Meta.

El panel CRM queda en `http://localhost:3000/` (te pide el usuario/clave del
`.env`).

## Desplegarlo de verdad (recomendado: Railway)

1. Crea una cuenta en [railway.app](https://railway.app) (tiene plan gratis
   para empezar, luego es por uso — muy económico para este tamaño de app).
2. "New Project" → "Deploy from GitHub repo" → conecta este repositorio y
   selecciona la carpeta `agente-ia`.
3. En "Variables", agrega todas las del `.env.example` con tus valores reales.
4. En "Settings → Volumes", agrega un volumen montado en `/data` y cambia
   `DB_PATH` a `/data/alavision.db` — así la base de datos no se borra en
   cada despliegue.
5. Railway te da una URL pública (`https://tu-app.up.railway.app`) — úsala
   para configurar el webhook en Meta (`.../webhook`).
6. Cada vez que se actualice el código de esta carpeta en el repositorio,
   Railway lo vuelve a publicar solo.

## Costos aproximados a tener en cuenta

- **Anthropic (Claude)**: cobra por conversación según tokens usados. Un
  turno típico de este agente (mensaje corto + contexto) es barato — pide
  una estimación con tu volumen real de mensajes/mes antes de lanzar a toda
  la pauta.
- **WhatsApp Cloud API**: Meta cobra por conversación iniciada (no por
  mensaje individual), con una franja gratuita mensual. Revisa el precio
  vigente en tu país en el panel de Meta for Developers.
- **Railway**: desde unos pocos dólares al mes para este tamaño de app.

## Cómo usar el panel CRM

- Entra a la URL del servidor con el usuario/clave configurados.
- A la izquierda ves todas las conversaciones, ordenadas por la más reciente,
  con su etapa y nivel de interés.
- Un lead marcado **"necesita humano"** significa que el agente decidió que
  esa conversación necesita atención de una persona — revísalos primero.
- **Pausar IA** detiene al agente en esa conversación específica para que tú
  o la Dra. Angie escriban directamente; **Reactivar IA** se lo devuelve.
- Puedes cambiar la etapa manualmente en cualquier momento desde el
  desplegable.

## Próximos pasos sugeridos (cuando quieras ampliar)

- Conectar el envío de correo real (cotización en PDF) cuando el agente
  marca que ya tiene el email.
- Agregar recordatorio automático de cita (cron + plantilla de WhatsApp).
- Exportar la base de `#BaseEmail` para mail marketing.
- Notificación push/Telegram cuando un lead queda marcado "necesita humano".
