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

// Migraciones simples: agrega columnas nuevas a "leads" si vienen de una base de datos anterior.
const leadColumns = new Set(
  (db.prepare("PRAGMA table_info(leads)").all() as Array<{ name: string }>).map((c) => c.name),
);
if (!leadColumns.has("origen_campana")) {
  db.exec("ALTER TABLE leads ADD COLUMN origen_campana TEXT NOT NULL DEFAULT ''");
}
if (!leadColumns.has("convertido")) {
  db.exec("ALTER TABLE leads ADD COLUMN convertido INTEGER NOT NULL DEFAULT 0");
}
if (!leadColumns.has("valor_compra")) {
  db.exec("ALTER TABLE leads ADD COLUMN valor_compra INTEGER NOT NULL DEFAULT 0");
}

// Plantillas de remarketing por defecto (editables luego desde el panel admin).
const plantillasCount = (db.prepare("SELECT COUNT(*) AS n FROM plantillas_remarketing").get() as { n: number }).n;
if (plantillasCount === 0) {
  const defaultPlantillas: Array<[number, string, number]> = [
    [1, "¡Hola! 😊 Vimos que te interesaron nuestras monturas. ¿Seguimos con tu asesoría?", 0],
    [2, "¿Cómo vas con la decisión de tus lentes? Seguimos disponibles para cotizarte 👓", 24],
    [3, "Esta semana tenemos cupos para el examen visual con la Dra. Angie. ¿Te agendamos?", 48],
    [4, "Recuerda que la montura sigue de regalo con cualquier combo este mes 🎁", 72],
    [5, "¿Ya tienes tu fórmula lista? Con gusto te ayudamos a cotizar tu combo ideal.", 96],
    [6, "Muchos pacientes ya renovaron sus lentes con nosotros esta temporada 👀", 168],
    [7, "¿Seguimos pendientes? Cuéntanos si prefieres que te contactemos más adelante.", 168],
    [8, "Un chequeo visual a tiempo evita molestias más adelante. ¿Agendamos tu cita?", 336],
    [9, "Última oportunidad de aprovechar la promo de monturas de este mes.", 336],
    [10, "Quedamos atentos para cuando decidas darle una revisión a tu salud visual 😊", 720],
  ];
  const insert = db.prepare(
    "INSERT INTO plantillas_remarketing (orden, texto, espera_horas) VALUES (?, ?, ?)",
  );
  for (const [orden, texto, espera] of defaultPlantillas) insert.run(orden, texto, espera);
}

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
  origen_campana: string;
  convertido: number; // 0 | 1
  valor_compra: number;
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

export function getOrCreateLead(waId: string, nombre?: string, origenCampana = ""): Lead {
  const existing = db.prepare("SELECT * FROM leads WHERE wa_id = ?").get(waId) as Lead | undefined;
  if (existing) return existing;
  const info = db
    .prepare("INSERT INTO leads (wa_id, nombre, origen_campana) VALUES (?, ?, ?)")
    .run(waId, nombre ?? null, origenCampana);
  return db.prepare("SELECT * FROM leads WHERE id = ?").get(info.lastInsertRowid) as Lead;
}

