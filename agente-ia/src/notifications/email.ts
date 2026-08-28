/**
 * Envío de correos vía Resend (resend.com) — API sencilla y estable por REST.
 * Si no hay RESEND_API_KEY configurada, no falla: solo deja constancia en el
 * log, para que el resto del flujo (la cita en sí) no se rompa por esto.
 */

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "Óptica ALaVision <citas@opticaalavision.com>";

  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY no configurada — no se envió el correo a ${to}.`);
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    console.error(`[email] Resend respondió ${res.status}: ${await res.text()}`);
    return false;
  }
  return true;
}

export function plantillaConfirmacionCita(input: {
  nombre: string;
  servicio: string;
  sede: string;
  fecha: string;
  hora: string;
  direccion: string;
  mapsUrl: string;
}): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#14161f;">
    <h2 style="color:#1f2a52;">¡Tu cita quedó confirmada, ${input.nombre}!</h2>
    <p><b>Servicio:</b> ${input.servicio}<br/>
    <b>Sede:</b> ${input.sede}<br/>
    <b>Fecha:</b> ${input.fecha} — <b>Hora:</b> ${input.hora}</p>
    <p style="color:#4a4e5e;">${input.direccion}</p>
    <a href="${input.mapsUrl}" style="display:inline-block;margin-top:16px;padding:12px 22px;
      background:#1f2a52;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">
      Cómo llegar
    </a>
    <p style="margin-top:28px;font-size:12px;color:#8b8f9e;">
      Óptica ALaVision — si necesitas cambiar tu cita, escríbenos por WhatsApp.
    </p>
  </div>`;
}
