import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";
import { config } from "../config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

mkdirSync(dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);
db.pragma("journal_mode = WAL");

const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
db.exec(schema);

export type Etapa =
  | "nuevo"
  | "calificando"
  | "propuesta_enviada"
  | "objecion"
  | "cita_agendada"
  | "ganado"
  | "perdido";

export type NivelInteres = "alto" | "medio" | "bajo";

export interface Lead {
  id: number;
  wa_id: string;
  nombre: string | null;
  etapa: Etapa;
  nivel_interes: NivelInteres;
  etiquetas: string; // JSON string
  correo: string | null;
  necesita_humano: number; // 0 | 1
  ia_pausada: number; // 0 | 1
  nota_interna: string;
  creado_en: string;
  actualizado_en: string;
}

export interface Mensaje {
  id: number;
  lead_id: number;
  rol: "paciente" | "agente" | "humano" | "sistema";
  texto: string;
  botones: string; // JSON string
  creado_en: string;
}

export function getOrCreateLead(waId: string, nombre?: string): Lead {
  const existing = db.prepare("SELECT * FROM leads WHERE wa_id = ?").get(waId) as Lead | undefined;
  if (existing) return existing;
  const info = db
    .prepare("INSERT INTO leads (wa_id, nombre) VALUES (?, ?)")
    .run(waId, nombre ?? null);
  return db.prepare("SELECT * FROM leads WHERE id = ?").get(info.lastInsertRowid) as Lead;
}

export function getLead(id: number): Lead | undefined {
  return db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as Lead | undefined;
}

export function listLeads(): Lead[] {
  return db.prepare("SELECT * FROM leads ORDER BY actualizado_en DESC").all() as Lead[];
}

export function addMessage(leadId: number, rol: Mensaje["rol"], texto: string, botones: string[] = []): void {
  db.prepare("INSERT INTO mensajes (lead_id, rol, texto, botones) VALUES (?, ?, ?, ?)").run(
    leadId,
    rol,
    texto,
    JSON.stringify(botones),
  );
  db.prepare("UPDATE leads SET actualizado_en = datetime('now') WHERE id = ?").run(leadId);
}

export function getRecentMessages(leadId: number, limit = 30): Mensaje[] {
  const rows = db
    .prepare("SELECT * FROM mensajes WHERE lead_id = ? ORDER BY creado_en DESC LIMIT ?")
    .all(leadId, limit) as Mensaje[];
  return rows.reverse();
}

export interface LeadUpdateFromAgent {
  etapa: Etapa;
  nivel_interes: NivelInteres;
  etiquetas: string[];
  necesita_humano: boolean;
  nota_interna?: string;
}

export function updateLeadFromAgent(leadId: number, update: LeadUpdateFromAgent): void {
  const lead = getLead(leadId);
  if (!lead) return;
  const etiquetasActuales: string[] = JSON.parse(lead.etiquetas);
  const etiquetasNuevas = Array.from(new Set([...etiquetasActuales, ...update.etiquetas]));
  db.prepare(
    `UPDATE leads SET etapa = ?, nivel_interes = ?, etiquetas = ?, necesita_humano = ?,
     nota_interna = CASE WHEN ? != '' THEN ? ELSE nota_interna END,
     actualizado_en = datetime('now') WHERE id = ?`,
  ).run(
    update.etapa,
    update.nivel_interes,
    JSON.stringify(etiquetasNuevas),
    update.necesita_humano ? 1 : 0,
    update.nota_interna ?? "",
    update.nota_interna ?? "",
    leadId,
  );
}

export function setIaPausada(leadId: number, pausada: boolean): void {
  db.prepare("UPDATE leads SET ia_pausada = ? WHERE id = ?").run(pausada ? 1 : 0, leadId);
}

export function setCorreo(leadId: number, correo: string): void {
  db.prepare("UPDATE leads SET correo = ? WHERE id = ?").run(correo, leadId);
}

export function setNombre(leadId: number, nombre: string): void {
  db.prepare("UPDATE leads SET nombre = ? WHERE id = ?").run(nombre, leadId);
}
