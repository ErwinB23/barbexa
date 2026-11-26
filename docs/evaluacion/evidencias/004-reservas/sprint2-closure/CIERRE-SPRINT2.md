# Cierre prioritario del Sprint 2 — 26/11/2026

Presentación: 27/11/2026. Este documento distingue pruebas aprobadas, preparación
pendiente de ejecución y límites originales. No declara cerrados los diez EQ.
Fuente original: [escenarios académicos EQ-01–10](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/main/docs/01-analisis-de-sistema/08-escenarios-atributos-calidad.md),
Constitución 2.0.0, planes SDD y [rúbrica](../../../RUBRICA.md).
No se cambió ninguna definición ni medida de aceptación.

## Actualización vigente: serie mixta finalizada

La serie `71e00e3c` terminó en 25, 50 y 100 VU, con 600 s estables por nivel.
Auditoría offline: 88.472 HTTP, 17.630 aceptadas y 17.630 persistidas, cero errores,
recuperación e integridad satisfactorias; 36 thresholds de aprobados recalculados.
**EQ-04 y EQ-06 cumplidos en laboratorio según sus criterios originales.**
P95 completo de consultas a 100 VU: catálogo 4 ms, disponibilidad 8 ms y reservas
7 ms. El p95 HTTP global de 3.660,71 ms se conserva como limitación de la mezcla;
no es p95 exclusivo de confirmación, que no quedó exportado.
[Informe y gráficas](../k6-mixta-final/INFORME.md),
[tablas y conciliación](../k6-mixta-final/RESULTADOS.md).
Los dos intentos mixtos fallidos, la preparación histórica y sus correcciones
permanecen conservados. No repetir `test:carga:mixta` por rutina.

## 1. Casos faltantes ejecutados

Comando del operador acotado:

```powershell
node --experimental-transform-types k6/quality-closure.mjs --execute=local-synthetic-lab
```

**No repetirlo por rutina:** conserva manifiesto privado y omite bloques aprobados.
Las pruebas usan únicamente `barbexa-k6-lab`, API `127.0.0.1:54721`, seis servicios
existentes, marcador propio y comparación SHA de las 26 migraciones. Sin reinicios,
Cloud ni proveedor externo. Se añadieron seis usuarios Auth, dos barberías y cuatro
reservas propias para estos casos; no se alteraron las filas de negocio previas
comparadas por digest. Auth sí crea/renueva las sesiones sintéticas necesarias.

Resultado: **15 comprobaciones aprobadas**, salud Auth 200, cero solapamientos,
duplicaciones de request/pago, reservas parciales o cruces de tenant.
Evidencia ejecutada: [results.json](results.json).

| EQ | Brecha comprobada ahora | Resultado y evidencia reutilizada |
| --- | --- | --- |
| EQ-01 Seguridad: operación protegida | Lectura/pago sin sesión Auth; otro cliente; barbero no asignado; pago desde otro tenant; recepción en efectivo por administrador | Sin sesión: 401; acceso ajeno: 404/NOT_AVAILABLE, sin datos de la cita. Los digest de filas no cambiaron por denegaciones. Administrador efectivo: 200/paid. La nueva carrera aporta también administrador Yape: 200. Se reutilizan cliente sin permiso, admin ajeno en lectura y positivos de barbero efectivo/Yape de [005](../../../../../specs/005-atencion-pagos-manuales/real-tests.json), sin repetir sus 91 comprobaciones |
| EQ-03 Integridad: reservas y pagos simultáneos | Una carrera adicional del mismo pago Yape con **dos actores distintos**, barbero asignado y administrador propietario | Dos conexiones SQL esperando simultáneamente; resultados en ese orden 409/200; pago paid y exactamente un evento receive. Reutiliza diez pares de reservas, rollback e idempotencia de [atomic.md](../atomic.md), las cinco carreras receive/refund anteriores y [008–010](../../../../../specs/010-reprogramacion-reservas/quickstart.md). No se acreditan múltiples nuevas repeticiones: esta ampliación contiene un par observado |
| EQ-07 Confiabilidad: fallo del correo | Fallo definitivo controlado después del commit, lectura persistida, reintento y replay | Servicio de aplicación y adaptador PostgreSQL reales; transporte local protegido y proveedor de correo controlado. Estado failed persistido; reintento sent; dos llamadas al proveedor, misma clave de idempotencia, mismo UUID y una fila. No se envió correo real. La composición desplegada de invitaciones in-app no se cambió ni se declara entrega efectiva con Resend |
| EQ-10 Historial: cambio de precio | Cambio **real** de política vigente y lectura autorizada de reserva previa | Configuración 120→60 min por Edge; reserva conserva 120. Cabecera completa e items SQL idénticos antes/después; consulta propia con JWT y columnas públicas: 200. Nombre/precio, cancelación y reprogramación se acreditan con snapshots de atomicidad y 155 comprobaciones de 008–010, sin repetirlas |

