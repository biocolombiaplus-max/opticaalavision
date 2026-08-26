# Pipelines completos, remarketing y captura de correo — Bot ALaVision v3

Complementa `flujo-bot-v2.md` (los guiones de mensaje). Aquí van las etapas
completas de principio a fin, todo el remarketing que necesita el bot, y en
qué momento pedir el correo sin quemar la conversación.

## 1. Pipeline "Captación y Cierre" — mapeado a AIDA

| # | Etapa | Fase | Qué pasa | Gatillo dominante |
|---|---|---|---|---|
| 1 | Lead nuevo | Atención | Escribió desde el anuncio | Curiosidad (ya la generó el anuncio) |
| 2 | Bienvenida enviada | Atención → Interés | Sale el Mensaje 1 | Autoridad (firma la Dra.) |
| 3 | Calificando necesidad | Interés | Eligió fórmula / examen / montura | Compromiso (primer sí pequeño) |
| 4 | Perfil completo | Interés → Deseo | Edad y actividad capturadas, combo identificado | Personalización |
| 5 | Propuesta enviada (precio) | Deseo | Se entrega el combo + precio | Anclaje de precio |
| 6 | Objeción / Evaluando | Deseo con resistencia | Respondió "Lo pienso" o "Más información" | Prueba social + escasez |
| 7 | Cita agendada | Acción | Confirmó día y hora | Compromiso y coherencia |
| 8 | Recordatorio enviado | Acción | Aviso 24 h y 2 h antes de la cita | Aversión a la pérdida (no perder el cupo) |
| 9 | Atendido en consultorio | Acción | Examen realizado, cierre en persona | Autoridad presencial |
| 10 | Ganado — Compra realizada | Satisfacción | Pagó | Reciprocidad (garantía, seguimiento) |
| 11 | Postventa / Fidelización | Lealtad | Encuesta + solicitud de reseña + recordatorio de próxima renovación (6-12 meses) | Prueba social + anclaje futuro |
| 12 | Perdido / No interesado | — | Declinó explícitamente | — |

La Etapa 6 es la que faltaba en v2: no dejar la objeción en silencio hasta el
remarketing de 24 h — se responde en el momento (ver sección 4).

## 2. Todo el remarketing que necesita el bot

| Tipo | Dispara cuando | Objetivo |
|---|---|---|
| Objeción inmediata (misma conversación) | Responde "Lo pienso" / "Más información" en Etapa 6 | Resolver la duda ya, no esperar 24 h |
| Remarketing 24 h | No respondió ningún mensaje del bot en 24 h | Reactivar antes de que se enfríe |
| Recordatorio de cita | 24 h y 2 h antes de la hora agendada (Etapa 7→8) | Bajar el no-show |
| Remarketing 30 días | `#InteresAlto` que no llegó a "Ganado" | Recuperar al que sí quería comprar |
| Remarketing postventa | 6-12 meses después de "Ganado" | Recordar renovación de fórmula, repetir compra |
| Nutrición por correo (mensual) | Tiene correo pero no compró (Etapas 5-6 con email capturado) | Mantenerlo tibio con contenido, no gastar WhatsApp |

### Recordatorio de cita (nuevo, evita perder ventas ya agendadas)
> 24 h antes: "¡Hola! 😊 Le recuerdo su cita mañana a las [hora] con la Dra.
> Angie. ¿Confirma que asiste?"
Botones: **Sí, confirmo** · **Necesito cambiar** · **Debo cancelar**

> 2 h antes: "Ya casi es su hora 👓 La esperamos en [dirección]. ¡Nos vemos!"
(sin botones, es solo aviso)

## 3. Cuándo pedir el correo (y por qué ahí, no antes)

**Nunca en el Mensaje 1.** Pedirlo antes de dar algo de valor rompe el tono de
"doctora que asesora" y se siente como venta de datos.

