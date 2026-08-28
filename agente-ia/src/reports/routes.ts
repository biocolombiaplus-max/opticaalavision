import { Router } from "express";
import PDFDocument from "pdfkit";
import { db, setConvertido, type Lead } from "../db/index.js";

export const reportsAdminRouter = Router();

reportsAdminRouter.post("/api/leads/:id/conversion", (req, res) => {
  const { convertido, valor_compra } = req.body as { convertido: boolean; valor_compra?: number };
  setConvertido(Number(req.params.id), Boolean(convertido), Number(valor_compra ?? 0));
  res.json({ ok: true });
});

function leadsEnRango(desde: string, hasta: string): Lead[] {
  return db
    .prepare("SELECT * FROM leads WHERE date(creado_en) BETWEEN date(?) AND date(?) ORDER BY creado_en ASC")
    .all(desde, hasta) as Lead[];
}

reportsAdminRouter.get("/api/reportes/pdf", (req, res) => {
  const desde = String(req.query.desde ?? "1970-01-01");
  const hasta = String(req.query.hasta ?? "2999-12-31");
  const leads = leadsEnRango(desde, hasta);

  const deCampana = leads.filter((l) => l.origen_campana && l.origen_campana !== "directo");
  const convertidos = leads.filter((l) => l.convertido);
  const convertidosDeCampana = deCampana.filter((l) => l.convertido);
  const valorTotal = convertidos.reduce((sum, l) => sum + (l.valor_compra || 0), 0);
  const tasaConversion = leads.length > 0 ? (convertidos.length / leads.length) * 100 : 0;
  const tasaConversionCampana =
    deCampana.length > 0 ? (convertidosDeCampana.length / deCampana.length) * 100 : 0;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="reporte-${desde}-a-${hasta}.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text("Óptica ALaVision — Reporte de campaña", { align: "left" });
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor("#555").text(`Del ${desde} al ${hasta}`);
  doc.moveDown(1.2);

  doc.fillColor("#000").fontSize(13).text("Resumen general");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#222");
  const linea = (label: string, valor: string) => {
    doc.text(`${label}: ${valor}`);
  };
  linea("Leads totales en el rango", String(leads.length));
  linea("Leads provenientes de campaña (Meta Ads)", String(deCampana.length));
  linea("Citas / clientes convertidos (total)", String(convertidos.length));
  linea("Convertidos que vinieron de campaña", String(convertidosDeCampana.length));
  linea("Tasa de conversión general", `${tasaConversion.toFixed(1)}%`);
  linea("Tasa de conversión de la campaña", `${tasaConversionCampana.toFixed(1)}%`);
  linea("Valor total vendido (registrado en el CRM)", `$${valorTotal.toLocaleString("es-CO")}`);

  doc.moveDown(1.2);
  doc.fontSize(13).text("Detalle de leads convertidos");
  doc.moveDown(0.4);
  doc.fontSize(9.5).fillColor("#333");
  if (convertidos.length === 0) {
    doc.text("No hay leads marcados como convertidos en este rango todavía.");
  }
  for (const l of convertidos) {
    doc.text(
      `• ${l.nombre ?? l.wa_id} — origen: ${l.origen_campana || "directo"} — valor: $${(l.valor_compra || 0).toLocaleString("es-CO")} — ${l.creado_en}`,
    );
  }

  doc.end();
});