Ajustes del operador, sin modificar el producto: columna de membresía `status`,
expectativa 404 de ocultación y selección explícita de columnas públicas, en lugar
de SELECT *. El primer observador de carrera contaba solo esperas advisory: la
autoridad vigente serializa también en la fila de configuración. Ese intento se
conservó y no se acreditó como carrera observada. Se añadió una opción al helper
de prueba para contar esperas Lock de las mismas peticiones care_booking; con una
nueva reserva se observaron ambas conexiones y se acreditó el par. No se relajó
la condición de concurrencia ni se modificó SQL productivo.

## 2. Plan y preparación histórica de la serie complementaria

**Este apartado describe su preparación inicial.** La ejecución y el resultado
vigentes están acreditados en la actualización superior y el informe mixto.
La capacidad sintética inicialmente 500 fue elevada a 600 para conservar reservas
previas; los rangos consumidos de 25 se reasignaron con autorización. Estos cambios
quedan en los diagnósticos enlazados y no modifican los criterios EQ.

```powershell
npm run test:carga:mixta
```

Es la **única serie adicional** para EQ-04/EQ-06. No llama al CLI de campañas de
lectura ni modifica su puntero/consolidado. Serie independiente:
`71e00e3c-28eb-4262-80ce-7abe043c49ed`.

| Nivel | Calentamiento | Rampa | Medición estable | Descenso | Recuperación |
| --- | --- | --- | --- | --- | --- |
| 25 VU | 60 s a 1 VU | 60 s | **600 s** | 60 s | 120 s |
| 50 VU | 60 s a 1 VU | 60 s | **600 s** | 60 s | 120 s |
| 100 VU | 60 s a 1 VU | 60 s | **600 s** | 60 s | 120 s |

45 minutos configurados, más preparación y posibles esperas Auth/graceful stop.
Cada VU sigue el mismo ciclo: catálogo, disponibilidad, reservas propias, catálogo,
confirmación; pausa de un segundo después de cada operación. Mezcla nominal
**80% consultas / 20% confirmaciones**; los ciclos incompletos de transición pueden
variar ligeramente la proporción observada, que se reportará con contadores reales.

Volumen/configuración explícitos: dos barberías nuevas, 20 profesionales sintéticos
distintos de los 100 clientes, servicio de 15 min/S/15, 09:00–18:00 diario,
horizonte de 90 días, límite de 500 futuras por cliente en **esas barberías de
prueba**. Permite medir acumulación sin agotar cupos antes de terminar la serie.
100 reservas iniciales, una por cliente, sembradas antes de medir. Se reservan
4.000/8.000/16.000 turnos únicos para 25/50/100, respectivamente: son capacidad de
fixtures, **no reservas ya confirmadas ni throughput acreditado**. La asignación
evita solapamientos tanto del cliente como del profesional, incluso entre niveles.
Las consultas de reservas usan el contrato real del cliente, RLS y límite 50.

Preparación local realmente comprobada: tres endpoints 200, sesiones Auth reales,
100 reservas iniciales y cero violaciones SQL. [Registro](complementary-preparation.json).
El comando renueva sesiones antes de medir cada nivel, conserva intentos y omite
solo niveles aprobados de **esta serie mixta**. Nunca utiliza la aprobación previa
de lectura para saltarse esta medición. Si un intento fallido dejó escrituras,
no repetirlo a ciegas: revisar su evidencia antes de autorizar nueva asignación.

Evidencias futuras: `.artifacts/k6/complementary/<serie>/<nivel>/<intento>/`,
con resumen nativo/JSON, recursos, integridad, cierre y cotejo del incremento SQL
con el número real de confirmaciones aceptadas. Manifiestos, sesiones y permisos
temporales permanecen ignorados. No publicar estas carpetas sin sanitizar.

Aceptación: p95 completo por catálogo/disponibilidad/reservas **≤3 s**, errores
técnicos **<1%**, checks contractuales **100%**, cero violaciones de integridad,
600 s completos y nivel alcanzado. Las guardas críticas/sostenidas de memoria,
CPU, conexiones, salud y cierre siguen activas. Las estimaciones de RAM solo
advierten. Se conserva la política estricta anterior fuera de Stress: un resultado
inesperado aborta; la excepción metodológica EOF del Stress de lectura no se hereda.
No hay reintentos ni conflictos esperados artificialmente aceptados en esta serie;
las carreras/idempotencia se acreditan por separado con los casos SQL/HTTP.

## 3. Estado de los EQ originales

