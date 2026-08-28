import { Router } from "express";
import multer from "multer";
import { readFileSync } from "fs";
import { extname } from "path";
import { uploadsDir } from "../settings/routes.js";
import { createTestVision } from "../db/index.js";
import { askAsesoria } from "../ai/asesoria.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, fieldSize: 4000 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) {
      cb(new Error("Solo se permiten fotos (png, jpg, webp)."));
      return;
    }
    cb(null, true);
  },
});

// Límite simple por IP en memoria — esta ruta es pública y cada llamada consume IA (Claude/Gemini),
// así que se protege de abuso/spam sin necesitar infraestructura adicional (Redis, etc.).
const LIMITE_VENTANA_MS = 15 * 60 * 1000;
const LIMITE_MAX_SOLICITUDES = 8;
const contadorPorIp = new Map<string, number[]>();

function permitido(ip: string): boolean {
  const ahora = Date.now();
  const previas = (contadorPorIp.get(ip) ?? []).filter((t) => ahora - t < LIMITE_VENTANA_MS);
  if (previas.length >= LIMITE_MAX_SOLICITUDES) {
    contadorPorIp.set(ip, previas);
    return false;
  }
  previas.push(ahora);
  contadorPorIp.set(ip, previas);
  return true;
}

export const asesoriaPublicRouter = Router();

asesoriaPublicRouter.post("/api/asesoria/analizar", upload.single("archivo"), async (req, res) => {
  if (!permitido(req.ip ?? "desconocido")) {
    res.status(429).json({ error: "Muchas solicitudes seguidas. Espera un momento e intenta de nuevo." });
    return;
  }

  const body = req.body as {
    nombre?: string;
    telefono?: string;
    correo?: string;
    edad?: string;
    respuestas?: string;
    situacion?: string;
    entrada_tipo?: string;
    origen_campana?: string;
  };

  if (!body.nombre || !body.telefono || !body.correo) {
    res.status(400).json({ error: "Faltan tus datos de contacto." });
    return;
  }

  let respuestas: Record<string, string> | undefined;
  if (body.respuestas) {
    try {
      respuestas = JSON.parse(body.respuestas);
    } catch {
      respuestas = undefined;
    }
  }

  const situacion = body.situacion?.trim().slice(0, 1500) || undefined;

  if (!respuestas && !situacion && !req.file) {
    res.status(400).json({ error: "Responde el cuestionario, sube tu fórmula o cuéntanos tu situación." });
    return;
  }

  let imagenUrl = "";
  let image: { base64: string; mimeType: string } | undefined;
  if (req.file) {
    imagenUrl = `/uploads/${req.file.filename}`;
    image = { base64: readFileSync(req.file.path).toString("base64"), mimeType: req.file.mimetype };
  }

  try {
    const resultado = await askAsesoria({
      nombre: body.nombre,
      edad: body.edad ? Number(body.edad) : undefined,
      respuestas,
      situacion,
      image,
    });

    createTestVision({
      nombre: body.nombre,
      telefono: body.telefono,
      correo: body.correo,
      edad: body.edad ? Number(body.edad) : 0,
      respuestas: (respuestas ?? (situacion ? { situacion } : {})) as unknown as Record<string, string>,
      resultado_combo: resultado.combo,
      resultado_texto: resultado.resultado_texto,
      imagen_url: imagenUrl,
      entrada_tipo: body.entrada_tipo ?? (image ? "formula" : situacion ? "texto_libre" : "cuestionario"),
      origen_campana: body.origen_campana ?? "",
    });

    res.json({
      ok: true,
      combo: resultado.combo,
      texto: resultado.resultado_texto,
      mensaje_whatsapp: resultado.mensaje_whatsapp,
    });
  } catch (err) {
    console.error("Error en Asesoría virtual:", err);
    res.status(500).json({ error: "No pudimos analizar tu caso en este momento." });
  }
});
