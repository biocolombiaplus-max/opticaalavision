# Bot Kommo v3 — Campaña Monturas (foco en cotización, no en la montura)

Ajuste sobre v2: la experiencia real en el mostrador es que casi nadie pregunta
por la montura en sí — la mayoría ya tiene su fórmula y quiere el **precio**.
La montura de la pauta es el gancho para que escriban, pero la conversación se
reordena para ir directo a cotizar. "Solo la montura" pasa a ser la ruta
menos común y se acorta.

## 1. Combos y precios (memoriza el bot, los usa en el cierre)

| Combo | Incluye | Precio | Perfil edad |
|---|---|---|---|
| Monofocal | Examen + montura + lente monofocal, fotocromático, AR, protector pantalla | $350.000 | Menores de 37 |
| Progresivo digital gama alta | Examen + montura + lente progresivo, fotocromático, AR, protector pantalla | $550.000 | 38–59 |
| Bifocal | Examen + montura + lente bifocal, sin filtros | $300.000 | 60+ |
| Transitions última generación + AR Clarity | Examen + montura + lente premium | $600.000 | Upsell opcional |
| Solo montura (promo pauta) | Montura sola / traspaso de cristal | $80.000 | Cualquiera |

Regla de clasificación por edad (guía interna del Dr(a), no se dice tal cual):
<37 → Monofocal · 38–59 → Progresivo · 60+ → Bifocal (el Dr(a) confirma con el examen).

## 2. Mensaje 1 — Bienvenida (dispara siempre desde el anuncio)

> ¡Hola! 😊 Soy la Dra. Angie, optómetra de Óptica ALaVision. Gracias por escribir
> por la promo de monturas 👓 ¿Ya tiene su fórmula o quiere agendar el examen?

Botones: **Ya tengo fórmula** · **Quiero el examen** · **Solo la montura**

El orden importa: la opción que más se usa va primero (efecto de primera
opción — la gente tiende a elegir lo que ve arriba cuando la respuesta le
sirve).

---

## 3. Rama 1 · "Ya tengo fórmula" (ruta principal — la mayoría llega así)

**M2:** Perfecto 🙌 ¿Hace cuánto tiene esa fórmula?
Botones: **Menos de 1 año** · **Más de 1 año** · **No recuerdo**

**M3:** ¿Qué tipo de lente usa hoy?
Botones: **Monofocal** · **Progresivo** · **No sé cuál**

Si responde **"No sé cuál"** → **M3b** (texto libre): "Tranquilo(a), ¿qué edad
tiene?" → el Dr(a) clasifica con la tabla de la sección 1.

**M4 (cierre — el precio que estaba esperando):** Para su caso le recomiendo el
combo [Monofocal $350.000 / Progresivo $550.000] — incluye montura + lente +
filtros, todo en una sola cita. ¿Agendamos antes de que se acabe la promo?
Botones: **Sí, agendar** · **Más información** · **Lo pienso**

→ Etiquetas: `#Renovacion` `#InteresAlto`

---

## 4. Rama 2 · "Quiero el examen" (combo completo: examen + montura + lente)

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

## 5. Rama 3 · "Solo la montura" (secundaria y corta — traspaso/reemplazo)

**M2:** Cuénteme, ¿el lente que tiene está en buen estado para el traspaso o
también necesita uno nuevo?
Botones: **Solo traspaso** · **Necesito lente** · **No sé**

Si responde **"Necesito lente"** → se une a la Rama 1 en su M2 ("¿Hace cuánto
tiene esa fórmula?"): en realidad no es un caso de solo-montura, necesita
cotización completa.

**M3 (cierre):** Con gusto 👌 Tenemos monturas desde $80.000, hacemos el
traspaso el mismo día.
Botones: **Ver monturas** · **Ir al local** · **Hablar c/asesor**

→ Etiquetas: `#SoloMontura` `#InteresMedio` → Pipeline 1, etapa "Interesado – Montura"

---

## 6. Remarketing (misma arquitectura, botones acortados)

**24 horas (sin respuesta):**
> ¡Hola de nuevo! 😊 Soy la Dra. Angie de Óptica ALaVision. ¿Seguimos con su
> asesoría visual?

Botones: **Sí, sigamos** · **Más adelante** · **No me interesa**

**30 días (solo #InteresAlto que no cerraron):**
> ¿Cómo le fue con la decisión de sus lentes? 👓 Sigue vigente la promo de
> monturas.

Botones: **Quiero cotizar** · **Aún lo pienso** · **Ya compré**

Recordatorio: R24 y R30 van fuera de la ventana de 24 h de WhatsApp → deben
ser **plantillas (HSM) aprobadas por Meta**.

---

## 7. Neuromarketing aplicado (por qué funciona cada pieza)

- **Autoridad:** firma siempre "Dra. Angie, optómetra" — no "el equipo" ni "la empresa".
- **Anclaje de precio:** el cierre siempre menciona todo lo que incluye el combo antes del precio, para que se perciba como ahorro frente a comprarlo por separado.
- **Escasez/urgencia:** "antes de que se acabe la promo" — solo en el cierre, nunca en M1.
- **Compromiso progresivo:** cada botón es un "sí" pequeño que prepara el "sí" grande final (agendar cita).
- **Efecto de primera opción:** en M1, "Ya tengo fórmula" va primero porque es la respuesta real más frecuente.
- **Aversión a la pérdida:** el remarketing de 30 días no repite el beneficio, recuerda que la promo sigue activa "por ahora".
- **Personalización:** usar la variable de nombre de Kommo al inicio del M1 cuando esté disponible.
- **Reciprocidad:** en la Rama 1 se ofrece revisar gratis si la fórmula sigue vigente antes de pedir la cotización.

---

## 8. Checklist rápido de este ajuste

- [ ] Reemplazar los botones actuales del Bot ALAVISION 1 por los de este documento (todos ≤20 caracteres).
- [ ] Reordenar el Mensaje 1: "Ya tengo fórmula" primero, "Solo la montura" al final.
- [ ] Acortar la rama de "Solo la montura" a 2 mensajes (antes eran 3).
- [ ] Agregar el desvío: si en la Rama 3 dicen "Necesito lente", saltar a la Rama 1.
- [x] Precio de Transitions + AR Clarity confirmado: $600.000.
- [ ] Crear etiquetas nuevas: `#SoloMontura`, `#Renovacion`, `#Combo`, `#PrimeraVez`, `#InteresAlto`, `#InteresMedio`.