export function getLeadByWaId(waId: string): Lead | undefined {
  return db.prepare("SELECT * FROM leads WHERE wa_id = ?").get(waId) as Lead | undefined;
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

export function setConvertido(leadId: number, convertido: boolean, valorCompra: number): void {
  db.prepare("UPDATE leads SET convertido = ?, valor_compra = ? WHERE id = ?").run(
    convertido ? 1 : 0,
    valorCompra,
    leadId,
  );
}

export function setEtapa(leadId: number, etapa: Etapa): void {
  db.prepare("UPDATE leads SET etapa = ?, actualizado_en = datetime('now') WHERE id = ?").run(etapa, leadId);
}

// ---------------- Configuración (branding, imágenes, mapas) ----------------

export function getConfig(): Record<string, string> {
  const rows = db.prepare("SELECT clave, valor FROM configuracion").all() as Array<{
    clave: string;
    valor: string;
  }>;
  return Object.fromEntries(rows.map((r) => [r.clave, r.valor]));
}

export function setConfigValues(values: Record<string, string>): void {
  const upsert = db.prepare(
    "INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor",
  );
  const tx = db.transaction((entries: Array<[string, string]>) => {
    for (const [clave, valor] of entries) upsert.run(clave, valor);
  });
  tx(Object.entries(values));
}

// ---------------- Citas ----------------

export interface Cita {
  id: number;
  lead_id: number | null;
  nombre: string;
  telefono: string;
  correo: string;
  servicio: string;
  sede: string;
  fecha: string;
  hora: string;
  origen_campana: string;
  estado: "pendiente" | "confirmada" | "cancelada" | "atendida";
  creado_en: string;
}

export interface NuevaCita {
  lead_id: number | null;
  nombre: string;
  telefono: string;
  correo: string;
  servicio: string;
  sede: string;
  fecha: string;
  hora: string;
  origen_campana: string;
}

export function createCita(c: NuevaCita): Cita {
  const info = db
    .prepare(
      `INSERT INTO citas (lead_id, nombre, telefono, correo, servicio, sede, fecha, hora, origen_campana)
       VALUES (@lead_id, @nombre, @telefono, @correo, @servicio, @sede, @fecha, @hora, @origen_campana)`,
    )
    .run(c);
  return db.prepare("SELECT * FROM citas WHERE id = ?").get(info.lastInsertRowid) as Cita;
}

export function listCitas(): Cita[] {
  return db.prepare("SELECT * FROM citas ORDER BY fecha DESC, hora DESC").all() as Cita[];
}

export function setCitaEstado(id: number, estado: Cita["estado"]): void {
  db.prepare("UPDATE citas SET estado = ? WHERE id = ?").run(estado, id);
}

// ---------------- Remarketing secuenciado ----------------

export interface PlantillaRemarketing {
  id: number;
  orden: number;
  texto: string;
  espera_horas: number;
}

export function listPlantillasRemarketing(): PlantillaRemarketing[] {
  return db
    .prepare("SELECT * FROM plantillas_remarketing ORDER BY orden ASC")
    .all() as PlantillaRemarketing[];
}

export function updatePlantillaRemarketing(id: number, texto: string, esperaHoras: number): void {
  db.prepare("UPDATE plantillas_remarketing SET texto = ?, espera_horas = ? WHERE id = ?").run(
    texto,
    esperaHoras,
    id,
  );
}

export interface EnvioRemarketing {
  id: number;
  lead_id: number;
  plantilla_id: number;
  enviado_en: string;
}

export function listEnviosPorLead(leadId: number): EnvioRemarketing[] {
  return db
    .prepare("SELECT * FROM remarketing_envios WHERE lead_id = ? ORDER BY enviado_en ASC")
    .all(leadId) as EnvioRemarketing[];
}

export function registrarEnvioRemarketing(leadId: number, plantillaId: number): void {
  db.prepare("INSERT INTO remarketing_envios (lead_id, plantilla_id) VALUES (?, ?)").run(
    leadId,
    plantillaId,
  );
}

/**
 * Calcula, para un lead dado, cuál es la siguiente plantilla de remarketing que
 * se le puede enviar y si ya está en tiempo de hacerlo (para "encender" el botón
 * en el panel). Devuelve null si ya se enviaron las 10 o si no ha pasado el tiempo.
 */
export interface SiguienteRemarketing {
  plantilla: PlantillaRemarketing;
  disponibleDesde: string; // fecha ISO desde la que se puede enviar
  disponibleAhora: boolean;
}

// ---------------- Marcas (logos) ----------------

export interface Marca {
  id: number;
  nombre: string;
  logo_url: string;
  orden: number;
  creado_en: string;
}

export function listMarcas(): Marca[] {
  return db.prepare("SELECT * FROM marcas ORDER BY orden ASC, id ASC").all() as Marca[];
}

export function createMarca(nombre: string, logoUrl: string): Marca {
  const maxOrden = (db.prepare("SELECT COALESCE(MAX(orden), 0) AS m FROM marcas").get() as { m: number }).m;
  const info = db
    .prepare("INSERT INTO marcas (nombre, logo_url, orden) VALUES (?, ?, ?)")
    .run(nombre, logoUrl, maxOrden + 1);
  return db.prepare("SELECT * FROM marcas WHERE id = ?").get(info.lastInsertRowid) as Marca;
}

export function deleteMarca(id: number): void {
  db.prepare("DELETE FROM marcas WHERE id = ?").run(id);
}

// ---------------- Productos (tienda) ----------------

export interface Producto {
  id: number;
  nombre: string;
  marca_id: number | null;
  categoria: string;
  precio: number;
  descripcion: string;
  imagen_url: string;
  destacado: number;
  orden: number;
  activo: number;
  creado_en: string;
}

export function listProductos(soloActivos = true): Producto[] {
  const sql = soloActivos
    ? "SELECT * FROM productos WHERE activo = 1 ORDER BY orden ASC, id DESC"
    : "SELECT * FROM productos ORDER BY orden ASC, id DESC";
  return db.prepare(sql).all() as Producto[];
}

export interface NuevoProducto {
  nombre: string;
  marca_id: number | null;
  categoria: string;
  precio: number;
  descripcion: string;
  imagen_url: string;
  destacado: boolean;
}

export function createProducto(p: NuevoProducto): Producto {
  const info = db
    .prepare(
      `INSERT INTO productos (nombre, marca_id, categoria, precio, descripcion, imagen_url, destacado)
       VALUES (@nombre, @marca_id, @categoria, @precio, @descripcion, @imagen_url, @destacado)`,
    )
    .run({ ...p, destacado: p.destacado ? 1 : 0 });
  return db.prepare("SELECT * FROM productos WHERE id = ?").get(info.lastInsertRowid) as Producto;
}

export function updateProducto(id: number, p: Partial<NuevoProducto> & { activo?: boolean }): void {
  const current = db.prepare("SELECT * FROM productos WHERE id = ?").get(id) as Producto | undefined;
  if (!current) return;
  const merged = {
    nombre: p.nombre ?? current.nombre,
    marca_id: p.marca_id !== undefined ? p.marca_id : current.marca_id,
    categoria: p.categoria ?? current.categoria,
    precio: p.precio ?? current.precio,
    descripcion: p.descripcion ?? current.descripcion,
    imagen_url: p.imagen_url ?? current.imagen_url,
    destacado: p.destacado !== undefined ? (p.destacado ? 1 : 0) : current.destacado,
    activo: p.activo !== undefined ? (p.activo ? 1 : 0) : current.activo,
    id,
  };
  db.prepare(
    `UPDATE productos SET nombre=@nombre, marca_id=@marca_id, categoria=@categoria, precio=@precio,
     descripcion=@descripcion, imagen_url=@imagen_url, destacado=@destacado, activo=@activo WHERE id=@id`,
  ).run(merged);
}

export function deleteProducto(id: number): void {
  db.prepare("DELETE FROM productos WHERE id = ?").run(id);
}

// ---------------- Test de visión (orientación, sin IA) ----------------

export interface TestVisionResultado {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  edad: number;
  respuestas: string;
  resultado_combo: string;
  origen_campana: string;
  creado_en: string;
}

export interface NuevoTestVision {
  nombre: string;
  telefono: string;
  correo: string;
  edad: number;
  respuestas: Record<string, string>;
  resultado_combo: string;
  origen_campana: string;
}

export function createTestVision(t: NuevoTestVision): TestVisionResultado {
  const info = db
    .prepare(
      `INSERT INTO test_vision_resultados (nombre, telefono, correo, edad, respuestas, resultado_combo, origen_campana)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(t.nombre, t.telefono, t.correo, t.edad, JSON.stringify(t.respuestas), t.resultado_combo, t.origen_campana);
  return db
    .prepare("SELECT * FROM test_vision_resultados WHERE id = ?")
    .get(info.lastInsertRowid) as TestVisionResultado;
}

export function listTestVision(): TestVisionResultado[] {
  return db
    .prepare("SELECT * FROM test_vision_resultados ORDER BY creado_en DESC")
    .all() as TestVisionResultado[];
}

export function calcularSiguienteRemarketing(leadId: number): SiguienteRemarketing | null {
  const plantillas = listPlantillasRemarketing();
  const envios = listEnviosPorLead(leadId);
  const siguienteOrden = envios.length + 1;
  const plantilla = plantillas.find((p) => p.orden === siguienteOrden);
  if (!plantilla) return null; // ya se enviaron todas (máximo 10)

  const ultimoEnvio = envios[envios.length - 1]?.enviado_en;
  const base = ultimoEnvio ? new Date(ultimoEnvio + "Z") : new Date();
  const disponibleDesde = new Date(base.getTime() + plantilla.espera_horas * 3600 * 1000);
  const disponibleAhora = envios.length === 0 ? true : new Date() >= disponibleDesde;

  return { plantilla, disponibleDesde: disponibleDesde.toISOString(), disponibleAhora };
}
