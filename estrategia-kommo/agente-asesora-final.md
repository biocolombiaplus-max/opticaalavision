# Bot v4 — Vale, asesora + 2 sedes + ruta rápida de fórmula

Reemplaza el árbol de v3. Cambios de esta ronda:
- **Persona:** el bot ya no habla como "la doctora" — habla como **Vale**, asesora
  joven y cercana. La Dra. Angie sigue existiendo, pero solo para el examen
  presencial (evita que el bot finja ser la médica).
- **2 sedes:** Los Andes (solo montura + montaje con fórmula ya conocida, sin
  consultorio) y Principal (consultorio completo). El cierre siempre dice a
  cuál ir.
- **Ruta rápida:** si el paciente manda la foto de la fórmula de una (sin
  saludar ni nada), se salta todo el árbol — es el lead más caliente que hay.
- **Código para Kommo** para detectar esa foto automáticamente (sección 5).

## 1. Precios (confirmado: todos los combos incluyen montura de regalo este mes)

| Combo | Incluye | Precio | Perfil |
|---|---|---|---|
| Monofocal | Lente fotocromático + protección de pantallas + antireflejo + montura de regalo | $350.000 | Menor de 37 |
| Monofocal Premium (Transitions última generación) | Igual + lente Transitions certificado + montura de regalo | $600.000 | Menor de 37, gama alta |
| Progresivo digital gama alta | Lente con protección de pantallas + montura de regalo | $550.000 | 37–59 |
| Bifocal | Lente en policarbonato, sin filtros adicionales + montura de regalo | $300.000 | 60+ |
| Solo montura | Montura sola, sede Los Andes | $80.000 | Cualquiera, sin lente nuevo |

Todos los combos con examen incluido se agendan en **Sede Principal**. "Solo
montura" y "traspaso con fórmula ya en mano" se resuelven en **Sede Los Andes**.

Rango 37–59 es amplio: si contesta "50+", se pregunta la edad exacta (texto
libre) para distinguir Progresivo (50–59) de Bifocal (60+) antes de dar precio.

## 2. Mensaje 1 — Bienvenida

> ¡Hola! 😊 Soy Vale, asesora de Óptica ALaVision. Vi tu interés en la promo
> de monturas 👓 ¿Qué necesitas?

Botones: **Solo montura** (12/20) · **Montura + lentes** (17/20) · **Examen + todo** (14/20)

---

## 3. Rama A · "Solo montura" (Sede Los Andes, sin lente nuevo)

**M2:** ¿Qué necesitas hacer?
Botones: **Cambiarla** (9) · **Se partió** (9) · **Traspasar cristal** (17)

Si **"Traspasar cristal"** → **M3:** ¿Tu cristal está en buen estado?
Botones: **Sí** (2) · **Está viejo** (10) · **No sé** (5)
- "Está viejo" o "No sé" → salta a la Rama B (necesita cotizar lente nuevo).

**Cierre** (Cambiarla / Se partió / cristal en buen estado):
> ¡Listo! 👓 Monturas desde $80.000 en nuestra sede Los Andes, te hacemos el
> traspaso ahí mismo. ¿Cómo seguimos?

Botones: **Ver monturas** (12) · **Ir a Los Andes** (14) · **Hablar asesor** (13)

→ Etiquetas: `#SoloMontura` `#SedeLosAndes` `#InteresMedio`

---

## 4. Rama B · "Montura + lentes" (cotizar con fórmula)

**M2:** ¿Tienes fórmula?
Botones: **Sí** (2) · **Está vieja** (10) · **No tengo** (8)

- **"Sí"** → **M3** (sin botones, dispara la ruta rápida): "¡Perfecto! Envíame
  la foto de tu fórmula y te cotizo al toque 📄"
- **"Está vieja"** → **M3:** ¿Hace cuánto fue tu último examen?
  Botones: **&lt;1 año** (7) · **1–2 años** (9) · **+2 años** (7)
  → **M4:** ¿Sabes qué tipo de lente usas?
  Botones: **Monofocal** (9) · **Progresivo** (10) · **No sé** (5)
  → si "No sé", mandar la tablita: "Monofocal = una sola distancia. Progresivo
  = de lejos y cerca, sin línea. Bifocal = con la rayita abajo. ¿Cuál se
  parece al tuyo?" (mismos botones)
- **"No tengo"** → "Sin fórmula vigente no podemos cotizar el lente todavía —
  te conviene el examen primero."
  Botones: **Agendar examen** (16) · **Solo montura** (12) · **Hablar asesor** (13)
  → deriva a Rama C o A.

**Cierre** (combo ya identificado):
> Para tu caso el combo ideal es [combo] — $[precio], con la montura de regalo
> este mes 🎁. ¿Agendamos en la sede principal o prefieres enviarnos la
> fórmula primero?

Botones: **Agendar cita** (13) · **Enviar fórmula** (14) · **Hablar asesor** (13)

→ Etiquetas: `#Renovacion` `#InteresAlto` `#SedePrincipal`

---

## 5. Rama C · "Examen + todo" (primera vez o combo completo)

**M2:** ¿Es tu primera vez usando lentes?
Botones: **Primera vez** (11) · **Ya uso lentes** (13) · **No estoy seguro** (16)
- "Ya uso lentes" → converge con la Rama B en su M2 ("¿Tienes fórmula?").

