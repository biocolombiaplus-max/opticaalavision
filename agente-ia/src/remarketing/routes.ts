import { Router } from "express";
import {
  listLeads,
  listPlantillasRemarketing,
  updatePlantillaRemarketing,
  calcularSiguienteRemarketing,
  registrarEnvioRemarketing,
  getLead,
} from "../db/index.js";
import { sendText } from "../whatsapp/client.js";
import { addMessage } from "../db/index.js";

export const remarketingAdminRouter = Router();

remarketingAdminRouter.get("/api/remarketing/plantillas", (_req, res) => {
  res.json(listPlantillasRemarketing());
});

remarketingAdminRouter.put("/api/remarketing/plantillas/:id", (req, res) => {
  const { texto, espera_horas } = req.body as { texto: string; espera_horas: number };
  updatePlantillaRemarketing(Number(req.params.id), texto, Number(espera_horas));
  res.json({ ok: true });
});

/**
 * Devuelve, para cada lead que no está "ganado" ni "perdido", cuál es el
 * siguiente mensaje de la secuencia de remarketing y si ya toca enviarlo
 * (para que el panel "encienda" el botón exactamente cuando corresponde).
 */
remarketingAdminRouter.get("/api/remarketing/estado", (_req, res) => {
  const leads = listLeads().filter((l) => l.etapa !== "ganado" && l.etapa !== "perdido");
  const estado = leads.map((lead) => ({
    lead,
    siguiente: calcularSiguienteRemarketing(lead.id),
  }));
  res.json(estado);
});

remarketingAdminRouter.post("/api/remarketing/enviar/:leadId", async (req, res) => {
  const leadId = Number(req.params.leadId);
  const lead = getLead(leadId);
  if (!lead) {
    res.sendStatus(404);
    return;
  }
  const siguiente = calcularSiguienteRemarketing(leadId);
  if (!siguiente) {
    res.status(400).json({ error: "Este lead ya recibió los 10 mensajes de remarketing." });
    return;
  }
  if (!siguiente.disponibleAhora) {
    res.status(400).json({
      error: `Todavía no toca — disponible desde ${siguiente.disponibleDesde}.`,
    });
    return;
  }

  try {
    await sendText(lead.wa_id, siguiente.plantilla.texto);
    registrarEnvioRemarketing(leadId, siguiente.plantilla.id);
    addMessage(leadId, "humano", `[Remarketing #${siguiente.plantilla.orden}] ${siguiente.plantilla.texto}`);
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});
