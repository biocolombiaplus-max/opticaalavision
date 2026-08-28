import { config } from "../config.js";
import { ASESORIA_SYSTEM_PROMPT, buildUserText, type AsesoriaInput, type AsesoriaResultado } from "./asesoria.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

const JSON_INSTRUCTIONS = `
Responde ÚNICAMENTE con un objeto JSON (sin texto antes ni después, sin bloques de código)
con exactamente estas claves:
{
  "combo": "Solo montura"|"Monofocal"|"Monofocal Premium (Transitions)"|"Progresivo digital gama alta"|"Bifocal",
  "resultado_texto": string,
  "mensaje_whatsapp": string,
  "nota_interna": string
}`;

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Gemini no devolvió JSON reconocible: " + text);
  return JSON.parse(text.slice(start, end + 1));
}

export async function askAsesoriaGemini(input: AsesoriaInput): Promise<AsesoriaResultado> {
  const apiKey = config.geminiApiKey;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada en tu .env.");

  const parts: GeminiPart[] = [];
  if (input.image) {
    parts.push({ inline_data: { mime_type: input.image.mimeType, data: input.image.base64 } });
  }
  parts.push({ text: buildUserText(input) });

  const body = {
    system_instruction: { parts: [{ text: ASESORIA_SYSTEM_PROMPT + "\n\n" + JSON_INSTRUCTIONS }] },
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.5, responseMimeType: "application/json" },
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

  return extractJson(text) as AsesoriaResultado;
}
