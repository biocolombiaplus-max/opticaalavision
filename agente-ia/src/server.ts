import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "./config.js";
import { webhookRouter } from "./whatsapp/webhook.js";
import { crmRouter, basicAuth } from "./crm/routes.js";
import { citasPublicRouter, citasAdminRouter } from "./citas/routes.js";
import { settingsPublicRouter, settingsAdminRouter, uploadsDir } from "./settings/routes.js";
import { remarketingAdminRouter } from "./remarketing/routes.js";
import { reportsAdminRouter } from "./reports/routes.js";
import { catalogoPublicRouter, catalogoAdminRouter } from "./catalogo/routes.js";
import { asesoriaPublicRouter } from "./asesoria/routes.js";
import { chatPublicRouter } from "./chat/routes.js";
import { monturaPublicRouter } from "./montura/routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// --- Público: WhatsApp necesita llamar el webhook sin autenticación ---
app.use(webhookRouter);

// --- Público: la landing y lo que necesita para funcionar ---
app.use(citasPublicRouter);
app.use(settingsPublicRouter);
app.use(catalogoPublicRouter);
app.use(asesoriaPublicRouter);
app.use(chatPublicRouter);
app.use(monturaPublicRouter);
app.use("/uploads", express.static(uploadsDir));
// El probador de monturas en vivo carga estos archivos (modelos de reconocimiento facial y la
// librería face-api.js) — no cambian entre despliegues, así que se cachean varios días en el
// navegador para que la cámara en vivo abra rápido en visitas siguientes.
app.use("/models", express.static(join(__dirname, "public", "models"), { maxAge: "7d", immutable: true }));
app.use("/vendor", express.static(join(__dirname, "public", "vendor"), { maxAge: "7d", immutable: true }));
app.use(express.static(join(__dirname, "public"))); // sirve "/" -> landing/index.html, "/tienda" -> tienda/index.html

// --- Todo lo de abajo requiere usuario/clave del panel administrativo ---
app.use(basicAuth);
app.use("/admin", express.static(join(__dirname, "crm", "public")));
app.use(crmRouter);
app.use(citasAdminRouter);
app.use(settingsAdminRouter);
app.use(remarketingAdminRouter);
app.use(reportsAdminRouter);
app.use(catalogoAdminRouter);

app.listen(config.port, () => {
  console.log(`Óptica ALaVision — servidor escuchando en el puerto ${config.port}`);
});
