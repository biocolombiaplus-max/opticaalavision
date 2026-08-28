# Guía de instalación en Kommo — paso a paso

Consolida todo lo de `agente-asesora-final.md`, `pipelines-remarketing-datos.md`
y `flujo-bot-v2.md` en el orden exacto para montarlo sin perderte. Sigue las
fases en orden — cada una depende de la anterior.

## Fase 0 · Requisitos previos

1. Ajustes → Integraciones → confirma que tu proveedor de WhatsApp aparece
   como "Conectado".
2. Confirma que tienes Salesbot / Digital Pipeline habilitado (plan Advanced
   o Enterprise). Si no ves el ícono del rayo en el pipeline, escribe a
   soporte de Kommo para activarlo.

## Fase 1 · Campos personalizados

Ajustes → Campos personalizados → Leads → crea estos 8, en este orden:

| Campo | Tipo | Opciones |
|---|---|---|
| Documento recibido | Lista | Pendiente revisar / Fórmula / Foto de montura / Otro |
| Sede | Lista | Los Andes / Principal |
| Tipo de necesidad | Lista | Solo montura / Montura + lentes / Examen completo |
| Nivel de interés | Lista | Alto / Medio / Bajo |
| Edad | Numérico | — |
| Actividad | Texto corto | — |
| Correo electrónico | Email | — |
| Intentos remarketing | Numérico | — (para topar en 3 ciclos) |

## Fase 2 · Etiquetas

Créalas ya (Ajustes → Etiquetas, o escríbelas la primera vez que las uses):

`#FormulaRecibida` `#SoloMontura` `#SedeLosAndes` `#Renovacion`
`#SedePrincipal` `#Combo` `#PrimeraVez` `#InteresAlto` `#InteresMedio`
`#BaseEmail` `#NoContactar`

## Fase 3 · Pipelines y etapas

Ajustes → Embudo de venta → Agregar embudo. Crea 3:

**Captación y Cierre** (12 etapas): Lead nuevo → Bienvenida enviada →
Calificando necesidad → Perfil completo → Propuesta enviada → Objeción/Evaluando
→ Cita agendada → Recordatorio enviado → Atendido en consultorio → Ganado →
Postventa/Fidelización → Perdido.

**Remarketing 24H**: Reintento enviado → Retomó → Sin respuesta → Perdido.

**Remarketing 30 días**: Reintento enviado → Reactivado → Lo sigue pensando →
Perdido.

## Fase 4 · Construir el Salesbot

1. Entra al pipeline "Captación y Cierre" → ícono del rayo (Salesbot) →
   **Crear bot** → **En blanco**. Nómbralo "Vale - Bot ALaVision".
2. Disparador: "Cuando se recibe un mensaje entrante" en la etapa "Lead nuevo".
3. Primer bloque — **Condición: ¿es imagen?** (sección "Código para Kommo" del
   artefacto — Opción 1 nativa si la encuentras, si no, Opción 2 con el paso
   de código).
   - **Rama SÍ** → etiqueta `#FormulaRecibida`, notifica al asesor, crea la
     tarea "Revisar imagen y cotizar", envía el mensaje corto de la ruta
     rápida, **detiene el bot**.
   - **Rama NO** → sigue al Mensaje 1.
4. **Mensaje 1** — pega el texto de Vale + los 3 botones (Solo montura /
   Montura + lentes / Examen + todo). Texto exacto en
   `agente-asesora-final.md` sección 2.
5. **Condición** — una rama por botón presionado.
6. Arma cada rama (A, B, C) mensaje por mensaje copiando el texto exacto del
   documento — en cada cierre agrega: etiqueta correspondiente + cambio de
   etapa a "Propuesta enviada" + notificar al asesor.
7. Después de cada mensaje de cierre con precio, agrega el **manejo de
   objeciones** (condición sobre "Más información" / "Lo pienso") — sección
   4 de `pipelines-remarketing-datos.md`.
8. Guarda y **activa** el bot (interruptor arriba a la derecha).

## Fase 5 · Remarketing y recordatorios

1. **24 h:** después de cada mensaje que espera respuesta, agrega un paso
   "Esperar 24 horas" → condición "sin respuesta" → mover a pipeline
   Remarketing 24H + enviar la plantilla HSM R24.
2. **Recordatorio de cita:** automatización en la etapa "Cita agendada" — 24 h
   y 2 h antes de la hora agendada, envía la plantilla de recordatorio.
3. **30 días:** automatización en "Captación y Cierre": si el lead lleva 30
   días sin movimiento Y tiene `#InteresAlto` o `#InteresMedio` → mover a
   Remarketing 30 días + plantilla HSM R30. Usa el campo "Intentos
   remarketing" para topar en 3 ciclos.
4. **Postventa:** automatización en la etapa "Ganado" — 6 meses después,
   enviar el mensaje de control/renovación.

## Fase 6 · Plantillas HSM (en el proveedor de WhatsApp, no en Kommo)

Envía a aprobación de Meta estas 4 plantillas antes de activar los pasos de
espera: Recordatorio de cita, Remarketing 24 h, Remarketing 30 días,
Postventa. Se hace desde el panel de tu proveedor (sección "Plantillas de
mensajes"); la aprobación de Meta tarda entre 24 y 48 horas — hazlo primero,
todo lo demás puede esperar a que aprueben.

## Fase 7 · Pruebas antes de lanzar

Con un celular externo (no el tuyo de asesor):

- [ ] Escribe "hola" y prueba las 3 ramas completas (A, B, C).
- [ ] Manda una foto sin escribir nada — confirma que el bot se detiene, te
      llega la notificación y la tarea se crea.
- [ ] Prueba responder "Lo pienso" y "Más información" en el cierre.
- [ ] Verifica que las etiquetas y la etapa cambian correctamente en cada caso.
- [ ] Baja temporalmente el tiempo de espera de 24 h a 5 minutos, prueba el
      remarketing, y vuelve a subirlo a 24 h antes de lanzar de verdad.

## Fase 8 · Lanzamiento

Activa el bot en modo "En vivo" y reactiva/lanza la campaña de Meta Ads.

## Solución de problemas comunes

| Problema | Causa probable | Solución |
|---|---|---|
| El botón no aparece en WhatsApp | Más de 3 botones o más de 20 caracteres | Revisa el conteo de caracteres de cada botón (documentado junto a cada mensaje) |
| El bot no se detiene al recibir una foto | Tu integración no expone "Tipo de mensaje" | Usa el respaldo manual (Opción 3) mientras ajustas el paso de código |
| Los mensajes de remarketing no llegan | Plantilla HSM no aprobada aún | Revisa el estado en el panel de tu proveedor de WhatsApp |
| Un lead se queda "pegado" en una etapa | Falta el paso "Mover a etapa" al final de esa rama | Revisa que cada cierre tenga su bloque de cambio de etapa |
| El bot vuelve a preguntar algo ya respondido | Falta el bloque "Detener bot" tras la ruta rápida o el cierre | Agrega el bloque de pausa donde corresponda |
