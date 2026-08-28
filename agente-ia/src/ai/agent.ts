import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
import type { Mensaje, Etapa, NivelInteres } from "../db/index.js";

const client = new Anthropic({ apiKey: config.anthropicApiKey });

const MODEL = "claude-opus-5";

export interface AgentReply {
  mensaje: string;
  botones: string[];
  etapa: Etapa;
  nivel_interes: NivelInteres;
  etiquetas: string[];
  necesita_humano: boolean;
  nota_interna: string;
  correo: string;
}

const RESPONDER_TOOL: Anthropic.Tool = {
  name: "responder_paciente",
  description:
    "Envía la respuesta al paciente por WhatsApp y actualiza su estado en el CRM de la óptica.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      mensaje: {
        type: "string",
        description: "Texto a enviar al paciente. Máximo 3 líneas, tono cercano y profesional.",
      },
      botones: {
        type: "array",
        items: { type: "string" },
        maxItems: 3,
        description:
          "0 a 3 botones de respuesta rápida (máx. 20 caracteres cada uno). Vacío si la respuesta requiere texto libre.",
      },
      etapa: {
        type: "string",
        enum: [
          "nuevo",
          "calificando",
          "propuesta_enviada",
          "objecion",
          "cita_agendada",
          "ganado",
          "perdido",
        ],
        description: "Etapa del pipeline en la que queda el lead después de este mensaje.",
      },
      nivel_interes: {
        type: "string",
        enum: ["alto", "medio", "bajo"],
      },
      etiquetas: {
        type: "array",
        items: { type: "string" },
        description:
          "Etiquetas a agregar, ej: SoloMontura, Renovacion, Combo, PrimeraVez, SedeLosAndes, SedePrincipal, BaseEmail.",
      },
      necesita_humano: {
        type: "boolean",
        description: "true si esta conversación debe pasar a un asesor humano ahora mismo.",
      },
      nota_interna: {
        type: "string",
        description: "Nota corta para el equipo humano. Cadena vacía si no aplica.",
      },
      correo: {
        type: "string",
        description:
          "El correo del paciente, SOLO si te lo acaba de dar en este mensaje. Cadena vacía en cualquier otro caso.",
      },
    },
    required: [
      "mensaje",
      "botones",
      "etapa",
      "nivel_interes",
      "etiquetas",
      "necesita_humano",
      "nota_interna",
      "correo",
    ],
    additionalProperties: false,
  },
};

function historyToMessages(history: Mensaje[]): Anthropic.MessageParam[] {
  return history.map((m) => ({
    role: m.rol === "paciente" ? "user" : "assistant",
    content: m.texto,
  }));
}

export interface IncomingContent {
  text?: string;
  image?: { base64: string; mimeType: string };
}

export async function askAgent(history: Mensaje[], incoming: IncomingContent): Promise<AgentReply> {
  try {
    return await askClaude(history, incoming);
  } catch (err) {
    console.error("Claude falló, se usa Gemini como respaldo:", err);
    const { askGemini } = await import("./gemini.js");
    return askGemini(history, incoming);
  }
}

async function askClaude(history: Mensaje[], incoming: IncomingContent): Promise<AgentReply> {
  const userContent: Anthropic.MessageParam["content"] = [];

  if (incoming.image) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: incoming.image.mimeType as "image/jpeg" | "image/png" | "image/webp",
        data: incoming.image.base64,
      },
    });
    userContent.push({
      type: "text",
      text: incoming.text?.trim()
        ? incoming.text
        : "[El paciente envió esta imagen sin escribir texto. Revisa si es una fórmula optométrica.]",
    });
  } else {
    userContent.push({ type: "text", text: incoming.text ?? "" });
  }

  const messages: Anthropic.MessageParam[] = [
    ...historyToMessages(history),
    { role: "user", content: userContent },
  ];

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    tools: [RESPONDER_TOOL],
    tool_choice: { type: "tool", name: "responder_paciente" },
    messages,
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "responder_paciente",
  );

  if (!toolUse) {
    throw new Error("El agente no devolvió una respuesta estructurada válida.");
  }

  return toolUse.input as AgentReply;
}
