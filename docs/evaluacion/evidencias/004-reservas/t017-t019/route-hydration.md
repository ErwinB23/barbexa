# Montaje de proveedores al recargar rutas privadas — 14/11/2026

## Defecto y causa

El usuario acreditó entrada normal a Mis reservas con citas propias y fallo al recargar
http://localhost:8081/my-reservations o entrar directamente. No depende de utm_source.
Error: DEPENDENCY_UNAVAILABLE desde useBooking, sin BookingContext disponible.

La conservación reciente del Stack durante resolving evita perder el historial, pero
display:none solo oculta: React sigue montando las pantallas. RegistrationRuntimeProvider
publica inicialmente resolving con booking/operation ausentes y los crea en useEffect.
BookingRoute montaba MyReservationsScreen/BookingScreen antes de ese efecto; useBooking
correctamente rechazaba el proveedor null. Una sesión persistida válida no evita ese
primer render: todavía debe hidratarse y verificarse.

## Corrección mínima

Solo BookingRoute y OperationRoute: leer sus contextos sin invocar consumidores estrictos
prematuramente. Retornar null hasta configured, sesión ready, sin callbackError y proveedor
presente. Luego montar las pantallas existentes, sin duplicar SDK ni cambiar sus hooks.
Todas las llamadas hook del wrapper ocurren antes de la condición (orden estable).
useBooking/useOperation conservan su rechazo ante uso incorrecto fuera del proveedor.

El Stack raíz permanece montado; su pantalla pendiente no monta contenido privado.
SessionFeedback existente muestra verificación/reintento. Recuperar ready vuelve a montar
el consumidor con los puertos reales, conservando la ruta. Logout/revocación no renderizan
consumidores aunque aún exista el objeto del proveedor; las guardas retiran acceso.
No se cambió el arreglo de reanudación, Auth, preferencias/contexto, servicios ni datos.

## Evidencia automática y límites

tests/presentation/booking/route-hydration.test.mjs:6 RED iniciales,6 GREEN. Usa render React
y los hooks de contexto reales con pantallas y fuentes de sesión controladas. Cubre fases
sin runtime/sin proveedor, ready, resolving, error, signed-out y recovery para ambas pantallas
de reserva y el wrapper compartido de oferta. Comprueba entrada/F5/modelo de query string,
navegación y reanudación. No equivale a conducir un navegador con una sesión Supabase real:
esa reproducción funcional inicial fue reportada por el usuario; queda comprobación manual.

Suite dirigida: node --test route-hydration, booking UI, navigation-resume, protected-navigation,
session-resolution, composition y session-lifecycle de autenticación:47/47, salida0.
Tipos0, ESLint afectado0, arquitectura0 (103 módulos/29 núcleo/264 aristas), formato0.
No se ejecutaron baterías históricas, SQL, registros ni nuevas reservas.

## Un único recorrido manual sin crear reservas

1. Web, misma cuenta local confirmada: recargar /my-reservations; deben aparecer las citas
   existentes tras verificar, sin excepción. Entrar directamente /booking, recargar y repetir
   con /my-reservations?utm_source=fixture. Deben conservar ruta y funcionar igual.
   Cambiar de pestaña y volver: misma pantalla, sin datos privados durante verificación.
2. Inmediatamente Android: recargar el APK Development existente desde Metro actual;
   abrir Mis reservas y Reservar, cambiar de app y volver. Debe conservar cada ruta,
   cargar los datos propios y no mostrar DEPENDENCY_UNAVAILABLE. No confirmar citas nuevas.
3. Ambas plataformas: cerrar sesión, usar Atrás; no reaparecen datos privados. En Web,
   entrar directamente /my-reservations sin sesión debe denegar acceso, sin excepción.

Confirmar resultados por plataforma, sin credenciales ni tokens. No necesita nuevo APK
ni reiniciar Metro: cambio exclusivamente JS. El caso Android de proceso completamente
destruido conserva las limitaciones documentadas en navigation-resume.md.

T013/T019 permanecen pendientes,00417/34. Reservas reales Web/Android previas del usuario
conservadas como evidencia; no se inventa validación manual de esta corrección. Conjunto
T019 intacto. URL Auth antigua sigue pendiente; no se usa un enlace nuevo en este recorrido.
Sin Cloud, bases, contenedores, log activo, dependencias, commits ni push.
