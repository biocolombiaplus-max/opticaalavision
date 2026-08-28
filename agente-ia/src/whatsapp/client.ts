import { config } from "../config.js";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${config.whatsapp.accessToken}`,
    "Content-Type": "application/json",
  };
}

async function graphRequest(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${GRAPH_BASE}/${config.whatsapp.phoneNumberId}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${detail}`);
  }
}

/** Envía un mensaje de texto plano. */
export async function sendText(to: string, text: string): Promise<void> {
  await graphRequest("/messages", {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  });
}

/**
 * Envía un mensaje con hasta 3 botones de respuesta rápida (límite real de WhatsApp).
 * Cada botón se recorta a 20 caracteres por seguridad.
 */
export async function sendWithButtons(to: string, text: string, buttons: string[]): Promise<void> {
  const trimmed = buttons.slice(0, 3).map((b, i) => ({
    type: "reply" as const,
    reply: { id: `btn_${i}_${Date.now()}`, title: b.slice(0, 20) },
  }));
  await graphRequest("/messages", {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text },
      action: { buttons: trimmed },
    },
  });
}

/** Descarga un archivo multimedia (imagen) recibido por WhatsApp y lo devuelve en base64. */
export async function downloadMedia(mediaId: string): Promise<{ base64: string; mimeType: string }> {
  const metaRes = await fetch(`${GRAPH_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${config.whatsapp.accessToken}` },
  });
  if (!metaRes.ok) {
    throw new Error(`No se pudo obtener metadata del archivo ${mediaId}: ${metaRes.status}`);
  }
  const meta = (await metaRes.json()) as { url: string; mime_type: string };

  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${config.whatsapp.accessToken}` },
  });
  if (!fileRes.ok) {
    throw new Error(`No se pudo descargar el archivo ${mediaId}: ${fileRes.status}`);
  }
  const buffer = Buffer.from(await fileRes.arrayBuffer());
  return { base64: buffer.toString("base64"), mimeType: meta.mime_type };
}
