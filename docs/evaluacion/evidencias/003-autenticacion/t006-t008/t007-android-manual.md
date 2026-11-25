# T007 — Confirmación manual del usuario y retirada de sonda

13/11/2026, America/Lima. Usuario abrió App Barbería en su Android con Expo Go y reportó:

```json
{"Hermes":true,"available":true,"probeLoaded":true,"shortWrite":true,"shortRead":true,"shortDelete":true,"longWrite":true,"longRead":true,"longStatus":"ok","cleanupShort":true,"cleanupLong":true,"phase":"completed","errorType":"none"}
```

Origen: prueba manual declarada por el usuario, no prueba automática Android de Codex.
Corresponde al adaptador real y namespace técnico de la sonda: valor corto, valor de
4096 caracteres y verificación de ausencia tras limpieza en finally. No demuestra límites
universales de SecureStore; este teléfono aceptó ese payload y no exige fragmentación.
No nuevos datos de modelo/versión del teléfono inferidos de esta confirmación.

Codex retiró secure-store-dev-probe.ts y todo hook/import T007 de AppProvider, que vuelve
al contenido versionado anterior a las sondas. Conservó session-storage-core.ts e imports
explícitos y regresión Metro. Las doce pruebas originales y dos adicionales para claves
PKCE largas pasan; formato corrupto/incompleto y errores siguen rechazados, sin fallback plano.
No manifiesto/fragmentación añadidos porque no son necesarios según evidencia disponible.

T007 completada. Históricos probeLoaded:false, diagnóstico del ciclo y RED/GREEN de
Metro conservados en documentos anteriores. No nuevas pruebas manuales atribuidas a Codex.
