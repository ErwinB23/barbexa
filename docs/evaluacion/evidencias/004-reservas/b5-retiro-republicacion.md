# B5 — retirada y republicación final

## B5 — retirada final ejecutada; republicación pendiente tras detención

21/11/2026, Lima. Autorización expresa de dos transiciones reversibles únicamente sobre
B5 Cierre Web LOCAL validado, UUIDf3c7f90f-cb85-4a88-86ce-ec27ec3ba8a6, ownerU3. Preflight42reservas/45detalles,
historial18, published/version17 y huellas protegidas coincidentes. Chrome con sesión
GoTrue LOCAL auténtica U3, autoridad owner/publish verificada. UNA retirada emitida:
HTTP200, requestId00c32245-6a18-4cbf-bbd8-bb43dbf282d7,
PostgreSQL withdrawn/version18 y Web Estado:Retirada. No se repitieron comandos previos.

Cliente en contexto Chrome nuevo, caché HTTP deshabilitada: listado por nombre200 vacío;
listado general200 con6barberías, sin el UUID objetivo. Las aserciones de ausencia de
la tarjeta en Explorar y del botón en Reservar se ejecutaron antes del siguiente fallo,
pero el resumen Web final no se guardó porque se serializaba al finalizar toda la prueba.
No afirmar prueba de slots denegados: esa consulta no llegó a ejecutarse.

El verificador se detuvo al consultar get_booking_catalog: HTTP500/codeP0002 frente al
404 esperado por su código. El SQL existente deniega con P0002/NOT_AVAILABLE; PostgREST
mapea los erroresP0* a500 (documentación oficial). La expectativa404 del verificador fue
incorrecta; no demuestra caída de PostgreSQL ni autorización de reservas. No modificar
producto/SQL/Edge ni disfrazar500 como200. Se conservan respuestaHTTP y diagnóstico.

**REPUBLICACIÓN NO EJECUTADA. Estado persistido actual:withdrawn/version18.** La regla
expresa del usuario manda detenerse ante error inesperado; no se repitió retirada ni
se improvisó restauración. Se cerraron las2sesiones propias204,cero nuevas restantes.
Antes de continuar, revisar/corregir solo la expectativa del verificador con regresión,
revalidar ausencia/no oferta mediante lecturas y ejecutar UNA republicación pendiente
solo tras autorización de continuación. Nunca retirar de nuevo. Estado finalpublished
obligatorio todavía NO alcanzado. No cerrar B5.2 ni B5.

Lectura independiente17:54:30Lima:42reservas/45detalles/29care/71care_events/
55reservation_events,14usuarios/13perfiles/15membresías/9barberías. Las42reservas,45items,
pagos,atenciones,N2(una auditoría),servicios/precios,horarios,cierres,propietarios y
membresías intactos. Todas las filas previas permanecen salvo la configuración exclusiva
del tenant objetivo:publication_state yversion. CeroINSERT/DELETE de negocio; sin cambios
de otras barberías. Esquema/historial18/.env.local intactos; sinCloud/Android/migraciones/
producto/correos/dinero real/Git writes/operaciones de servicios.

El contrato de publicación actual incrementa settings.version,no añade eventos
históricosdedicados. Evidencia trazable de retirada:actorU3/requestIdHTTP/instantes/
SQL17→18. Ninguna auditoría previa se eliminó ni se añadió una estructura paralela.
La segunda transición y su evidencia aún no existen. Dos regresiones del control de
red aprobadas(RED→GREEN) y sintaxis del verificador aprobada; no equivalen al ensayo completo.

B5.3 continúa cerrado funcionalmente Web;B5.2/B5 siguen abiertos. Estado22 original:
22ejecutados/21acreditados íntegros/B2integral pendiente; este ensayo adicional autorizado
lleva1de2transiciones ejecutada. Matriz48 conserva39VERIFICADA/1SIN VALIDACIÓN INTEGRAL/
4NO APLICA/3BLOQUEADA/1PARCIAL. SMTPadministrativo/transferencia/visuales/Android/entrega
pública separados. Evidencia E004/b5-retiro-republicacion.json y .md. Detenerse al informe.

[Resultados HTTP, integridad y estado alcanzado](b5-retiro-republicacion.json).

Referencia de diagnóstico: [mapeo oficial de errores PostgREST](https://docs.postgrest.org/en/stable/references/errors.html).
