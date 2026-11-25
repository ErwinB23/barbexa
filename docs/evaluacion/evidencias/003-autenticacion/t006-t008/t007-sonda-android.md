# Sonda temporal T007 — espera resultado manual Android

**Actualización**: [resultado manual confirmado y sonda retirada](t007-android-manual.md).
El texto siguiente conserva el procedimiento histórico previo a esa confirmación.

13/11/2026. Se reutiliza createSessionStorageNative sin backend doble ni cambios en
implementación productiva. Módulo temporal src/composition/secure-store-dev-probe.ts,
activado en AppProvider solo __DEV__/Android; guardia started evita repetir por remount
durante esa carga. Reload completo permite otro intento. No imports ni sonda T005.

SecureStore.isAvailableAsync, valor técnico corto y valor de 4096 caracteres, escritura/
lectura/borrado. Finally intenta retirar ambas claves propias, aun ante error anterior;
confirma ausencia por lectura, sin borrar otras claves. Si cleanupShort/cleanupLong es
false, no afirmar limpieza. La salida solo contiene booleanos/estados breves bajo
[T007 SecureStore], sin valores, tokens, IDs de cuentas ni detalles internos del error.
Una terminación forzosa del proceso no garantiza ejecutar finally; otro Reload reintenta
las mismas claves técnicas de namespace exclusivo, no pertenecientes a sesiones de usuario.

TSC cliente sin emisión y ESLint de los dos archivos afectados: código 0. No pruebas
completas, instalaciones, builds o Cloud. T007 sigue pendiente; T008 no se ejecutó.

Usuario: abrir App Barbería en Expo Go conectada al Metro de este repositorio, hacer
Reload y consultar consola de React Native DevTools conectada al teléfono. Buscar
[T007 SecureStore] y reportar todos los campos; longStatus puede ser ok, read-mismatch,
controlled-rejection, unexpected-error, unavailable-or-error o not-run. Rechazo de valor
extenso no se oculta ni se transforma en éxito. Retirar instrumentación tras evidencia
y decidir si hace falta fragmentación solo si existe fallo real de payload.
