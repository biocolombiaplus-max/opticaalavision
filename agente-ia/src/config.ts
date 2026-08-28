import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa tu archivo .env (usa .env.example como guía).`);
  }
  return value;
}

const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim() || undefined;
const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || undefined;

if (!anthropicApiKey && !geminiApiKey) {
  throw new Error(
    "Necesitas al menos una clave de IA: ANTHROPIC_API_KEY o GEMINI_API_KEY en tu .env. " +
      "Si solo tienes Gemini, con GEMINI_API_KEY es suficiente — el agente lo usa directamente.",
  );
}

export const config = {
  // Cualquiera de las dos puede faltar — el agente usa la que sí esté configurada
  // (ver src/ai/agent.ts). Si solo tienes Gemini, deja ANTHROPIC_API_KEY vacía.
  anthropicApiKey,
  geminiApiKey,
  whatsapp: {
    accessToken: required("WHATSAPP_ACCESS_TOKEN"),
    phoneNumberId: required("WHATSAPP_PHONE_NUMBER_ID"),
    verifyToken: required("WHATSAPP_VERIFY_TOKEN"),
  },
  crm: {
    user: process.env.CRM_USER ?? "admin",
    password: process.env.CRM_PASSWORD ?? "changeme",
  },
  port: Number(process.env.PORT ?? 3000),
  dbPath: process.env.DB_PATH ?? "./data/alavision.db",
};
