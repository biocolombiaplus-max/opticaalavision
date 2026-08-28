import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { SEDES_Y_PRECIOS } from "./systemPrompt.js";

const client = config.anthropicApiKey ? new Anthropic({ apiKey: config.anthropicApiKey }) : null;
const MODEL = "claude-opus-5";

export const COMBOS_VALIDOS = [
  "Solo montura",
  "Monofocal",
  "Monofocal Premium (Transitions)",
  "Progresivo digital gama alta",
  "Bifocal",
] as const;

export interface AsesoriaInput {
  nombre: string;
  edad?: number;
  respuestas?: Record<string, string>;
  situacion?: string;
  image?: { base64: string; mimeType: string };
}

export interface AsesoriaResultado {
  combo: string;
  resultado_texto: string;
  mensaje_whatsapp: string;
  nota_interna: string;
}

const ASESORIA_SYSTEM_PROMPT = `Eres Vale, asesora con más de 25 años de experiencia en atención en ópticas,
de Óptica ALaVision (Cúcuta, Colombia). Vas a analizar UNA SOLA VEZ el caso de un visitante de la
página web que llegó a la herramienta de "Asesoría virtual" — esto no es una conversación de ida y
vuelta, es un único análisis con lo que te compartió: respuestas a un cuestionario corto, una foto
de su fórmula optométrica, y/o una descripción escrita de su situación con sus propias palabras
(puede venir cualquier combinación de estas tres cosas).

No eres la optómetra — la Dra. Angie es quien hace el examen real y confirma todo en persona.
Nunca inventes valores de una fórmula que no puedas leer con certeza; si la foto no es legible,
dilo con naturalidad en el resultado y basa tu recomendación en lo demás que tengas disponible.

${SEDES_Y_PRECIOS}

## Qué debes producir
- **resultado_texto**: la explicación para mostrarle al visitante en pantalla. 2-4 líneas, cercana,
  segura, como si esa persona estuviera frente a ti en el mostrador — nunca sonando a máquina ni
  repitiendo esta guía de forma literal. Explica brevemente el porqué del combo que recomiendas.
  Si detectas algo que amerite el examen completo (fórmula vieja, primera vez usando lentes,
  síntomas marcados), dilo con naturalidad, sin alarmar.
- **combo**: exactamente uno de estos valores: "Solo montura", "Monofocal",
  "Monofocal Premium (Transitions)", "Progresivo digital gama alta", "Bifocal".
- **mensaje_whatsapp**: un mensaje corto en primera persona, como si el VISITANTE MISMO lo fuera a
  enviar por WhatsApp a la óptica para agendar o cotizar — mencionando su nombre y el resultado que
  obtuvo. Debe sonar natural, como algo que alguien realmente escribiría, no un resumen técnico.
- **nota_interna**: nota corta para el equipo humano (asesoras) con el contexto clave para llamar o
  escribir y cerrar — qué le preocupa, qué tan urgente parece, qué combo le ofreciste y por qué.

Responde siempre usando la herramienta "dar_resultado_asesoria".`;

function buildUserText(input: AsesoriaInput): string {
  const lines: string[] = [`Nombre del visitante: ${input.nombre}`];
  if (input.edad) lines.push(`Edad: ${input.edad} años`);
  if (input.respuestas && Object.keys(input.respuestas).length) {
    lines.push("Respuestas del cuestionario rápido:");
    for (const [k, v] of Object.entries(input.respuestas)) lines.push(`- ${k}: ${v}`);
  }
  if (input.situacion) {
    lines.push("Descripción de su situación, escrita por él/ella mismo/a:");
    lines.push(input.situacion);
  }
  if (input.image) {
    lines.push("También envió una foto — revísala, es probablemente su fórmula optométrica.");
  }
  if (!input.respuestas && !input.situacion && !input.image) {
    lines.push("No compartió más información — da una recomendación general y anímalo a contar más por WhatsApp.");
  }
  return lines.join("\n");
}

const ASESORIA_TOOL: Anthropic.Tool = {
  name: "dar_resultado_asesoria",
  description: "Entrega el resultado personalizado de la Asesoría virtual de la landing.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      combo: { type: "string", enum: [...COMBOS_VALIDOS] },
      resultado_texto: { type: "string" },
      mensaje_whatsapp: { type: "string" },
      nota_interna: { type: "string" },
    },
    required: ["combo", "resultado_texto", "mensaje_whatsapp", "nota_interna"],
    additionalProperties: false,
  },
};

export async function askAsesoria(input: AsesoriaInput): Promise<AsesoriaResultado> {
  if (!client) {
    const { askAsesoriaGemini } = await import("./asesoriaGemini.js");
    return askAsesoriaGemini(input);
  }
  try {
    return await askAsesoriaClaude(input);
  } catch (err) {
    console.error("Claude falló en asesoría, se usa Gemini como respaldo:", err);
    const { askAsesoriaGemini } = await import("./asesoriaGemini.js");
    return askAsesoriaGemini(input);
  }
}

async function askAsesoriaClaude(input: AsesoriaInput): Promise<AsesoriaResultado> {
  if (!client) throw new Error("Cliente de Claude no inicializado.");
  const content: Anthropic.MessageParam["content"] = [];

  if (input.image) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: input.image.mimeType as "image/jpeg" | "image/png" | "image/webp",
        data: input.image.base64,
      },
    });
  }
  content.push({ type: "text", text: buildUserText(input) });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 700,
    system: [{ type: "text", text: ASESORIA_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    tools: [ASESORIA_TOOL],
    tool_choice: { type: "tool", name: "dar_resultado_asesoria" },
    messages: [{ role: "user", content }],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "dar_resultado_asesoria",
  );
  if (!toolUse) throw new Error("La asesoría no devolvió una respuesta estructurada válida.");
  return toolUse.input as AsesoriaResultado;
}

export { ASESORIA_SYSTEM_PROMPT, buildUserText };