| EQ | Estado integral | Alcance y pendiente mínimo |
| --- | --- | --- |
| 01 | **Cumplido** en el conjunto definido | Matriz de roles/pagos original más negativos y positivos faltantes; no es garantía universal de ausencia de vulnerabilidades |
| 02 | **Parcial** | Aislamiento de datos/reservas y lectura pública acreditados; propiedad de imágenes y reseñas ajenas sin implementación/acreditación completa. No desarrollarlas en esta etapa |
| 03 | **Cumplido** en los casos acordados | Carreras de reservas, rollback e idempotencia reutilizados; pago con dos actores distintos ahora observado. No equivale a carga mixta de escrituras |
| 04 | **Cumplido en laboratorio** | Mixta 100 VU/600 s, p95 completo catálogo/disponibilidad/reservas 4/8/7 ms, cero técnicos. Global 3,66 s documentado, sin atribuirlo a una consulta |
| 05 | **Parcial integral; hora local acreditada, mes no evaluado** | [Hora manual auditada](../../eq05/INFORME.md): 360/360 éxitos, cobertura/disponibilidad 100 %, cero errores, 361 propias canceladas y 19.471 globales. El mes publicado original no se sustituye; adaptación por plazo requiere aceptación docente. Parcial previo separado |
| 06 | **Cumplido en laboratorio y mezcla definida** | Mixta 25/50/100 ×600 s, 17.630 aceptadas = persistidas, sin pérdidas; recuperación registrada. Escalado no lineal y latencias de escritura sin percentiles propios documentados |
| 07 | **Cumplido** para fallo controlado | Persistencia/reintento sin duplicado acreditados. Entrega real por proveedor no ensayada aquí; es una comprobación distinta, como indica el escenario original |
| 08 | **Parcial integral; núcleo construido acreditado** | [Paquete EQ-08 consolidado](../../eq08/INFORME.md): 88 archivos de núcleo/199 dependencias, cero prohibidas, un caso real por lado aprobado con dobles y red denegada, cobertura reutilizada. Sustitución de mapas/imágenes aún pendiente; no se implementaron |
| 09 | **Parcial integral; recorrido funcional Web acreditado** | [Playwright y conciliación SQL](../../eq09/INFORME.md): dos clientes, 201/409/201, servicio conservado, teclado y sin reenvíos; dos reservas, cero para conflicto. Android/ubicación/participantes y accesibilidad completa pendientes; foco/encuadre y Efectivo tenue documentados |
| 10 | **Cumplido** en campos/casos definidos | Snapshots anteriores de nombre/precio y reprogramación más cambio real de política vigente y lectura autorizada; sin repetir la batería histórica |

## 4. Cinco entregables del Sprint 2

| Entregable del docente | Situación verificable | Falta estricta |
| --- | --- | --- |
| Código organizado según arquitectura | **Disponible**, cliente/servidor con puertos/adaptadores, 18 especificaciones, migraciones y checkers; [calidad](../calidad.md) y CI aceptada | Conservar gates; estos cambios locales de harness/documentación aún no están publicados por restricción del usuario |
| Primera versión funcional | **Disponible en Web**, recorrido manual de cuatro perfiles aceptado; backend funcional previo | No confundir con finalización Android, imágenes, reseñas, mapas o despliegue público; permanecen fuera de este cierre funcional Web |
| OpenAPI/Swagger | **Disponible**, [OpenAPI](../../../../api/openapi.json), visor local y [check reproducible](../calidad.md) | No se cambiaron APIs/contratos; validación histórica reutilizada, sin otra ejecución innecesaria |
| Pruebas y cobertura | **Disponible**, Node/Deno/arquitectura, cliente 100% líneas/funciones y 93,14% ramas; servidor 100%/100%/100% según última evidencia aceptada | No se instalaron Jest ni dependencias; se agregan 15 checks locales y [31 pruebas del harness](static-tests.log), sin atribuirles cobertura nueva del producto |
| Validación de atributos de calidad | **Disponible pero incompleta integralmente**, lectura k6 hasta 1.000, mixta 25/50/100, cierres acotados, EQ-08 núcleo, EQ-09 Web y EQ-05 local una hora | EQ-04/EQ-06 cerrados; EQ-02/08/09 parciales y EQ-05 local acreditado sin mes publicado. Aceptación docente de adaptación pendiente; [situación actual y pendientes mínimos](../../eq05/SITUACION-SPRINT2.md). No declarar diez íntegros |

La validación de los diez EQ es obligatoria según aclaración del responsable.
Las brechas de módulos y del mes se presentan como limitaciones, no se trasladan
silenciosamente a entrega final ni se cambian criterios para aprobar. Informe final,
CD/despliegue, DNS/CDN y sustentación conservan su seguimiento propio en la rúbrica;
esta tabla no los declara concluidos. **2.000 VU no acreditados**; no sustituyen ni
son requisito original de la serie EQ-04/EQ-06. No ejecutar otra campaña de lectura
por rutina. La evidencia de 1.000 VU corresponde a lectura, no a 1.000 escrituras.

## 5. Conservación y verificaciones

Se verifican nuevamente los SHA de los 131 archivos crudos/puntero preservados,
producto/SDD/Constitución/migraciones/Actions y las filas de las 18 tablas de negocio
incluidas en el digest inicial; no se afirma inmutabilidad de metadatos de sesiones
Auth renovadas. Registro:
[verification.json](verification.json). Sin commits, staging, push, Cloud ni nuevas
pruebas de carga. No se detectó un defecto del producto que requiera modificarlo.
