# Cloud — Fase C: actualización controlada

21/11/2026, 22:56 America/Lima. Cierre técnico del alcance autorizado; no equivale
a aceptación funcional de B1–B5 en Cloud ni a publicación de la Web.

## Destino y preflight

- Proyecto exclusivo `vuoncrtkkkquvddunrxx`, `sa-east-1`, ACTIVE_HEALTHY.
- CLI instalado 3.1.0, enlazado expresamente con `link vuoncrtkkkquvddunrxx`.
- Antes de escribir: 16 migraciones, solo 17/18 pendientes, SHA-256 aprobados,
  catálogo y las huellas de las 58 tablas del respaldo coincidentes; sin otras
  transacciones activas, transacciones abandonadas ni esperas de bloqueo.
- Respaldo privado original de Fase A íntegro y vigente antes de la actualización.
  No se necesitó reemplazarlo ni sobrescribirlo. Fuentes Edge anteriores conservadas.
- Verificadores, copias de ejecución y resultados detallados en el directorio privado
  `C:\Users\PREDATOR\AppData\Local\Barbexa\backups\cloud-phase-c-20261122012922-e0d17a03`.
  Sus copias de migraciones tienen los mismos bytes que los originales; no contienen
  fixtures LOCAL. No publicar dumps ni archivos de configuración sensibles.

## Activación de autoridad

`BARBERIA_ENABLE_TEAM_AUTHORITY` se consume en
`supabase/functions/_shared/barbershop-operation/composition.ts`; espera exactamente
la cadena `true`. Ausente o con otro valor no configura la extensión, y
`application/operation.ts` rechaza sus comandos con FORBIDDEN.

Habilita read-team-authority, remove-secondary y los comandos de iniciar, cancelar,
rechazar y aceptar transferencia. La aceptación definitiva sigue bloqueada con
CONFLICT en `application/team-authority.ts`, incluso habilitando la extensión.
Las invitaciones administrativas tienen otra bandera y otros requisitos de correo.

La bandera permaneció ausente/desactivada. No es requisito para aplicar el SQL ni
para arrancar/desplegar la función. No desactiva la autorización incorporada al SQL.
Ensayo de composición sin red y con identidad doblada: OPTIONS204 y autoridad403;
sin requisitos de correo cuando las invitaciones también están desactivadas.

## Migraciones reales

Se usó `migration up`, no db push, SQL manual de historial, repair, seed ni roles.
Para garantizar un solo pendiente por operación, se prepararon directorios privados
con los originales 1–17 y 1–18 respectivamente. `migration list` confirmó el destino
y el único pendiente antes de cada intento.

Comandos ejecutados una sola vez, no volver a ejecutarlos para repetir la evidencia:

```text
supabase migration up --remote=vuoncrtkkkquvddunrxx --workdir <privado>/migration-17 --yes --output-format json
supabase migration up --remote=vuoncrtkkkquvddunrxx --workdir <privado>/migration-18 --yes --output-format json
```

| Paso | Resultado | Catálogo revisado |
| --- | --- | --- |
| 17 team_authority | CLI0, historial17 | 24 tablas, 92 funciones, 16 RLS, 7 triggers |
| 18 administrative_closure_withdrawal | CLI0, historial18 | 24 tablas, 98 funciones, 16 RLS, 8 triggers |

Conteos de tablas/funciones/políticas en public/private; triggers revisados también
incluyen los de Auth del catálogo. Primeras 16 entradas de historial intactas.
Todas las tablas de aplicación tienen RLS; funciones SECURITY DEFINER con search_path
vacío; RPC privilegiadas sin EXECUTE anon/authenticated y con permiso service_role.

