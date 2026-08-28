import { Router } from "express";
import multer from "multer";
import { mkdirSync } from "fs";
import { dirname, join, extname } from "path";
import { getConfig, setConfigValues } from "../db/index.js";
import { config as appConfig } from "../config.js";

export const uploadsDir = join(dirname(appConfig.dbPath), "uploads");
mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.mimetype)) {
      cb(new Error("Solo se permiten imágenes (png, jpg, webp, svg)."));
      return;
    }
    cb(null, true);
  },
});

export const settingsPublicRouter = Router();
export const settingsAdminRouter = Router();

settingsPublicRouter.get("/api/config", (_req, res) => {
  res.json(getConfig());
});

// Guarda pares clave/valor de configuración (textos, URLs, opacidad, etc.)
settingsAdminRouter.put("/api/config", (req, res) => {
  const values = req.body as Record<string, string>;
  setConfigValues(values);
  res.json({ ok: true, config: getConfig() });
});

// Sube una imagen y la asocia a una clave de configuración (ej: "hero_image_url", "logo_url").
settingsAdminRouter.post("/api/config/imagen", upload.single("archivo"), (req, res) => {
  const campo = (req.body as { campo?: string }).campo;
  if (!campo || !req.file) {
    res.status(400).json({ error: "Falta el campo o el archivo." });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  setConfigValues({ [campo]: url });
  res.json({ ok: true, url });
});

// Subida genérica de imágenes (logos de marca, fotos de producto) — solo devuelve la URL,
// sin asociarla a ninguna clave de configuración.
settingsAdminRouter.post("/api/imagen", upload.single("archivo"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Falta el archivo." });
    return;
  }
  res.json({ ok: true, url: `/uploads/${req.file.filename}` });
});
