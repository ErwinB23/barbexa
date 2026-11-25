# Resultados manuales confirmados — 14/11/2026

**Origen:** recorrido `recorrido-manual.md` realizado y declarado por el usuario,
en navegador Web y APK Android Development real. Codex no ejecutó estas interacciones.
No se repitieron registro, correos ni las pruebas anteriores de contraseña incorrecta.

| Comprobación nueva | Web | Android |
| --- | --- | --- |
| single: selección automática de B, Administrador solo de B | Correcta | Correcta |
| inactive: cero membresías activas, Mi cuenta sigue válida | Correcta | Correcta |
| shared: Administrador A / Barbero B, sin permisos administrativos cruzados | Correcta | Correcta |
| Selección/cambio y persistencia de sesión/contexto al reabrir | Correcta | Correcta |
| Recuperación de conectividad | Correcta | Correcta |
| Revocación shared→B: B desaparece, A permanece y Auth sigue válido | Correcta | Correcta |
| Cierre de sesión entre dos pestañas del mismo origen | Correcta | No aplica |

Observaciones del usuario: ninguna. El usuario confirmó que ejecutó **una sola vez**
el operador de revocación local, cuyo resultado fue `updatedOnlyOwnedMembership=true`,
`serverPrivateShopRows=0` y `manualRefreshStillRequired=true`. Después confirmó el
refresco efectivo de ambas interfaces. El JSON del operador se conserva por separado;
el indicador pendiente de ese JSON describe el momento anterior a la comprobación manual.

El conjunto fue autorizado con límites de tres usuarios/perfiles, dos barberías y cuatro
membresías. Sus identificadores y credenciales ficticias están exclusivamente en archivos
locales ignorados, no en esta evidencia. La limpieza selectiva queda autorizada después
de este registro, sujeta al cotejo de propietario, identificadores y dependencias.

## Alcance y límites

Estos resultados acreditan los recorridos de contexto de T027 y las nuevas interacciones
de persistencia/multipestaña descritas. No afirman tres recorridos completos SC-001/T019
ni la matriz completa vigente/renovable/inválida/red × arranque/foco de SC-003/T023.
T019 y T023 conservan pendientes esos criterios específicos; T014 mantiene sus pendientes
anteriores. No se afirma validación Cloud, recuperación de contraseña ni reservas.
