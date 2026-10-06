# AGENTS.md — juego-lanenacaprichosa

Juego HTML5 top-down 2.5D en Phaser 3 (sin build, scripts clásicos).
GDD: `GDD_Jazmin_Al_Rescate.txt` · Historial de cambios por códigos: `HISTORIAL.txt`.

## Cómo se sirve el juego (para /qa y /browse)

- Estático, sin `npm run dev`: basta abrir `index.html`.
- Doble-clic funciona (Phaser por CDN, necesita internet), pero lo recomendado
  es servidor local desde la raíz: `python -m http.server 8000` →
  `http://localhost:8000` (así cargan `assets/` y futuros PNG/MP3).
- Consola del navegador (F12) = fuente de errores del juego.

## Herramientas instaladas (todo con scope de proyecto, nada global)

- Agentes (10, en `.opencode/agent/`, con `mode: subagent`; regenerables con
  `.opencode/vendor/install-agents-project.sh` vía Git Bash):
  `game-designer`, `level-designer`, `narrative-designer`,
  `game-audio-engineer`, `economy-designer`, `frontend-developer`,
  `code-reviewer`, `git-workflow-master`, `test-automation-engineer`,
  `performance-benchmarker`. (Fuente: `.opencode/vendor/agency-agents`,
  convertidos con su `scripts/convert.sh --tool opencode`.)
- Skills gstack (8, en `.opencode/skills/<nombre>/`):
  `office-hours`, `plan-eng-review`, `review`, `qa`, `browse`, `benchmark`,
  `ship`, `investigate`. (Fuente: `.opencode/vendor/gstack`, copiadas a mano
  sin ejecutar su `./setup`; `~/.claude/skills/gstack` reescrito a
  `.opencode/vendor/gstack`. `browse/` trae solo SKILL.md + sections/ porque
  su automatización requiere Bun.)
- Comandos (8, en `.opencode/command/<nombre>.md`): mismos nombres, invocables
  como `/review`, `/qa`, etc. Cargan la skill correspondiente.
- Total agentes+skills propios: 18 (límite OpenCode ~119: OK).

## Requisitos detectados en esta máquina

- Git: sí · Node: sí · Python: sí (http.server para /qa y /browse).
- Bun: NO instalado → los helpers `bin/` de gstack que lo usan degradan
  (los flujos markdown principales funcionan igual). Pedir confirmación antes
  de instalar Bun/Chromium/Docker (son descargas pesadas).
- Chromium/Chrome: hay Playwright + Chrome → /browse manual viable.

## Agentes y skills automáticos (usar sin que el usuario los invoque)

Mapeo tarea → herramienta:

- Diseñar/planificar el juego → skills `office-hours` y `plan-eng-review`.
- Diseño de juego, niveles, historia, audio, economía → subagentes
  `game-designer`, `level-designer`, `narrative-designer`,
  `game-audio-engineer`, `economy-designer`.
- Implementar código → `frontend-developer`.
- Revisar código → `code-reviewer` + skill `review`.
- Bug o comportamiento raro → skill `investigate` ANTES de proponer fixes.
- QA, pruebas en navegador y regresiones → skills `qa` y `browse` +
  subagentes `test-automation-engineer` y `performance-benchmarker`.
- Rendimiento y FPS → `performance-benchmarker` + skill `benchmark`.
- Publicar en GitHub → `git-workflow-master` + skill `ship`.

Reglas generales:

- No esperes a que el usuario invoque una skill: si la descripción aplica
  a la tarea, cargala vos automáticamente con la herramienta skill.
- En tareas de varios pasos, delegá a los subagentes con la herramienta
  task cuando corresponda; no hagas todo en el hilo principal.
- Si una skill o subagente aplica pero no estás seguro, usalo igual y
  avisá qué cargaste.
- No pidas confirmación para usar skills o subagentes.

Plugins globales (ya instalados, no tocar):

- superpowers: procesos (brainstorming, systematic-debugging, TDD,
  verificación) cuando apliquen.
- ponytail: solución mínima siempre; nada de abstracciones ni dependencias
  no pedidas.
- Sin duplicar trabajo: si superpowers cubre la tarea (ej. debugging),
  no ejecutes además el flujo equivalente de gstack; elegí el que se adapte
  e informá cuál usaste. gstack y agency-agents suman, no reemplazan.

## Reglas del repo

- El asistente commitea y pushea a `main` en cada avance verificado, con
  mensajes por códigos (ver `HISTORIAL.txt`). Solo commitea lo verificado.
- No borrar ni mover archivos del juego (`game.js`, `js/`, `assets/`, etc.).
- Tras reiniciar OpenCode en este proyecto carga `opencode.json` + estas tools.
