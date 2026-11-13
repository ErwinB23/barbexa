# T003 — Herramientas, comprobación parcial del bloque 1

**Estado vigente: T003 completada.** El apartado «Cierre T003» contiene los cotejos nuevos;
los registros de pendiente que siguen son históricos y se conservan como evidencia.

Fecha: 2026-11-11. Consultas ejecutadas por Codex; **T003 pendiente**. No se instaló nada.

| Comprobación | Resultado | Código/estado |
| --- | --- | --- |
| node --version | 24.21.0 | Disponible |
| npm.cmd --version | 11.19.0 | Disponible |
| Get-Command node,npm.cmd,wsl | Ejecutables resueltos | Consulta realizada |
| wsl --version, lectura UTF-16LE | WSL 3.0.5.0, kernel 6.18.58.1-1 | 0 |
| wsl --status, sandbox | Wsl/E_ACCESSDENIED | 4294967295 |
| wsl --status, repetido con permiso fuera de sandbox | Ubuntu predeterminado, versión predeterminada 2 | 0 |
| Get-Command supabase,deno,docker,psql | No encontrados en PATH | No se ejecutaron comandos ausentes |

La advertencia de wsl --status sobre WSL1 no acredita fallo de WSL2. No se inició Ubuntu
ni se probó Docker Linux: disponer de WSL no demuestra un motor de contenedores operativo.

Tampoco se encontraron docker.exe/Docker Desktop.exe en Program Files/Docker, deno.exe
en el directorio .deno/bin del usuario ni supabase.exe en shims de Scoop/links de WinGet.
Es una búsqueda acotada, no prueba absoluta de ausencia en todos los discos/usuarios.
El bloque inicial de consultas PowerShell terminó con estado 1 y combinaba rutas ausentes
y consulta de puertos; no se atribuye ese estado a una instalación. La consulta de puertos no produjo una
medición concluyente; no declarar libres los puertos locales.

## Requisitos para completar T003

- Facilitar rutas existentes o autorizar preparación de Supabase CLI 3.1.0 con checksum
  oficial y ayuda real, y Deno 2.9.8, según versiones del plan. No instalar paquetes en Expo.
- Facilitar Docker Desktop o autorizar instalación/configuración. Después comprobar motor
  Linux con docker info, virtualización/WSL2 y puertos requeridos.
- PostgreSQL major 17 se comprobará mediante las imágenes/herramientas locales previstas,
  sin exigir un servidor PostgreSQL standalone adicional. No arrancar un stack Supabase
  en este bloque: esa acción pertenece a T008. Registrar disponibilidad/parches/digests
  cuando corresponda; ahora no están acreditados. psql puede provenir del contenedor futuro.

Sin estos resultados no se satisfacen literalmente herramientas, checksum/ayuda, motor,
puertos y disponibilidad PostgreSQL requeridos por T003. No marcar su casilla aunque esta
inspección parcial esté documentada. Cualquier cambio de versión exige decisión previa.

## Revisión sin ejecución de T004–T007

T004 depende de T002 **y T003**; T005 de T004; T006 de T005; T007 de T006. La cadena permite
conservar esos cuatro elementos como bloque secuencial, pero **no puede comenzar completo
ahora** por T003 pendiente. No ejecutarlos parcialmente saltando esta dependencia; primero
completar T003 o solicitar un ajuste formal del orden, sin cambiarlo silenciosamente.
Ninguna de T004–T007 necesita todavía un proyecto remoto; tampoco autoriza crear el stack
T008. Esta revisión no ejecutó fixtures, checker, compilación, pruebas ni código del bloque 2.

## Seguimiento T003 — CLI y Docker disponibles; Deno pendiente

Fecha: 2026-11-11. Este apartado actualiza disponibilidad sin alterar los resultados anteriores.
Git inicial main/9938bb842683fcd6b7a3fd3ab5e8dd1711234347, con cambios locales autorizados
en package.json, package-lock.json, tasks.md y evidencias anteriores. No se descartaron.

