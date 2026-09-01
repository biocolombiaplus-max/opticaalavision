import { Router } from "express";
import multer from "multer";
import { askMontura } from "../ai/montura.js";
import { listProductos } from "../db/index.js";
import { createIpRateLimiter } from "../lib/rateLimit.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) {
      cb(new Error("Solo se permiten fotos (png, jpg, webp)."));
      return;
    }
    cb(null, true);
  },
});

// Ruta pública que consume IA en cada llamada — se protege de abuso/spam.
const permitido = createIpRateLimiter(8, 15 * 60 * 1000);

export const monturaPublicRouter = Router();

monturaPublicRouter.post("/api/montura/analizar", upload.single("archivo"), async (req, res) => {
  if (!permitido(req.ip ?? "desconocido")) {
    res.status(429).json({ error: "Muchas solicitudes seguidas. Espera un momento e intenta de nuevo." });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "Sube una foto de tu rostro." });
    return;
  }

  const nombre = (req.body as { nombre?: string }).nombre?.trim() || undefined;

  try {
    const resultado = await askMontura({
      nombre,
      image: { base64: req.file.buffer.toString("base64"), mimeType: req.file.mimetype },
    });

    const estilos = resultado.estilos_sugeridos.map((e) => e.toLowerCase());
    const todos = listProductos(true);
    let sugeridos = todos.filter((p) =>
      estilos.some((e) => p.categoria.toLowerCase().includes(e) || p.nombre.toLowerCase().includes(e)),
    );
    if (sugeridos.length === 0) sugeridos = todos.filter((p) => p.destacado);
    sugeridos = sugeridos.slice(0, 6);

    res.json({
      ok: true,
      forma_rostro: resultado.forma_rostro,
      texto: resultado.texto,
      estilos_sugeridos: resultado.estilos_sugeridos,
      mensaje_whatsapp: resultado.mensaje_whatsapp,
      productos: sugeridos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        precio: p.precio,
        imagen_url: p.imagen_url,
        imagen_transparente_url: p.imagen_transparente_url,
      })),
    });
  } catch (err) {
    console.error("Error en Encuentra tu montura ideal:", err);
    res.status(500).json({ error: "No pudimos analizar tu foto en este momento." });
  }
});
