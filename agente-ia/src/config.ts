import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa tu archivo .env (usa .env.example como guía).`);
  }
  return value;
}

export const config = {
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
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
