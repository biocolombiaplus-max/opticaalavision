import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { sendText, sendWithButtons } from "../whatsapp/client.js";
import { sendEmail } from "../notifications/email.js";
import {
  listLeads,
  getLead,
  getRecentMessages,
  addMessage,
  setIaPausada,
  setEtapa,
  type Etapa,
} from "../db/index.js";

const ETAPAS_VALIDAS: Etapa[] = [
  "nuevo",
  "calificando",
  "propuesta_enviada",
  "objecion",
  "cita_agendada",
  "ganado",
  "perdido",
];

export const crmRouter = Router();

export function basicAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Basic ")) {
    const [user, pass] = Buffer.from(header.slice(6), "base64").toString().split(":");
    if (user === config.crm.user && pass === config.crm.password) {
      next();
      return;
    }
  }
  res.set("WWW-Authenticate", 'Basic realm="Panel Optica ALaVision"');
  res.status(401).send("Acceso restringido");
}

crmRouter.get("/api/leads", (_req, res) => {
  res.json(listLeads());
});

crmRouter.get("/api/leads/:id", (req, res) => {
  const lead = getLead(Number(req.params.id));
  if (!lead) {
    res.sendStatus(404);
    return;
  }
  const mensajes = getRecentMessages(lead.id, 200);
  res.json({ lead, mensajes });
});

crmRouter.post("/api/leads/:id/pausar", (req, res) => {
  const lead = getLead(Number(req.params.id));
  if (!lead) {
    res.sendStatus(404);
    return;
  }
  const pausada = Boolean((req.body as { pausada?: boolean }).pausada);
  setIaPausada(lead.id, pausada);
  res.json({ ok: true });
});

crmRouter.post("/api/leads/:id/mensaje", async (req, res) => {
  const lead = getLead(Number(req.params.id));
  if (!lead) {
    res.sendStatus(404);
    return;
  }
  const { texto, botones } = req.body as { texto: string; botones?: string[] };
  if (!texto?.trim()) {
    res.status(400).json({ error: "El mensaje no puede estar vacío" });
    return;
  }
  try {
    if (botones && botones.length > 0) {
      await sendWithButtons(lead.wa_id, texto, botones);
    } else {
      await sendText(lead.wa_id, texto);
    }
    addMessage(lead.id, "humano", texto, botones ?? []);
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

crmRouter.post("/api/leads/:id/correo", async (req, res) => {
  const lead = getLead(Number(req.params.id));
  if (!lead) {
    res.sendStatus(404);
    return;
  }
  if (!lead.correo) {
    res.status(400).json({ error: "Este lead no tiene correo guardado todavía." });
    return;
  }
  const { asunto, cuerpo } = req.body as { asunto: string; cuerpo: string };
  const enviado = await sendEmail({
    to: lead.correo,
    subject: asunto || "Óptica ALaVision",
    html: `<div style="font-family:Arial,sans-serif;">${cuerpo.replace(/\n/g, "<br/>")}</div>`,
  });
  if (enviado) addMessage(lead.id, "humano", `[Correo] ${asunto}: ${cuerpo}`);
  res.json({ ok: enviado });
});

crmRouter.post("/api/leads/:id/etapa", (req, res) => {
  const lead = getLead(Number(req.params.id));
  if (!lead) {
    res.sendStatus(404);
    return;
  }
  const { etapa } = req.body as { etapa: string };
  if (!ETAPAS_VALIDAS.includes(etapa as Etapa)) {
    res.status(400).json({ error: "Etapa no válida." });
    return;
  }
  setEtapa(lead.id, etapa as Etapa);
  res.json({ ok: true });
});