| Momento | Qué decir | Por qué funciona ahí |
|---|---|---|
| Etapa 5 — al enviar la cotización | "¿A qué correo le envío la cotización en detalle y una guía gratis de cuidado de sus lentes?" | Reciprocidad: ya recibió valor (precio + asesoría), pedir algo a cambio se siente justo |
| Etapa 7 — al agendar la cita | "Le mando la confirmación también por correo para que no se le olvide" | Utilidad práctica + aversión a la pérdida |
| Etapa 6 — si dice "Lo pienso" | "Le regalo por correo la guía '5 señales de que necesita cambiar sus lentes' mientras lo piensa" | Reciprocidad; mantiene el lead en la base aunque no compre ya |
| Etapa 10 — post-compra | "Para enviarle su factura y activarlo en el programa de descuentos" | Utilidad legal (factura) + incentivo futuro |

**Línea de autorización de datos (Ley 1581 de 2012 — Habeas Data Colombia),**
agregarla la primera vez que se pide el correo:
> "Al darme su correo autoriza que se lo usemos para enviarle su cotización
> e información de nuestros servicios. ¿Cuál es su correo?"

Campo nuevo en Kommo: **Correo electrónico** (tipo Email) + etiqueta
`#BaseEmail` para poder exportarlo o conectarlo a la herramienta de mail
marketing.

## 4. Manejo de objeciones (Etapa 6 — no dejarlo para el remarketing)

**Si responde "Más información":**
> Claro, le cuento: el combo incluye examen, garantía de un año y el ajuste
> de la montura sin costo. ¿Qué le genera duda?
Botones: **El precio** · **La garantía** · **Ya quiero agendar**

**Si responde "Lo pienso":**
> Claro, tómese su tiempo 🙏 Esta semana varios pacientes con su misma
> necesidad ya aprovecharon la promo. ¿Le guardo el cupo por 24 horas?
Botones: **Sí, guárdemelo** · **Aún no** · **No por ahora**

- "Sí, guárdemelo" → vuelve a Etapa 5 (propuesta) con urgencia real de 24 h.
- "Aún no" → Etapa 6 se mantiene, entra al remarketing 24 h normal.
- "No por ahora" → Perdido, pero si ya dio correo, sigue en nutrición mensual.

## 5. Gatillos mentales — tabla resumen por etapa

| Gatillo | Etapa donde vive | Frase ejemplo |
|---|---|---|
| Autoridad | 2, 9 | "Soy la Dra. Angie, optómetra..." |
| Compromiso y coherencia | 3, 4 | Cada botón es un sí pequeño antes del sí grande |
| Anclaje de precio | 5 | Nombrar todo lo que incluye antes del precio |
| Prueba social | 6, 11 | "Varios pacientes ya aprovecharon la promo esta semana" |
| Escasez / urgencia | 6, 8 | "Le guardo el cupo por 24 horas" |
| Aversión a la pérdida | 6, 8 | "No se le olvide, ya tiene su cupo" |
| Reciprocidad | 3 (fórmula), 5, 6, 10 | Ofrecer revisión gratis o guía antes de pedir el correo |
| Personalización | 4 | Usar edad/actividad para armar el combo "a su medida" |
| Efecto de primera opción | 1 (Mensaje 1) | "Ya tengo fórmula" primero porque es lo más frecuente |

## 6. Checklist de este ajuste

- [ ] Agregar la Etapa 6 (Objeción/Evaluando) con sus 2 mensajes al Pipeline 1.
- [ ] Crear el campo **Correo electrónico** y la etiqueta `#BaseEmail`.
- [ ] Programar los 2 recordatorios de cita (24 h y 2 h antes).
- [ ] Crear la automatización de remarketing postventa (6-12 meses después de "Ganado").
- [ ] Conectar `#BaseEmail` a la herramienta de mail marketing (Mailchimp / Brevo / la que uses).
- [ ] Agregar la línea de autorización de datos la primera vez que se pide el correo.
