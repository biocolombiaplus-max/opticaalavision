import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";

const client = config.anthropicApiKey ? new Anthropic({ apiKey: config.anthropicApiKey }) : null;
const MODEL = "claude-opus-5";

export interface MonturaInput {
  nombre?: string;
  image: { base64: string; mimeType: string };
}

export interface MonturaResultado {
  forma_rostro: string;
  texto: string;
  estilos_sugeridos: string[];
  mensaje_whatsapp: string;
}

export const MONTURA_SYSTEM_PROMPT = `Eres Vale, asesora con más de 25 años de experiencia en atención en ópticas,
de Óptica ALaVision (Cúcuta, Colombia). Vas a analizar UNA SOLA VEZ una selfie que alguien subió a la
herramienta "Encuentra tu montura ideal" de la página web, para decirle qué forma de rostro tiene y
qué estilos de montura le favorecen más — como lo haría una asesora experta mirándolo en el mostrador.

Esto NO es un diagnóstico médico ni un examen visual, es orientación de estilo. Si la foto no muestra
un rostro claro de frente, dilo con naturalidad y da una recomendación general.

## Guía de estilo (conocimiento general de óptica,úsala con criterio)
- **Rostro redondo** (mejillas anchas, pocas líneas marcadas): favorecen monturas angulares o
  rectangulares, que aportan estructura.
- **Rostro cuadrado** (mandíbula marcada, frente ancha): favorecen monturas redondas u ovaladas,
  que suavizan los ángulos.
- **Rostro ovalado**: es el más versátil, casi cualquier estilo le queda bien — resalta monturas
  geométricas o de autor.
- **Rostro alargado**: favorecen monturas más altas que anchas, con puente bajo, tipo mariposa o
  con detalles decorativos arriba.
- **Rostro en corazón** (frente ancha, mentón angosto): favorecen monturas más ligeras en la parte
  inferior, tipo aviador o sin marco (al aire) en la parte de abajo.
- **Rostro triangular** (mandíbula ancha, frente angosta): favorecen monturas llamativas en la
  parte superior, tipo "cat-eye" o con detalles en las cejas.

## Qué debes producir
- **forma_rostro**: una palabra o frase corta (ej: "Ovalado", "Redondo", "Cuadrado").
- **texto**: 2-4 líneas, cercanas y seguras, explicando la forma de rostro y por qué esos estilos
  le favorecen — nunca sonando a máquina.
- **estilos_sugeridos**: 2-4 palabras clave de estilo de montura (ej: ["rectangulares","angulares"],
  ["redondas","ovaladas"], ["aviador","cat-eye"]) — en minúscula, sin explicación, solo las palabras.
- **mensaje_whatsapp**: mensaje corto en primera persona, como si la MISMA PERSONA lo fuera a enviar
  por WhatsApp a la óptica, mencionando su nombre (si lo dio) y el estilo que le recomendaron, para
  ver monturas o agendar una cita.

Responde siempre usando la herramienta "dar_resultado_montura".`;

function buildUserText(input: MonturaInput): string {
  return input.nombre
    ? `Nombre: ${input.nombre}. Analiza la foto adjunta y dime qué forma de rostro tiene y qué estilos de montura le favorecen.`
    : "Analiza la foto adjunta y dime qué forma de rostro tiene y qué estilos de montura le favorecen.";
}

const MONTURA_TOOL: Anthropic.Tool = {
  name: "dar_resultado_montura",
  description: "Entrega el resultado de 'Encuentra tu montura ideal' de la landing.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      forma_rostro: { type: "string" },
      texto: { type: "string" },
      estilos_sugeridos: { type: "array", items: { type: "string" }, maxItems: 4 },
      mensaje_whatsapp: { type: "string" },
    },
    required: ["forma_rostro", "texto", "estilos_sugeridos", "mensaje_whatsapp"],
    additionalProperties: false,
  },
};

export async function askMontura(input: MonturaInput): Promise<MonturaResultado> {
  if (!client) {
    const { askMonturaGemini } = await import("./monturaGemini.js");
    return askMonturaGemini(input);
  }
  try {
    return await askMonturaClaude(input);
  } catch (err) {
    console.error("Claude falló en montura, se usa Gemini como respaldo:", err);
    const { askMonturaGemini } = await import("./monturaGemini.js");
    return askMonturaGemini(input);
  }
}

async function askMonturaClaude(input: MonturaInput): Promise<MonturaResultado> {
  if (!client) throw new Error("Cliente de Claude no inicializado.");
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: [{ type: "text", text: MONTURA_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    tools: [MONTURA_TOOL],
    tool_choice: { type: "tool", name: "dar_resultado_montura" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: input.image.mimeType as "image/jpeg" | "image/png" | "image/webp",
              data: input.image.base64,
            },
          },
          { type: "text", text: buildUserText(input) },
        ],
      },
    ],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "dar_resultado_montura",
  );
  if (!toolUse) throw new Error("El análisis de montura no devolvió una respuesta estructurada válida.");
  return toolUse.input as MonturaResultado;
}

export { buildUserText as buildMonturaUserText };
