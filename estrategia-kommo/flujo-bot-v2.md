# Bot Kommo v2 — Campaña Monturas $80.000 (botones cortos + neuromarketing)

Reemplaza al flujo v1 del PDF. Corrige los botones para el límite real de
WhatsApp/Kommo (**máx. 20 caracteres por botón, máx. 3 botones**) y ajusta
las 3 rutas reales del negocio: solo montura, ya tiene fórmula, combo completo.

## 1. Combos y precios (memoriza el bot, los usa en el cierre)

| Combo | Incluye | Precio | Perfil edad |
|---|---|---|---|
| Monofocal | Examen + montura + lente monofocal, fotocromático, AR, protector pantalla | $350.000 | Menores de 37 |
| Progresivo digital gama alta | Examen + montura + lente progresivo, fotocromático, AR, protector pantalla | $550.000 | 38–59 |
| Bifocal | Examen + montura + lente bifocal, sin filtros | $300.000 | 60+ |
| Transitions última generación + AR Clarity | Examen + montura + lente premium | $600.000 | Upsell opcional |
| Solo montura (promo pauta) | Montura sola / traspaso de cristal | $80.000 | Cualquiera |

Regla de clasificación por edad (el bot no la dice tal cual, es guía interna del Dr(a) al cerrar): <37 → Monofocal · 38–59 → Progresivo · 60+ → Bifocal (el Dr(a) confirma con el examen).

## 2. Mensaje 1 — Bienvenida (dispara siempre desde el anuncio)

> ¡Hola! 😊 Soy la Dra. Angie, optómetra de Óptica ALaVision. Vi que le interesó la
> promo de monturas a $80.000 👓 ¿Qué necesita hoy?

Botones: **Solo la montura** · **Ya tengo fórmula** · **Quiero el combo**

Etiqueta al entrar: ninguna aún → se asigna según la rama.

---

## 3. Rama 1 · "Solo la montura" (traspaso / reemplazo, sin examen)

**M2:** ¿Se le partió la montura o quiere cambiarla?
Botones: **Se partió** · **Ya está vieja** · **Otro motivo**

**M3:** ¿El cristal que tiene está en buen estado para el traspaso?
Botones: **Sí, buen estado** · **Está dañado** · **No sé**

**M4 (cierre):** Con gusto 👌 Tenemos monturas desde $80.000 y hacemos el traspaso
el mismo día. Nos quedan pocas unidades de la promo esta semana.
Botones: **Ver monturas** · **Ir al local** · **Hablar c/asesor**

→ Etiquetas: `#SoloMontura` `#InteresAlto` → Pipeline 1, etapa "Interesado – Montura"

---

## 4. Rama 2 · "Ya tengo fórmula" (cotizar montura+lente, sin examen)

**M2:** Perfecto 🙌 ¿Hace cuánto tiene esa fórmula?
Botones: **Menos de 1 año** · **Más de 1 año** · **No recuerdo**

**M3:** ¿Qué tipo de lente usa hoy?
Botones: **Monofocal** · **Progresivo** · **No sé cuál**

Si responde **"No sé cuál"** → **M3b** (texto libre): "Tranquilo(a), ¿qué edad
tiene?" → el Dr(a) clasifica con la tabla de la sección 1.

**M4 (cierre, texto dinámico según combo):** Para su caso le recomiendo el combo
[Monofocal $350.000 / Progresivo $550.000] — incluye montura + lente + filtros,
todo en una sola cita. ¿Agendamos antes de que se acabe la promo?
Botones: **Sí, agendar** · **Más información** · **Lo pienso**

→ Etiquetas: `#Renovacion` `#InteresAlto`

---

## 5. Rama 3 · "Quiero el combo" (examen + montura + lente)

**M2:** ¡Con gusto! ¿Ya ha usado lentes antes?
Botones: **Sí, ya uso** · **No, primera vez** · **No estoy seguro**

**M3 (texto libre, ambas respuestas convergen aquí):** Cuénteme su edad y a qué
se dedica, así le armo el combo ideal para su vista.

**M4 (cierre, combo dinámico según edad — tabla sección 1):** Según lo que me
cuenta, el combo ideal es [Monofocal $350.000 / Progresivo $550.000 / Bifocal
$300.000] — examen, montura y lente en un solo pago. ¿Agendamos su cita?
Botones: **Sí, agendar cita** · **Más información** · **Lo pienso**

→ Etiquetas: `#Combo` + `#PrimeraVez` o `#Renovacion` + `#InteresAlto`

---

## 6. Remarketing (igual arquitectura del PDF, botones acortados)

**24 horas (sin respuesta):**
> ¡Hola de nuevo! 😊 Soy la Dra. Angie de Óptica ALaVision. ¿Seguimos con su
> asesoría visual?

Botones: **Sí, sigamos** · **Más adelante** · **No me interesa**

**30 días (solo #InteresAlto que no cerraron):**
> ¿Cómo le fue con la decisión de sus lentes? 👓 Sigue vigente la promo de
> monturas a $80.000.

Botones: **Quiero cotizar** · **Aún lo pienso** · **Ya compré**

Recordatorio: R24 y R30 van fuera de la ventana de 24 h de WhatsApp → deben
ser **plantillas (HSM) aprobadas por Meta**.

---

## 7. Neuromarketing aplicado (por qué funciona cada pieza)

- **Autoridad:** firma siempre "Dra. Angie, optómetra" — no "el equipo" ni "la empresa".
- **Anclaje de precio:** el cierre siempre menciona todo lo que incluye el combo antes del precio, para que se perciba como ahorro frente a comprarlo por separado.
- **Escasez/urgencia:** "pocas unidades", "antes de que se acabe la promo" — solo en el cierre, nunca en M1 (no generar desconfianza desde el primer mensaje).
- **Compromiso progresivo:** cada botón es un "sí" pequeño que prepara el "sí" grande final (agendar cita); nunca se pide la cita en el primer mensaje.
- **Aversión a la pérdida:** el remarketing de 30 días no repite el beneficio, recuerda que la promo sigue activa "por ahora".
- **Personalización:** usar la variable de nombre de Kommo (`{{lead.name}}` o similar) al inicio del M1 cuando esté disponible.
- **Reciprocidad:** en la Rama 2 se ofrece revisar gratis si la fórmula sigue vigente antes de pedir la cotización.

---

## 8. Checklist rápido de este ajuste

- [ ] Reemplazar los botones actuales del Bot ALAVISION 1 por los de este documento (todos ≤20 caracteres).
- [ ] Actualizar el Mensaje 1 con el precio de la promo ($80.000) y el nuevo menú de 3 rutas.
- [ ] Cargar la tabla de combos/precios como referencia interna del Dr(a) (no se envía tal cual al paciente).
- [x] Precio de Transitions + AR Clarity confirmado: $600.000.
- [ ] Crear etiquetas nuevas: `#SoloMontura`, `#Renovacion`, `#Combo`, `#PrimeraVez`, `#InteresAlto`.