| Comprobación nueva | Resultado | Código |
| --- | --- | --- |
| Lectura package.json, package-lock y package instalado mediante Node | Supabase 3.1.0 exacta en devDependencies, raíz del lock y paquete instalado | 0 para lectura Node |
| npx.cmd --no-install supabase --version, sandbox | Falló escritura de telemetría local en .supabase | 1 |
| Mismo comando fuera del sandbox, con permiso | 3.1.0 | 0 |
| npx.cmd --no-install supabase --help, con permiso | Ayuda real CLI v3 obtenida; sin comandos de inicialización/conexión | 0 |
| docker.exe version --format JSON, ruta absoluta en sandbox | Ejecutable no visible en contexto restringido | 1 |
| Mismo comando fuera del sandbox, con permiso | Cliente/Engine 29.9.3, servidor Linux amd64, desktop-linux; Desktop 4.99.0 (245822) | 0 |
| Get-Command deno y búsqueda de ubicaciones habituales | No encontrado en PATH ni .deno/bin, Scoop o enlace WinGet revisados | Sin ejecutable para consultar versión |
| Get-FileHash del binario CLI instalado | SHA-256 F6ADEC9CAB13B017EEA61F75E1C54769EB520E0760453FD8A722877A8C0B30FF | 0 |

Docker se resolvió desde procesos existentes a
C:/Users/PREDATOR/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe.
El proceso del agente conserva un PATH que no lo resuelve; no atribuir esa limitación a
Docker detenido. La consulta del servidor verifica disponibilidad sin crear o modificar
contenedores ni leer datos de barberia-app.

La CLI actual distribuye su binario mediante @supabase/cli-windows-x64@3.1.0, no el antiguo
scripts/postinstall.js. Se revisó el manifiesto real tras una búsqueda inicial que no halló
ese archivo. El lock registra SRI sha512 para wrapper y paquete Windows; el hash SHA-256
anterior es una medición local, **no** cotejo acreditado contra checksum oficial. Ese criterio
de procedencia permanece pendiente de completar. No confundir SRI declarado con verificación
nueva del tarball/binario contra su publicación oficial.

El usuario incorporó la CLI con npm --save-dev --save-exact; ahora no hay latest ni rango
en el manifiesto: está fijada en 3.1.0. Esto difiere del método de binario externo previsto
en plan/T003. Se conserva expresamente la instalación comunicada por el usuario sin
revertirla, instalar otra copia o editar el plan. La dependencia es de tooling, no una
integración Supabase en Expo. No se ejecutó instalación ni actualización por Codex.

### Necesidad concreta de Deno y barrera de dependencias

Deno del host no es necesario para las fixtures Node/TypeScript de T004 ni para implementar
el checker T005. Sí es un requisito literal de T003 y permite ejecutar deno check/test y
medir cobertura de servidor previstos por T006, validation V2/V6 y quickstart. El runtime
interno que Supabase ejecutará en contenedor no acredita esos comandos locales sin arrancar
un stack, acción fuera de este bloque. Por tanto no se pospone Deno silenciosamente.

T003 sigue sin marcar: falta Deno 2.9.8 acreditado, cotejo oficial de checksum CLI y comprobación
concluyente de puertos/disponibilidad PostgreSQL 17. Docker Linux ya está acreditado.
T004 depende de T003; T005 de T004, T006 de T005 y T007 de T006. Ninguna de T004–T007
se ejecutó ni se marcará mientras siga abierta esa barrera.

### Procedimiento oficial propuesto para revisar, NO ejecutado

