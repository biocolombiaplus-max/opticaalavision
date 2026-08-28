CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wa_id TEXT UNIQUE NOT NULL,
  nombre TEXT,
  etapa TEXT NOT NULL DEFAULT 'nuevo',
  nivel_interes TEXT NOT NULL DEFAULT 'medio',
  etiquetas TEXT NOT NULL DEFAULT '[]',
  correo TEXT,
  necesita_humano INTEGER NOT NULL DEFAULT 0,
  ia_pausada INTEGER NOT NULL DEFAULT 0,
  nota_interna TEXT NOT NULL DEFAULT '',
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mensajes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  rol TEXT NOT NULL, -- 'paciente' | 'agente' | 'humano' | 'sistema'
  texto TEXT NOT NULL,
  botones TEXT NOT NULL DEFAULT '[]',
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mensajes_lead ON mensajes(lead_id, creado_en);

CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS citas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER REFERENCES leads(id),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT NOT NULL,
  servicio TEXT NOT NULL,
  sede TEXT NOT NULL,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  origen_campana TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente',
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plantillas_remarketing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orden INTEGER NOT NULL UNIQUE,
  texto TEXT NOT NULL,
  espera_horas INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS remarketing_envios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  plantilla_id INTEGER NOT NULL REFERENCES plantillas_remarketing(id),
  enviado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_remarketing_lead ON remarketing_envios(lead_id);
