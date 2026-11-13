# T035 ? verificaci?n documental y reproducci?n ya ejecutada

13/11/2026, Codex; main/477b360. T035 completada seg?n enmienda expresa del responsable.

## Decisi?n y compatibilidad

Se revisaron Constituci?n 1.0.1 (IX?XI, gobernanza) y los 16 criterios de RUBRICA.md. Exigen SDD, pruebas y evidencia verificable, no ejecuci?n por una tercera persona. Se ajustan SC-006, US1 escenario 2, T035 y referencias de plan/validation/quickstart para admitir migraciones versionadas, SQL/HTTP/calidad reales y configuraci?n documentada, sin revisor externo ni un stack nuevo obligatorio para esos criterios. No cambian Constituci?n, r?brica, arquitectura, permisos ni requisitos de seguridad. SC-001 conserva las dos preparaciones ya ejecutadas; Cloud permanece pendiente.

No hubo revisi?n humana externa. La decisi?n lleg? cuando ya hab?a una segunda preparaci?n automatizada en curso. Sus resultados reales se conservan, sin inventarlos ni afirmar que nunca ocurri?. Desde esa instrucci?n no se crean entornos adicionales ni se vuelven a ejecutar pruebas.

## Reproducci?n automatizada efectivamente realizada antes de la decisi?n

- Copia externa inicialmente vac?a: C:/Users/PREDATOR/Desktop/app-barberia-t035-JLYmuT.
- Snapshot de 1 090 archivos versionados/no ignorados, incluido trabajo autorizado sin commit de T034. Sin .git, node_modules, bases de datos ni archivos privados ignorados. Log activo copiado desde HEAD, sin leer una versi?n inestable para el snapshot.
- [SHA-256 y bindings](t035-snapshot.json): todos los archivos del snapshot, cuatro overlays exclusivos de configuraci?n de destino/test, hashes antes/despu?s. No se modificaron fuentes de dominio/aplicaci?n/infraestructura ni migraciones en la copia.
- Nuevo stack: app-barberia-002-repro-20261113; API 54521, PostgreSQL 54522, Studio 54523, correo 54524, inspector 8184, shadow 54520. Se comprobaron puertos, nombres/red/vol?menes antes de arrancar; [aislamiento efectivo](t035-aislamiento.json).
- Overlays: supabase/config.toml y fixtures.mjs/environment.test.mjs/profile-environment.mjs; ?nicamente sustituciones del project_id y puertos 5442x?5452x/8183?8184. Guards, roles, expectativas, ACL y l?gica permanecieron iguales. No se ocultaron diferencias de bytes entre ambas configuraciones.
- Node 24.21.0, CLI 3.1.0 fijada e instalada por lockfile, Deno 2.9.8 en PATH del proceso, Docker Engine 29.9.3. Im?genes efectivas y destinos constan en el registro de aislamiento. No se actualiz? ninguna dependencia del proyecto principal.

| Ejecuci?n en copia | Resultado real |
| --- | --- |
| npm ci | Exit 0, 994 paquetes; [log](t035-install.log). Nueve avisos moderados, sin audit fix |
| supabase start --workdir <copia> | Exit 0; inicializaci?n vac?a y cinco migraciones aplicadas; [log](t035-start.log). stdout con claves omitido |
| supabase functions serve --workdir <copia> | Proceso iniciado solo para la copia, JWT activo, sin reiniciar originales |
| supabase test db --workdir <copia> | 336/336, exit 0; [log](t035-sql.log) |
| node scripts/run-backend-integration.mjs | 440/440 resultados TAP, sin skipped, exit 0; [log](t035-http.log), incluidas carreras C1?C4 y cleanup |
| npm run check | Exit 0; [log](t035-quality.log), 86 unitarias cliente, 17 servidor, 38+45 AST, 11 presentaci?n, 18 runner |
| Cat?logo RLS/ACL efectivo | [Cat?logo](t035-catalogo.json), equivalente a l?nea base T033 al ordenar tablas/pol?ticas/funciones, sin comparar UUID/passwords |

package.json y package-lock.json id?nticos por SHA-256 en original/copia. npm ci no alter? el lockfile. Las migraciones reproducen modelo, privilegios y restricciones; el cat?logo coincide y las pruebas acreditan capacidades equivalentes. Es ejecuci?n real de Codex, no repetici?n de otra persona ni evidencia remota. No hubo db reset sobre ninguna base. La consulta inicial de ayuda CLI fall? en sandbox por telemetr?a de usuario; repetida fuera del sandbox con autorizaci?n, exit 0.

Los scripts de orquestaci?n ef?meros se conservaron en .artifacts del original (ignorados), con inventario/bindings y resultados duraderos enlazados aqu?. Gu?a comprobada: quickstart.md, comandos Windows npm.cmd/binario local, --workdir expl?cito y comprobaci?n de c?digos. En copia se us? BARBERIA_002_URL=http://127.0.0.1:54521 y BARBERIA_002_PROJECT_ID=app-barberia-002-repro-20261113. No ejecutar esos comandos contra otra base sin repetir identificaci?n y guards.

## Evidencia reutilizada para el criterio vigente

- FR-001: independencia local acreditada; destino Cloud a?n pendiente T036?T038.
- FR-002?FR-003: cinco migraciones versionadas, snapshot/hash y package/lock conservados.
- FR-004?FR-018: SQL/HTTP local y cat?logo de T032?T033; adem?s repetici?n autom?tica de este bloque. V?anse aislamiento.md, calidad.md y los logs enlazados; no se atribuyen a UI/remoto.
- FR-019: ocho operaciones p?blicas consumidas por runner, con regresiones 001 preservadas.
- FR-020: aceptaci?n/trazabilidad y l?mites aqu? e informe.md; consolidaci?n final/remoto siguen T039.
- T034: consultas.md, volumen/planes reales sin SLO, k6 ni escalabilidad productiva inventada.

La aceptaci?n de SC-006 usa esta evidencia/pendientes expl?citos y gu?a, sin exigir otro ejecutor. No implica que toda la funcionalidad 002 o Cloud est?n terminadas.

## Conservaci?n y l?mites

Se comprob? aislamiento respecto a ambos stacks anteriores; no se operaron recursos barberia-app ni se modific? su base. El principal conserva migraciones/c?digo/dependencias y log activo. Las suites terminaron con limpieza en finally; no se guardaron datos reales, JWT o contrase?as. No se hizo una consulta independiente posterior de conteos en el stack temporal tras la nueva restricci?n: cleanup se acredita por finalizaci?n satisfactoria de las suites.

El stack temporal y su proceso functions serve YA estaban creados antes de la nueva instrucci?n y se dejan en su estado actual: no se detienen/eliminan para respetar no tocar contenedores. Sus recursos son exclusivamente del ID anterior; la copia externa se conserva. No crear un tercer stack. La operaci?n futura de retirar esos recursos requerir? un alcance separado, no forma parte de T036.

Persisten nueve avisos moderados npm, sin remediaci?n o aceptaci?n formal. Sin pruebas nuevas Android/web, Cloud, cambios de Constituci?n/r?brica/001, commit o push. T036 necesita propuesta concreta de organizaci?n, regi?n, nombre, PostgreSQL 17, responsable/costo y autorizaci?n de destino; no ejecutada.
