import { Router } from "express";
import {
  createCita,
  listCitas,
  setCitaEstado,
  getLeadByWaId,
  getConfig,
} from "../db/index.js";
import { sendEmail, plantillaConfirmacionCita } from "../notifications/email.js";
import { sendText } from "../whatsapp/client.js";

export const citasPublicRouter = Router();
export const citasAdminRouter = Router();

citasPublicRouter.post("/api/citas", async (req, res) => {
  const body = req.body as {
    nombre?: string;
    telefono?: string;
    correo?: string;
    servicio?: string;
    sede?: string;
    fecha?: string;
    hora?: string;
    origen_campana?: string;
  };

  if (!body.nombre || !body.telefono || !body.correo || !body.fecha || !body.hora) {
    res.status(400).json({ error: "Faltan datos obligatorios." });
    return;
  }

  // Las citas solo se agendan dentro de los próximos 7 días (para cerrar la venta rápido, en
  // vez de dejar la cita abierta a semanas o meses) — el selector de la landing ya solo ofrece
  // esas fechas, esto es un respaldo por si llega una solicitud fuera de ese rango.
  const hoy = new Date();
  const fechaISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const limite = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 7);
  if (body.fecha < fechaISO(hoy) || body.fecha > fechaISO(limite)) {
    res.status(400).json({ error: "Elige una fecha dentro de los próximos 7 días." });
    return;
  }

  const waId = body.telefono.replace(/\D/g, "");
  const lead = getLeadByWaId(waId);

  const cita = createCita({
    lead_id: lead?.id ?? null,
    nombre: body.nombre,
    telefono: body.telefono,
    correo: body.correo,
    servicio: body.servicio ?? "Examen completo",
    sede: body.sede ?? "Principal",
    fecha: body.fecha,
    hora: body.hora,
    origen_campana: body.origen_campana ?? "web",
  });

  const cfg = getConfig();
  const mapsUrl = cita.sede === "Los Andes" ? cfg.maps_url_los_andes : cfg.maps_url_principal;
  const direccion = cita.sede === "Los Andes" ? cfg.direccion_los_andes : cfg.direccion_principal;

  await sendEmail({
    to: cita.correo,
    subject: "Confirmación de tu cita — Óptica ALaVision",
    html: plantillaConfirmacionCita({
      nombre: cita.nombre,
      servicio: cita.servicio,
      sede: cita.sede,
      fecha: cita.fecha,
      hora: cita.hora,
      direccion: direccion ?? "",
      mapsUrl: mapsUrl ?? "",
    }),
  }).catch((err) => console.error("[citas] error enviando correo:", err));

  sendText(
    waId,
    `¡Hola ${cita.nombre}! 😊 Confirmamos tu cita de ${cita.servicio} el ${cita.fecha} a las ${cita.hora}, sede ${cita.sede}. Te llegó también la confirmación por correo con cómo llegar.`,
  ).catch((err) => console.error("[citas] error enviando WhatsApp:", err));

  res.json({ ok: true, cita });
});

citasAdminRouter.get("/api/citas", (_req, res) => {
  res.json(listCitas());
});

citasAdminRouter.post("/api/citas/:id/estado", (req, res) => {
  const { estado } = req.body as { estado: string };
  setCitaEstado(Number(req.params.id), estado as never);
  res.json({ ok: true });
});
