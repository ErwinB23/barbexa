# Cloud — Fase A: respaldo y ensayo de recuperación

21/11/2026, America/Lima. Supabase CLI 3.1.0. Proyecto exclusivo:
`vuoncrtkkkquvddunrxx`. Sin migraciones, despliegues ni escrituras de negocio Cloud.

Respaldos nuevos en directorio fuera del repositorio, con ACL únicamente para el
usuario propietario y SYSTEM:
`C:\Users\PREDATOR\AppData\Local\Barbexa\backups\cloud-phase-a-20261121-194702-5783cddd`.
No publicar ni adjuntar los dumps: contienen datos de Auth y sesiones.

Inventario: schema.sql, data.sql, roles.sql, migration-history.sql,
managed-schema.sql, catálogo de roles sin contraseñas, estado de migraciones
Auth/Storage, metadatos de publicación y las cuatro fuentes Edge anteriores.
SHA-256 individuales en SHA256-current.json; originales conservados sin cambios.
Procedimiento detallado y operador en RECUPERACION.md y recovery-operator.mjs.

Ensayo real: PostgreSQL17.11 en contenedor independiente usando imagen ya instalada,
sin red, puertos publicados, volúmenes LOCAL ni costes de rama Cloud. Restauración de
roles base NOLOGIN, extensiones compatibles, esquemas administrados y publicación,
esquema de negocio, datos e historiales. Comparación read-only contra Cloud:

- 58 tablas: conteos y huellas de todas las filas coincidentes.
- 20 tablas de negocio, 80 funciones, 16 políticas RLS y 4 triggers.
- 16 migraciones y catálogos/columnas/restricciones coincidentes.
- 2 usuarios Auth, 3 identidades y 2 perfiles restaurados como datos.
- Nombres y membresías de roles y ACL efectivas/grant options coincidentes.
- Cero barberías y membresías Cloud; sin nuevas cuentas o sesiones de aplicación.

La restauración ordinaria detectó dos prerrequisitos omitidos: definiciones de
plataforma y publicación supabase_realtime. Se respaldaron por lectura y restauraron
solo en el ensayo. ACL implícitas equivalentes se verificaron mediante aclexplode;
el verificador se corrigió para ACL vacías y agregación de más de50tablas.

Límites: supabase_vault0.3.2 no está disponible en la imagen instalada; se excluyó
del ensayo, no del proyecto real. Vault Cloud contiene0secretos. No se recuperaron
contraseñas de roles, clave maestra Vault, archivos físicos Storage, configuraciones
Auth/OAuth/SMTP, valores secretos Edge ni claves de firma JWT. No se ejecutaron
servicios Auth/Storage/Realtime ni login, OAuth o redespliegue Edge. El superusuario
bootstrap del ensayo y NOLOGIN en roles son diferencias operativas expresas.
Los dumps secuenciales no equivalen a PITR/snapshot físico atómico, aunque las
huellas restauradas coincidieron con Cloud durante la verificación.

Contenedor propio eliminado después del ensayo; originales y evidencias privados
conservados. LOCAL:42reservas/45detalles y todas las huellas de negocio intactas;
esquema e historial18 sin cambios. Cloud permanece en16migraciones.

Fase A terminada con recuperación acreditada para el alcance de base de datos
cubierto. Recuperación integral de plataforma NO acreditada. Fase B NO ejecutada:
resolver o aceptar explícitamente los límites y preparar la compensación concreta
antes de activar17/18. No ejecutar restauración masiva, db reset ni reparación de
historial como reversión automática.
