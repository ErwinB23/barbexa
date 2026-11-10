# Contratos internos y navegación — 001

## Operación técnica

`InformacionAplicacionGateway.obtener(): Promise<InformacionAplicacion>` vive en aplicación.
`ConsultarInformacionAplicacion(gateway)` produce una función que recibe `SolicitudInformacion`
y devuelve `Promise<ResultadoInformacion>`. Se usan funciones y objetos estructurales, sin
contenedor de inyección, clase base ni repositorio genérico.

1. Validar que la solicitud existe y `idioma === 'es-PE'` antes de invocar el gateway.
2. Entrada inválida: retornar `entrada-invalida`; cero llamadas al gateway.
3. Entrada válida: una llamada; transformar su resultado en `ok` sin alterar los datos.
4. Rechazo del gateway: retornar `no-disponible`, sin stack, tokens ni mensajes internos.

Adaptadores: configuración local (real, datos públicos inyectados) y doble en memoria (solo pruebas,
permite resolver o rechazar y contar llamadas). Ambos satisfacen exactamente el mismo contrato.
El dominio solo contiene tipos y validación pura; no importa aplicación.

`src/composition/app-composition.ts` construye adaptador y caso de uso. Un proveedor de presentación
en `src/composition/app-provider.tsx` expone únicamente la función del caso de uso por un contexto
definido en presentación. `_layout.tsx` monta ese proveedor; no instancia adaptadores.
Así las rutas importan el punto de composición, pero ninguna infraestructura directamente.

## Navegación y vistas

| Ruta | Vista | Interacción / aceptación |
| --- | --- | --- |
| `/` | Bienvenida App Barbería | Acción «Ver base técnica» lleva a `/technical` |
| `/technical` | Información pública y muestra de componentes | Atrás del sistema/cabecera vuelve a bienvenida; reintento solo ante error real |
| ruta desconocida | Pantalla no encontrada | Acción «Volver al inicio» reemplaza la ruta por `/` |

`src/app/_layout.tsx`, `index.tsx`, `technical.tsx`, `+not-found.tsx` solo contienen navegación,
adaptación de parámetros y composición de vistas. Sin acceso a SDK, red, gateway ni reglas.
Usar Stack de Expo Router, sin tabs innecesarios ni imports directos de React Navigation.
Enlace de prueba de ruta desconocida se activa desde un procedimiento de desarrollo, no como
acción principal de producto. Reiniciar desde la URL raíz para comprobar apertura inicial.

## Diseño mínimo accesible

Tokens iniciales: fondo `#FFFFFF`, superficie `#F3F4F6`, texto `#111827`, texto secundario
`#374151`, acción/foco `#1D4ED8`, texto sobre acción `#FFFFFF`, error `#B91C1C`, éxito `#166534`.
Son candidatos: calcular ratios reales de cada pareja antes de aprobar (no inferirlos por apariencia).
Tipografía del sistema: cuerpo 16, título 24, auxiliar 14; espaciado 4/8/12/16/24/32;
radios 8/12. Tokens semánticos centralizados y sin fuente descargada.

Componentes: `AppText`, `AppButton`, `StatusMessage`, `Screen`. El botón se consume en bienvenida
y recuperación; el mensaje, en consulta y galería. Sin catálogo extensivo ni librería de UI nueva.
Usar primitivas RN con StyleSheet y safe-area-context del SDK; esta base no necesita controles
especializados, animaciones, NativeWind ni un paquete extra de diseño.

Texto escalable sin límites que bloqueen el 200 %, altura flexible, scroll y zonas seguras.
Todos los controles >=48×48 dp, nombre y rol accesibles, foco lógico, estado deshabilitado anunciado.
Error y éxito incluyen texto; carga se anuncia sin repetición continua. Ratios: texto normal >=4.5:1,
grande >=3:1, límites/foco de controles >=3:1. Verificar con TalkBack en Android, además del cálculo.

## Backend posterior (solo diseño)

Cliente: contratos propios de identidad/reservas/archivos y adaptadores SDK/HTTP por funcionalidad.
Servidor futuro: `supabase/functions/<operacion>/index.ts` como entrada y composición independiente;
casos de uso, dominio y adaptadores bajo módulos de servidor según sus consumidores reales.
No crear esas carpetas aún ni importarlas al bundle del cliente.

Auth verifica sesión; la entrada Edge verifica identidad y transforma HTTP a contexto propio.
ConfirmarReserva usa ReservaAtomicaGateway; su adaptador invoca PostgREST RPC con contexto seguro.
PostgreSQL verifica permisos, membresía activa, establecimiento, disponibilidad y transacción.
Storage transfiere archivos desde adaptador cliente bajo políticas; Edge autoriza referencias;
se diseña recuperación de fallos parciales al implementar imágenes. No API Node ni rutas `+api`.
