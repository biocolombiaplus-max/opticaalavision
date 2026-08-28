import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "./config.js";
import { webhookRouter } from "./whatsapp/webhook.js";
import { crmRouter, basicAuth } from "./crm/routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// El webhook de WhatsApp NO lleva autenticación básica (Meta no la soporta).
app.use(webhookRouter);

// Todo lo del panel CRM sí queda protegido.
app.use(basicAuth);
app.use(crmRouter);
app.use(express.static(join(__dirname, "crm", "public")));

app.listen(config.port, () => {
  console.log(`Óptica ALaVision — servidor escuchando en el puerto ${config.port}`);
});
