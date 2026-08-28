import { Router } from "express";
import { config } from "../config.js";
import type { WhatsAppWebhookBody, IncomingMessage } from "./types.js";
import { downloadMedia, sendText, sendWithButtons } from "./client.js";
import { askAgent } from "../ai/agent.js";
import {
  getOrCreateLead,
  addMessage,
  getRecentMessages,
  updateLeadFromAgent,
  setNombre,
  setCorreo,
} from "../db/index.js";

export const webhookRouter = Router();

// Meta llama este GET una vez, al configurar el webhook, para verificar que el servidor es tuyo.
webhookRouter.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.whatsapp.verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Meta llama este POST cada vez que llega un mensaje nuevo.
webhookRouter.post("/webhook", (req, res) => {
  // Responde rápido: WhatsApp reintenta si no recibe 200 en pocos segundos.
  res.sendStatus(200);
  handleIncoming(req.body as WhatsAppWebhookBody).catch((err) => {
    console.error("Error procesando mensaje entrante:", err);
  });
});

async function handleIncoming(body: WhatsAppWebhookBody): Promise<void> {
  const change = body.entry?.[0]?.changes?.[0];
  const message: IncomingMessage | undefined = change?.value.messages?.[0];
  if (!message) return; // puede ser un evento de "leído"/"entregado", se ignora

  const waId = message.from;
  const nombrePerfil = change?.value.contacts?.[0]?.profile.name;
  const origenCampana = message.referral
    ? message.referral.headline || message.referral.source_type || "Meta Ads"
    : "";
  const lead = getOrCreateLead(waId, nombrePerfil, origenCampana);
  if (nombrePerfil && !lead.nombre) setNombre(lead.id, nombrePerfil);

  let textoPaciente = "";
  let imagen: { base64: string; mimeType: string } | undefined;

  if (message.type === "text") {
    textoPaciente = message.text?.body ?? "";
  } else if (message.type === "image" && message.image) {
    textoPaciente = message.image.caption ?? "";
    imagen = await downloadMedia(message.image.id);
  } else if (message.type === "interactive" && message.interactive?.button_reply) {
    textoPaciente = message.interactive.button_reply.title;
  } else {
    textoPaciente = "[mensaje no soportado]";
  }

  addMessage(lead.id, "paciente", imagen ? `${textoPaciente} [imagen adjunta]` : textoPaciente);

  if (lead.ia_pausada) {
    // Un humano ya tomó esta conversación: no interfiere el agente.
    return;
  }

  const history = getRecentMessages(lead.id, 30).slice(0, -1); // sin el mensaje que se acaba de guardar
  const reply = await askAgent(history, { text: textoPaciente, image: imagen });

  updateLeadFromAgent(lead.id, {
    etapa: reply.etapa,
    nivel_interes: reply.nivel_interes,
    etiquetas: reply.etiquetas,
    necesita_humano: reply.necesita_humano,
    nota_interna: reply.nota_interna,
  });
  addMessage(lead.id, "agente", reply.mensaje, reply.botones);
  if (reply.correo?.trim()) setCorreo(lead.id, reply.correo.trim());

  if (reply.botones.length > 0) {
    await sendWithButtons(waId, reply.mensaje, reply.botones);
  } else {
    await sendText(waId, reply.mensaje);
  }
}
