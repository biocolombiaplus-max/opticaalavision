import { SYSTEM_PROMPT } from "./systemPrompt.js";
import { config } from "../config.js";
import type { AgentReply } from "./agent.js";
import type { Mensaje } from "../db/index.js";
import type { IncomingContent } from "./agent.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

const JSON_INSTRUCTIONS = `
Responde ÚNICAMENTE con un objeto JSON (sin texto antes ni después, sin bloques de código)
con exactamente estas claves:
{
  "mensaje": string,               // máx. 3 líneas
  "botones": string[],             // 0 a 3, cada uno máx. 20 caracteres
  "etapa": "nuevo"|"calificando"|"propuesta_enviada"|"objecion"|"cita_agendada"|"ganado"|"perdido",
  "nivel_interes": "alto"|"medio"|"bajo",
  "etiquetas": string[],
  "necesita_humano": boolean,
  "nota_interna": string,          // cadena vacía si no aplica
  "correo": string                 // solo si te lo acaba de dar; cadena vacía si no
}`;

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

function historyToContents(history: Mensaje[]): Array<{ role: string; parts: GeminiPart[] }> {
  return history.map((m) => ({
    role: m.rol === "paciente" ? "user" : "model",
    parts: [{ text: m.texto }],
  }));
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Gemini no devolvió JSON reconocible: " + text);
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Agente con Gemini — se usa como principal si no hay ANTHROPIC_API_KEY configurada,
 * o como respaldo automático si la llamada a Claude falla.
 * Usa la API REST directa de Google (no un SDK) para no depender de una versión
 * de librería que pueda haber cambiado — si Google ajusta el nombre del modelo,
 * cámbialo con la variable de entorno GEMINI_MODEL.
 */
export async function askGemini(history: Mensaje[], incoming: IncomingContent): Promise<AgentReply> {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en tu .env.");
  }

  const parts: GeminiPart[] = [];
  if (incoming.image) {
    parts.push({ inline_data: { mime_type: incoming.image.mimeType, data: incoming.image.base64 } });
  }
  parts.push({
    text: incoming.text?.trim()
      ? incoming.text
      : "[El paciente envió una imagen sin escribir texto. Revisa si es una fórmula optométrica.]",
  });

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT + "\n\n" + JSON_INSTRUCTIONS }] },
    contents: [...historyToContents(history), { role: "user", parts }],
    generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );

  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini no devolvió contenido: " + JSON.stringify(data));

  return extractJson(text) as AgentReply;
}
