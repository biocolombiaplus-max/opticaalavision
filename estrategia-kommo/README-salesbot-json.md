# Cómo pegar `salesbot_ramas.json` en Kommo

Este archivo se generó a partir del JSON **real** que exportaste del BOT
ALAVISION 1 (botón `</> Ver fuente` en el editor del Salesbot), así que usa
exactamente la misma estructura que Kommo ya reconoce en tu cuenta — no es
una estructura inventada.

## Corrección (v2): `is_in_starting_block`

El paso 1 ahora tiene `"is_in_starting_block": true`. Sin esto, el bot se
ejecuta cuando la automatización del pipeline lo llama (p. ej. "Incoming
Leads → Cuando se crea en esta etapa → Ejecutar Salesbot") pero no sabe por
dónde empezar, así que no manda nada. Si ya habías pegado la v1 y no te
respondía, reemplázala por este archivo.

## Qué SÍ está resuelto en este JSON (100% listo, solo pegar)

- El Mensaje 1 que ya tenías (se conserva tu texto tal cual lo escribiste).
- Las **3 ramas completas**: Solo montura (pasos 10-12), Montura + lentes
  (pasos 20-25), Examen + todo (pasos 30-36), con todas las sub-preguntas,
  la tablita de tipos de lente, los cierres con cada combo y precio, y el
  manejo de objeción compartido ("Más información", paso 90).
- Al elegir cualquiera de los 3 botones del Mensaje 1, el lead avanza
  automáticamente de etapa (reutiliza el mismo `value`/`pipeline_id` que ya
  tenías configurado en tu antiguo paso 2 — por eso ese paso ya no aparece,
  quedó integrado ahí mismo).
- 21 pasos en total, validados con un script: sin JSON roto y sin ningún
  botón que apunte a un paso que no existe.

## Cómo pegarlo

1. Abre el Salesbot "BOT ALAVISION 1" → botón `</> Ver fuente`.
2. Borra todo el contenido actual del editor.
3. Pega el contenido completo de `salesbot_ramas.json`.
4. Clic en **Guardar**.
5. Entra al editor visual (oculta la fuente) y revisa que los bloques
   aparezcan conectados — Kommo dibuja el lienzo solo, a partir del JSON.

## Qué falta agregar a mano (a propósito, para no arriesgar el resto)

No incluí estas 4 cosas porque su formato de JSON **no lo pude verificar**
contra un ejemplo real de tu cuenta — meter un nombre de acción equivocado
podía romper el pegado completo (es un solo bloque de JSON, todo o nada).
Es rápido agregarlas después con el editor visual normal:

1. **Detectar foto de fórmula** (ruta rápida) — sección "Código para Kommo"
   del artefacto/`agente-asesora-final.md`.
2. **Etiquetas** en cada cierre (`#SoloMontura`, `#Renovacion`, etc.) — con
   el bloque "Añadir una etiqueta" del menú lateral.
3. **Cambiar etapa** distinto por cada cierre (ahora todos comparten la
   misma etapa de entrada) — arrastra "Cambiar etapa del lead" en cada
   cierre y elige la etapa correcta desde el desplegable de Kommo (no hace
   falta adivinar el número, el editor visual te la muestra por nombre).
4. **Remarketing (24 h / 30 días)** — bloque "Pausa" + automatización de
   pipeline, como está en `guia-instalacion-kommo.md`.

## Mapa de pasos (por si quieres editar el JSON tú misma)

| Rango | Rama |
|---|---|
| 1 | Mensaje 1 (bienvenida) |
| 3 | Disparador de palabra clave existente (no tocado) |
| 10-12 | Solo montura |
| 20-25 | Montura + lentes |
| 23b | Tablita de tipos de lente |
| 30-36, 31b | Examen + todo |
| 90 | Objeción compartida ("Más información") |
