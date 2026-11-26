# Campaña de rendimiento k6 de BARBEXA

Guía vigente: [MANUAL-POWERSHELL.md](MANUAL-POWERSHELL.md).

```powershell
npm run test:carga -- smoke
npm run test:carga -- load
npm run test:carga -- stress
npm run test:carga -- spike
npm run test:carga -- completo
```

Campaña nueva independiente de las pruebas preliminares. Las evidencias anteriores
se archivaron con SHA256 conservando originales. No se ejecutó carga durante esta
reorganización. Solo pruebas unitarias e inspecciones estáticas con fixtures vacíos.

- Smoke:1VU/5iteraciones, máximo30s.
- Load:10/25/50VU1min;100VU10min, transiciones10s.
- Stress:100..1000VU,60s/nivel y transiciones10s, métricas/thresholds por tramo.
- Spike:10VU30s, subida5s, pico30s, bajada5s y recuperación10VU60s.
- `load-academico`: suplemento25/50VU10min para EQ06. Load corto no lo sustituye.

No hay aprobaciones heredadas. Spike depende del Stress acreditado de la misma
campaña. `completo` se detiene ante un fallo. La consola usa el formato nativo k6;
los resultados JSON y CSV se guardan en `.artifacts/k6/campaigns/<UUID>/`.

El backend real existente se reutiliza. El aprovisionador conserva/renueva sesiones
Auth y fixtures propios; verifica marcador, migraciones y aislamiento. Estimaciones
RAM advierten, mientras las guardas críticas y sostenidas interrumpen el supervisor.

La campaña mide lectura de catálogo/disponibilidad. Los modos anteriores de reservas,
conflicto, replay e aislamiento siguen disponibles de forma independiente. No se
acredita automáticamente capacidad de escritura,1000VU ni todos los atributos.

`node k6/campaign.mjs report` reconstruye JSON/CSV sin generar carga.
No se modifican producto, migraciones originales, Cloud ni GitHub Actions.
