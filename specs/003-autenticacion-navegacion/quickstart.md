# Guía de ejecución y validación prevista — 003

Solo planificación. Los archivos de aplicación, dependencia Auth y callbacks aún no
están implementados. No ejecutar esta guía como si 003 estuviera lista. PowerShell/Windows.

## Prerrequisitos y permisos posteriores

1. Confirmar Git y conservar log activo t017-serve.log. Nunca reiniciar su proceso para
   limpiar Git. Proyecto permitido vuoncrtkkkquvddunrxx; antiguo klebvayvsvibwjpkzrff prohibido.
2. Aprobar entorno de pruebas y datos sintéticos/limpieza. No usar cuentas personales.
   Backend 002 existe; no repetir migraciones ni crear otro proyecto para 003.
3. Antes de instalar SDK/SecureStore: consultar versiones, diff de dependencias y
   `npm.cmd audit --json`, `npm.cmd audit --omit=dev --json` sin fix. Códigos no cero por
   avisos se registran como tales; nueve moderados previos no desaparecen por omisión.
4. Configuración local fuera de Git: URL y clave pública. Nunca pedir ni pegar service
   key/contraseñas/PAT en chat. Expo puede publicar EXPO_PUBLIC: solo valores públicos.
5. Aprobar URL Web estable de desarrollo/pruebas, redirects Auth exactos, mecanismo de
   correo de prueba y CORS BARBERIA_ALLOWED_ORIGINS del Edge existente. Verificar recepción
   real; las cuentas confirmadas por runner admin de 002 no prueban entrega de email.
6. Android: build propio SDK58 con scheme appbarberia. Elegir build local con JDK/SDK/adb
   acreditados o EAS autorizado; no instalar herramientas por costumbre. Expo Go no basta
   para aceptar enlaces del scheme de la aplicación. Cloud HTTPS evita relajar HTTP LAN.

## Controles futuros (no ejecutados en plan)

```powershell
git status --short
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run format:check
npm.cmd run architecture:check
npm.cmd test
npm.cmd run check
npx.cmd --no-install expo install --check
npx.cmd --no-install expo start --web --port 8081
```

check incorpora servidor/Deno y requiere herramientas existentes según 002; no sustituye
pruebas de flujos. El script start actual fuerza --go: para Android propio usar después
`npx.cmd --no-install expo start --dev-client --lan` con build instalado y red disponible.
No arrancar otro Metro en puerto ocupado; reutilizar el autorizado cuando corresponda.
No proponer comandos de scripts nuevos aún inexistentes; las tareas los precisarán.

## Recorridos reales por plataforma

Seguir [validation.md](validation.md) y [contratos](contracts/authentication.md).
Primero Web ligeramente y luego Android en cada incremento, misma versión de funcionalidad.

- US1: alta/confirmación/perfil, tres recorridos por plataforma, reintento de perfil y
  ausencia de duplicados. Capturar resultados sin URL de confirmación ni correo personal.
- US2/US3: login, enlace protegido, logout, Atrás/Adelante/recarga Web, reinicio/Atrás
  Android; renovación, revocación y red interrumpida en arranque/foco. Pestañas Web
  comparten salida sin reinstaurar estado anterior.
- US4: cero/una/varias membresías, admin-A/barber-B e inactiva; cambio/revocación sin
  arrastrar permisos. Fixtures solo tras autorización; no gestión UI de personal.
- US5: solicitar correo real, abrir enlace con aplicación/vista cerrada, nueva contraseña
  y login; expirado/reutilizado/cancelado/sin verifier falla seguro y permite nuevo envío.
- Accesibilidad: Web teclado/foco/lector, Android TalkBack/texto máximo/48dp/zonas seguras.
  Las pruebas 001 no acreditan formularios nuevos de 003.

## Evidencia y limpieza

Futura carpeta docs/evaluacion/evidencias/003-autenticacion: versión/HEAD+diff, fecha Lima,
navegador/Android/build/origen, pasos, esperado/obtenido, comandos/códigos, fallos y
correcciones. Tokens/callbacks/passwords fuera de capturas y logs. Registrar atribución
usuario/Codex y automatizado/manual. No marcar completo con falla de una plataforma.
Limpiar selectivamente usuarios/perfiles/membresías ficticios solo según autorización
previa; no borrar cuentas reales ni datos de otros proyectos. Cerrar sesiones de prueba
y confirmar residuos cero, sin prometer invalidación instantánea de JWT.