Según la [instalación oficial Deno](https://docs.deno.com/runtime/getting_started/installation/),
puede descargarse manualmente un ZIP con un único ejecutable y cotejarse con su .sha256sum.
Para conservar la versión del plan y evitar ejecutar un instalador remoto directamente:

1. Revisar los assets de la [release oficial v2.9.8](https://github.com/denoland/deno/releases/tag/v2.9.8)
   y seleccionar deno-x86_64-pc-windows-msvc.zip y su checksum para Windows x64.
2. Una vez autorizado el procedimiento, descargar ambos en ubicación temporal propia,
   verificar SHA-256 contra el publicado y abortar si difiere.
3. Extraer únicamente deno.exe a una carpeta de herramientas del usuario acordada fuera del
   repositorio, sin sobrescribir una instalación existente ni cambiar políticas PowerShell.
   Usar primero ruta absoluta; cualquier cambio persistente de PATH se revisa por separado.
4. Ejecutar deno.exe --version y comprobar 2.9.8; registrar origen, checksum y resultado.
   No añadir Deno al package de Expo ni crear contenedores para sustituir esa validación.

No se descargó, extrajo ni instaló Deno: se detuvo antes de instalarlo conforme al procedimiento
solicitado. El changelog Supabase fue consultado; no cambia la dependencia Deno de este plan.

## Cierre T003 — Instalación y cotejos ejecutados

Autorización del responsable: preparar herramientas, incluido Deno, sin instalar dependencias
npm nuevas. Deno 2.9.8 Windows x64 descargado de denoland/deno, release v2.9.8, ZIP y archivo
.sha256sum. SHA-256 del ZIP: **cba84b26e0df5ae7f74fc66b86a95b866872a86292ebd84fa1e959927edd93bf**.
Primera descarga sandbox falló por red; repetición autorizada fuera del sandbox completó
42 917 472 bytes. El primer verificador terminó con error porque esperaba formato checksum
convencional y el archivo oficial contiene Algorithm/Hash/Path. Se preservó esa incidencia:
la lectura explícita del único campo Hash demostró igualdad con los bytes descargados.
**No hubo discrepancia de hashes ni ejecución previa a verificarla.** La extracción comprobó
antes que el ZIP contuviera solamente deno.exe.

Instalación: C:/Users/PREDATOR/Desktop/Herramientas/AppBarberia/deno-2.9.8, fuera del repositorio.
Sin administrador ni cambios de ExecutionPolicy. Se añadió ese directorio al PATH de usuario
sin borrar entradas previas; procesos ya abiertos pueden requerir reinicio o ruta absoluta.
deno --version y deno help: exit 0; Deno 2.9.8, V8 15.0.245.2-rusty, TypeScript 6.0.3.

CLI: se descargó a carpeta de cotejo externa el tarball oficial npm
@supabase/cli-windows-x64@3.1.0, sin npm install ni scripts. Su SHA-512 coincide con el SRI
del registry y del lock:
`sha512-dMHC7mEmWROSTHVrhYVUEbmDz9DIqQnczwk+4QufZJpf9XnNI8DTtxOw0+lvJU9a3cmENPwrtiKuo4aXS5/s7Q==`.
Tras esa verificación, se extrajo solo package/bin/supabase.exe y se comparó con el instalado:
ambos SHA-256 **f6adec9cab13b017eea61f75e1c54769eb520e0760453fd8a722877a8c0b30ff** (exit 0).
Esto acredita el ejecutable del canal npm efectivamente usado; no afirma igualdad con un
archivo distinto del canal GitHub Releases. Versión y ayuda 3.1.0 ya verificadas en el seguimiento
anterior. Se conserva la elección npm exacta comunicada/autorizada por el usuario.

Docker ps/image ls y Get-NetTCPConnection: exit 0, solo consultas. Los antiguos contenedores
barberia-app siguen intactos; ocupan 54321, 54322, 54323, 54324 y 54327. No usar esos puertos
para el nuevo entorno. El rango alternativo **54420–54429 y 8183** no tiene listeners en esta
captura; queda seleccionado como preparación para configurar T008, sin crear configuración
ahora. Revalidar inmediatamente antes de iniciar el futuro stack; una captura no reserva puertos.

PostgreSQL 17 disponible localmente como imagen public.ecr.aws/supabase/postgres:17.11.0.011,
ID 7bd84e6a1d53. La consulta de imágenes no descargó ni inició nada. Acredita disponibilidad
de la herramienta/imagen para T003, no SQL/migraciones ni compatibilidad del futuro stack T008.
Motor Linux/Engine 29.9.3 y Desktop 4.99.0 ya corroborados; no se ejecutó SQL en el contenedor antiguo.

T003 cumple sus criterios y puede cerrarse. Se habilita T004; T005–T007 permanecen condicionadas
a sus comprobaciones individuales. Las incidencias históricas anteriores no se borran.
