import { Router } from "express";
import multer from "multer";
import { askAgent } from "../ai/agent.js";
import { createIpRateLimiter } from "../lib/rateLimit.js";
import {
  getOrCreateLead,
  getLeadByWaId,
  addMessage,
  getRecentMessages,
  updateLeadFromAgent,
  setCorreo,
} from "../db/index.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, fieldSize: 4000 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) {
      cb(new Error("Solo se permiten fotos (png, jpg, webp)."));
      return;
    }
    cb(null, true);
  },
});

// Esta ruta es pública y cada mensaje consume IA (Claude/Gemini) — se protege de abuso/spam.
const permitido = createIpRateLimiter(30, 15 * 60 * 1000);

export const chatPublicRouter = Router();

function waIdDeSesion(sessionId: string): string {
  return `web:${sessionId}`;
}

chatPublicRouter.post("/api/chat/mensaje", upload.single("archivo"), async (req, res) => {
  if (!permitido(req.ip ?? "desconocido")) {
    res.status(429).json({ error: "Muchos mensajes seguidos. Espera un momento e intenta de nuevo." });
    return;
  }

  const body = req.body as { session_id?: string; texto?: string; origen_campana?: string };
  const sessionId = body.session_id?.trim();
  const texto = body.texto?.trim().slice(0, 2000) ?? "";

  if (!sessionId || (!texto && !req.file)) {
    res.status(400).json({ error: "Falta el mensaje." });
    return;
  }

  const lead = getOrCreateLead(waIdDeSesion(sessionId), undefined, body.origen_campana ?? "chat_web");
  addMessage(lead.id, "paciente", req.file ? `${texto} [imagen adjunta]` : texto);

  if (lead.ia_pausada) {
    res.json({ ok: true, pausada: true });
    return;
  }

  try {
    const image = req.file ? { base64: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } : undefined;
    const history = getRecentMessages(lead.id, 30).slice(0, -1);
    const reply = await askAgent(history, { text: texto, image });

    updateLeadFromAgent(lead.id, {
      etapa: reply.etapa,
      nivel_interes: reply.nivel_interes,
      etiquetas: reply.etiquetas,
      necesita_humano: reply.necesita_humano,
      nota_interna: reply.nota_interna,
    });
    addMessage(lead.id, "agente", reply.mensaje, reply.botones);
    if (reply.correo?.trim()) setCorreo(lead.id, reply.correo.trim());

    res.json({ ok: true, pausada: false, mensaje: reply.mensaje, botones: reply.botones });
  } catch (err) {
    console.error("Error en chat web:", err);
    res.status(500).json({ error: "No pudimos responder justo ahora. Intenta de nuevo o escríbenos por WhatsApp." });
  }
});

chatPublicRouter.get("/api/chat/historial", (req, res) => {
  const sessionId = String(req.query.session_id ?? "").trim();
  if (!sessionId) {
    res.json([]);
    return;
  }
  const lead = getLeadByWaId(waIdDeSesion(sessionId));
  if (!lead) {
    res.json([]);
    return;
  }
  const mensajes = getRecentMessages(lead.id, 60).map((m) => ({
    rol: m.rol,
    texto: m.texto,
    botones: JSON.parse(m.botones) as string[],
    creado_en: m.creado_en,
  }));
  res.json(mensajes);
});