**M3:** ¿Qué edad tienes?
Botones: **&lt;37** (3) · **37–49** (6) · **50+** (3)
- Si "50+" → **M3b** (texto libre): "¿Qué edad exacta tienes? así te
  recomiendo mejor."

**M4:** ¿A qué te dedicas?
Botones: **Computador** (10) · **Trabajo activo** (13) · **Otro** (5)

**M5:** ¿Qué se te dificulta más?
Botones: **De lejos** (8) · **De cerca** (8) · **Lejos y cerca** (13)

**Cierre:**
> Según lo que me cuentas, te recomiendo el combo [X] — $[precio], con
> examen, lente y montura de regalo este mes 🎁. ¿Agendamos tu cita en la
> sede principal?

Botones: **Sí, agendar** (11) · **Más info** (9) · **Hablar asesor** (13)

→ Etiquetas: `#Combo` + `#PrimeraVez` o `#Renovacion` + `#InteresAlto` `#SedePrincipal`

---

## 6. Ruta rápida — fórmula por foto (el lead más caliente)

Cuando el mensaje de entrada trae una imagen (con o sin texto, incluso sin
saludo, que es lo más común según tu experiencia): se salta TODO el árbol de
arriba.

**Flujo:**
1. Pausar el bot para esa conversación.
2. Etiqueta `#FormulaRecibida` (o `#ImagenRecibida` si no se puede confirmar qué es).
3. Notificar al asesor/Dra. Angie.
4. Responder automáticamente: "¡Perfecto! 😊 Ya recibimos tu imagen. La
   revisamos y te escribimos con la cotización o la opción de montura que
   buscas 👓"
5. Crear tarea "Revisar imagen y cotizar".
6. Campo **Documento recibido** = `Pendiente revisar` (el humano luego lo
   cambia a Fórmula / Foto de montura / Otro).

No le preguntes nada más al bot en automático después de esto — mandar una
foto ya es decir "cotízame", cualquier pregunta extra rompe la conversación.

## 7. Código para Kommo — detectar la foto automáticamente

**Opción 1 (nativa, probar primero).** Después del disparador "Mensaje
entrante" en el Salesbot, agrega un paso de **Condición** y revisa el
desplegable de condiciones disponibles: en algunas integraciones de WhatsApp
con Kommo aparece una opción como *"Tipo de mensaje"*, *"Contiene adjunto"* o
*"Media"*. El nombre exacto varía según el proveedor de WhatsApp conectado
(API oficial, 360dialog, Wazzup, etc.) — revisa bien ese desplegable.

Si existe: `SI "Tipo de mensaje" = Imagen → sigue el flujo de la sección 6`.
`SI NO → continúa el bot normal`.

**Opción 2 (si tu integración no trae ese filtro) — nodo "Paso personalizado
(código)"**, justo después del disparador de mensaje entrante:

```js
function run(input, params) {
  // Mapea aquí la variable del mensaje/adjunto que Kommo te ofrezca
  // en el panel de "Parámetros" de este paso (busca algo como
  // {{mensaje.adjunto}}, {{message.attachment}} o similar).
  var attachment = params.attachment_url || params.message_attachment || "";
  var text = (params.message_text || "").trim();

  var isImage = attachment.length > 0;

  return {
    data_out: {
      es_imagen: isImage ? "si" : "no"
    }
  };
}
```

Luego agrega un paso de **Condición** que revise `es_imagen = "si"` y, si es
así, continúa con: etiqueta, notificación, tarea, mensaje automático y pausa
del bot (sección 6).

**Nota honesta:** el nombre exacto de las variables de Kommo (`params.xxx`)
puede cambiar según tu integración de WhatsApp. Si al pegar este código
Kommo marca error, abre el panel de "Parámetros" de ese paso, revisa qué
variables aparecen disponibles ahí y ajusta solo esos nombres — la lógica de
adentro no cambia.

**Opción 3 (siempre funciona, cero riesgo — respaldo mientras se prueba la
automatización).** Kommo muestra un ícono de adjunto en la lista de chats
cuando llega una imagen. Respaldo manual: cada vez que Nicol vea ese ícono,
entra, aplica la etiqueta `#FormulaRecibida` y pausa el bot con el botón
"Detener bot" de esa conversación. Toma 5 segundos por lead y garantiza que
ninguno se pierda mientras la Opción 1 o 2 quedan bien ajustadas.

## 8. Checklist de este ajuste

- [ ] Cambiar la firma del bot de "Dra. Angie, optómetra" a "Vale, asesora" en el Mensaje 1 y en el remarketing de 24 h.
- [ ] Dejar "con la Dra. Angie" solo donde se habla del examen o la cita presencial.
- [ ] Reconstruir el árbol con las 3 ramas nuevas: Solo montura / Montura + lentes / Examen + todo.
- [ ] Confirmar que "montura de regalo este mes" aparece en el cierre de los 3 combos con examen.
- [ ] Crear el campo **Documento recibido** (Pendiente revisar / Fórmula / Foto de montura / Otro).
- [ ] Crear la etiqueta `#FormulaRecibida` y probar la Opción 1 (condición nativa) antes que el código.
- [ ] Si la Opción 1 no existe en tu integración, montar la Opción 2 (paso personalizado) siguiendo la sección 7.
- [ ] Explicarle a Nicol la Opción 3 (respaldo manual) para que no se pierda ningún lead mientras se ajusta la automatización.
