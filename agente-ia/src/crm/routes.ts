import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { sendText, sendWithButtons } from "../whatsapp/client.js";
import {
  listLeads,
  getLead,
  getRecentMessages,
  addMessage,
  setIaPausada,
  db,
} from "../db/index.js";

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

crmRouter.post("/api/leads/:id/etapa", (req, res) => {
  const lead = getLead(Number(req.params.id));
  if (!lead) {
    res.sendStatus(404);
    return;
  }
  const { etapa } = req.body as { etapa: string };
  db.prepare("UPDATE leads SET etapa = ?, actualizado_en = datetime('now') WHERE id = ?").run(
    etapa,
    lead.id,
  );
  res.json({ ok: true });
});
