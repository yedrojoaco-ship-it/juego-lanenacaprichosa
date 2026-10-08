# PUBLICAR — Jazmín al Rescate

## 1. Ejecutable local (Electron, Windows)

Requiere Node.js (ya instalado). Descarga ~150 MB la primera vez:

```bat
npm install
npm start        :: probar la ventana local
npm run dist     :: genera el instalador en dist/
```

## 2. CrazyGames — checklist pre-subida

- [ ] Juego en un .zip con `index.html` en la raíz + `js/` + `assets/`.
- [ ] Probar el .zip en su sandbox de QA (cuenta developer).
- [ ] Consola sin errores (F12): solo warnings esperables de assets opcionales.
- [ ] Carga < 30 s (el juego pesa ~9 MB con música; OK).
- [ ] `SDK.gameplayStart/Stop` + `happytime` ya integrados (`js/sdk.js`).
- [ ] Pausa al perder foco: el navegador la maneja (Phaser pausa el loop
      cuando la pestaña se oculta; verificado por diseño, re-verificar en QA).
- [ ] Controles solo teclado + mouse: documentados en README y pills.
- [ ] Sin login, sin backend, sin cookies propias (solo `localStorage`
      para el progreso + lo que pida el SDK de CrazyGames).

## 3. Itch.io (alternativa simple)

Subir el mismo .zip como proyecto HTML5, viewport 960x600,
marcar "dispositivos: desktop", controles por teclado.