Verificados en Cloud por lectura: cuatro nuevas tablas privadas vacías, RPC, columna
de retirada, índice único de auditoría, triggers de historia inmutable, restricciones
validadas y definiciones de motivo obligatorio, replay y disponibilidad que excluye
cierres retirados. Esta inspección de definiciones no prueba transiciones de negocio.
Pruebas SQL positivas de autoridad, disponibilidad, idempotencia y concurrencia:
se reutiliza Fase B en PostgreSQL desechable; no se repitieron con datos Cloud.

## Edge y pruebas

Despliegue único ejecutado:

```text
supabase functions deploy barbershop-operation --remote=vuoncrtkkkquvddunrxx --use-api --yes --output-format json
```

- barbershop-operation: versión2 → versión3, ACTIVE, verify_jwt=true conservado.
- ensure-profile, create-barbershop y reservation-command: versión2 intacta.
- 30 archivos de runtime descargados de la versión desplegada: todos coinciden
  con las fuentes probadas; módulos de autoridad y cierres incluidos.
- 72 pruebas de servidor y 71 regresiones de autoridad/cierres/operador: aprobadas.
  TypeScript del núcleo servidor y Deno check de las cuatro entradas: aprobados.
- No se modificaron fuentes de producto ni SQL; se comprobó su SHA-256.

HTTP real sin login de usuario ni comandos de negocio:

| Comprobación | Resultado |
| --- | --- |
| Sin Authorization | 401 |
| JWT inválido | 401 |
| OPTIONS desde origen permitido: arranque del runtime | 204 |
| OPTIONS desde origen no permitido | 403 FORBIDDEN |
| RPC de autoridad como anónimo | 401 / PostgreSQL42501 |
| Salud de Auth | 200 |

No confundir estas denegaciones y arranque con aceptación positiva de propietario,
secundario o profesional. No se creó sesión de usuario ni se ejecutó OAuth.

## Integridad y límites

Cloud final: 2 usuarios, 3 identidades, 2 perfiles; 0 barberías, membresías,
propietarios, reservas, detalles, atenciones y eventos de autoridad. Storage mantiene
0 buckets y 0 objetos. Huellas de las 58 tablas previas intactas, excepto el historial
de migraciones, cuya ampliación es la autorizada. Sin escrituras de negocio.

No se emitieron comandos de modificación de secretos. Nombres y fechas de las dos
variables personalizadas sin cambios. El CLI no entrega digest en ese campo; no se
afirma una comparación criptográfica de valores antes/después. Las marcas temporales
de variables reservadas SUPABASE_* no se usaron como evidencia de mutación de valores.
Supabase inyecta esas variables y reserva su prefijo:
https://supabase.com/docs/guides/functions/secrets#production-secrets.

Incidencias limitadas al verificador, sin reparaciones de producto:

1. --read-only rechaza DO antes de enviarlo. Se sustituyó esa expectativa por
   privilegios introspectados y denegación exacta42501 de su conexión de lectura.
   No se volvió a aplicar17 ni se afirmó que esa llamada acreditara un actor Auth.
2. La serialización JSON omite propiedades undefined; se normalizó la comparación
   de metadatos ausentes. Dos aserciones de regresión, sin repetir despliegue.
3. Las fechas de variables reservadas no prueban cambios de secretos personalizados;
   se separó esa comprobación. Cinco aserciones adicionales rechazan diagnósticos de
   otro proyecto, otra función y respuestas inesperadas del verificador SQL.

No hubo rollback, restauración, copias LOCAL→Cloud, modificación Auth/OAuth/Google,
contraseñas, identidades, interfaces, Android ni cambio de frontend a Cloud.
No se operaron servicios LOCAL, ni staging, commit o push.

Pendientes separados: habilitar autoridad solo con autorización posterior, pruebas
positivas con actores reales y preparación de invitaciones/correo si se aprueba.
La recuperación integral de Auth, secretos, Storage físico y runtime conserva los
límites de Fase A/B; no existe migración inversa aprobada.

Detalle sanitizado: `cloud-phase-c.json`. Detenerse; no iniciar la etapa siguiente.
