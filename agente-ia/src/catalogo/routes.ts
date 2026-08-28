import { Router } from "express";
import {
  listMarcas,
  createMarca,
  deleteMarca,
  listProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  createTestVision,
  listTestVision,
} from "../db/index.js";

export const catalogoPublicRouter = Router();
export const catalogoAdminRouter = Router();

// ---------------- Marcas ----------------
catalogoPublicRouter.get("/api/marcas", (_req, res) => res.json(listMarcas()));

catalogoAdminRouter.post("/api/marcas", (req, res) => {
  const { nombre, logo_url } = req.body as { nombre: string; logo_url: string };
  res.json(createMarca(nombre, logo_url));
});

catalogoAdminRouter.delete("/api/marcas/:id", (req, res) => {
  deleteMarca(Number(req.params.id));
  res.json({ ok: true });
});

// ---------------- Productos ----------------
catalogoPublicRouter.get("/api/productos", (_req, res) => res.json(listProductos(true)));

catalogoAdminRouter.get("/api/productos/todos", (_req, res) => res.json(listProductos(false)));

catalogoAdminRouter.post("/api/productos", (req, res) => {
  const body = req.body as {
    nombre: string;
    marca_id: number | null;
    categoria: string;
    precio: number;
    descripcion: string;
    imagen_url: string;
    destacado: boolean;
  };
  res.json(createProducto(body));
});

catalogoAdminRouter.put("/api/productos/:id", (req, res) => {
  updateProducto(Number(req.params.id), req.body);
  res.json({ ok: true });
});

catalogoAdminRouter.delete("/api/productos/:id", (req, res) => {
  deleteProducto(Number(req.params.id));
  res.json({ ok: true });
});

// ---------------- Test de visión (orientación guionada, sin IA) ----------------

interface RespuestasTest {
  usaLentes: "si" | "no";
  dificultad: "lejos" | "cerca" | "ambas" | "ninguna";
  pantallas: "poco" | "medio" | "mucho";
  aireLibre: "si" | "no";
}

function calcularResultado(edad: number, r: RespuestasTest): { combo: string; texto: string } {
  let combo: string;
  if (edad < 37) combo = "Monofocal";
  else if (edad <= 59) combo = r.dificultad === "ambas" ? "Bifocal" : "Progresivo";
  else combo = "Bifocal";

  if (edad < 37 && r.aireLibre === "si") {
    combo = "Monofocal Premium (Transitions)";
  }

  const extra =
    r.pantallas === "mucho"
      ? " Como pasas muchas horas en pantallas, te conviene que tu lente lleve protección de pantalla y antireflejo — ya incluidos en tu combo recomendado."
      : "";

  const texto = `Según tu edad y hábitos visuales, tu combo orientativo es ${combo}.${extra} Esto es una orientación general, no reemplaza el examen visual — la Dra. Angie confirma todo en tu cita.`;

  return { combo, texto };
}

catalogoPublicRouter.post("/api/test-vision", (req, res) => {
  const body = req.body as {
    nombre?: string;
    telefono?: string;
    correo?: string;
    edad?: number;
    respuestas?: RespuestasTest;
    origen_campana?: string;
  };

  if (!body.nombre || !body.telefono || !body.correo || !body.edad || !body.respuestas) {
    res.status(400).json({ error: "Faltan datos." });
    return;
  }

  const { combo, texto } = calcularResultado(Number(body.edad), body.respuestas);

  createTestVision({
    nombre: body.nombre,
    telefono: body.telefono,
    correo: body.correo,
    edad: Number(body.edad),
    respuestas: body.respuestas as unknown as Record<string, string>,
    resultado_combo: combo,
    origen_campana: body.origen_campana ?? "",
  });

  res.json({ ok: true, combo, texto });
});

catalogoAdminRouter.get("/api/test-vision", (_req, res) => res.json(listTestVision()));

catalogoAdminRouter.get("/api/test-vision/csv", (_req, res) => {
  const rows = listTestVision();
  const header = "nombre,telefono,correo,edad,resultado_combo,origen_campana,creado_en";
  const csvEscape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.nombre, r.telefono, r.correo, String(r.edad), r.resultado_combo, r.origen_campana, r.creado_en]
      .map(csvEscape)
      .join(","),
  );
  const csv = [header, ...lines].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="test-vision.csv"');
  res.send("﻿" + csv);
});
