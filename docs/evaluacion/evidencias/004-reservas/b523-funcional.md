# B5.2/B5.3 — ejecución funcional Web LOCAL

## B5.2/B5.3 — 21 comandos ejecutados; cierre integral pendiente

21/11/2026, Lima. Chrome + sesiones GoTrue LOCAL auténticas + HTTP + PostgreSQL:
21/22 comandos ejecutados sin repetir escrituras. 20 aprobados completos; B2 tiene la
transición HTTP200/SQL withdrawn/Web Retirada acreditada, pero su aserción negativa
de catálogo usó id en vez de barbershopId y no conservó el body: no atribuir ausencia
HTTP observada. B3 y catálogo final publicado sí se reconsultaron200 con el campo correcto.
Mantener abierta esa subverificación; no repetir B2/B3 ni sumar comandos sin permiso.

Nueva barbería f3c7f90f-cb85-4a88-86ce-ec27ec3ba8a6: B5 Cierre Web LOCAL → B5 Cierre Web LOCAL validado,
MISMO ID, propietario U3, una membresía y cero secundarios. Un servicio25/15→30/30,
desactivado/reactivado; perfil profesional explícito U3 y capacidad activos; horarios
local07–24 y profesional08–23:45 los7días. Expansión temporal06–24 restaurada07–24.
Publicación/withdrawn/republicación200 persistidas. Cierre0796c14d-c4e0-463b-a73f-14fd1d9ba423 creado y
retirado lógicamente200 desde Web, motivo obligatorio, fila histórica retenida y una
única auditoría; slots solapados desaparecieron y se recuperaron tras retirada (lecturas200).

Yape0050: dos configure200, instrucciones ficticias originales restauradas por SHA256,
tolerancia10 intacta y dos eventos configured conservados. No hubo recepción ni dinero real.
N1: una reserva NUEVA cashpendingS/30/30min, cliente ficticio existente y U3asignado,
cda64f3c-b27f-4501-84ee-5f1a8e5f5740,21/11 de17:15 a17:45 Lima. Web/HTTP201/SQL/agenda correctos.
N2 NO ejecutado: al consultar eran17:02Lima; elegible desde17:25 (inicio+tolerancia10).
Queda confirmed/confirmed/pending/cash. No esperar indefinidamente, crear sustituta,
adelantar reloj ni registrar inasistencia inválida. Conservar esta cita para la próxima
continuación autorizada, revalidando reloj/estado. No reejecutar las21 escrituras.

Lectura final independiente17:04Lima:42reservas/45detalles/29care/70care_events/
55reservation_events;9barberías/14usuarios/13perfiles/15membresías. Todas las filas previas
(incluidas las41reservas, pagos, atenciones, propietarios, membresías y datosB4) permanecen
por hash; deltas EXACTOS autorizados, cero filas de negocio inesperadas. Yape restaurado.
Esquema/historial18/.env.local intactos. Cinco sesiones propias cerradas204; cero nuevas
restantes. Sin correos, cuentas nuevas, pagos reales, Cloud, Android, migraciones ni Git writes.

Incidencias SOLO del verificador: navegación a botón oculto en createOnly; aviso de nombre
transitorio por remount; campo de catálogo incorrecto. Corregidas con regresiones, sin tocar
producto. Siete tests locales del verificador y sintaxis aprobados. No repetir suites de
B1–B5.1. Docker se apagó entre preflight e intento: antes de negocio, se detuvo sin Chrome.
Usuario abrió Docker y autorizó un único inicio de Edge LOCAL existente y Metro8081LOCAL;
no se reiniciaron servicios saludables ni se operaron otros contenedores. Se conservan arriba.

B5.2: comandos18 ejecutados, cierre integral retenido por evidencia negativa de catálogo.
B5.3: Yape y N1 acreditados; falta N2. B5 sigue ABIERTO. Matriz48:38VERIFICADA/
2SIN VALIDACIÓN INTEGRAL/4NO APLICA/3BLOQUEADA/1PARCIAL. No cerrar004/005 académicas
ni aceptación Android por este alcanceWeb. Evidencia E004/b523-funcional.json y .md,
con los22 comandos, IDs,HTTP y límites. SMTP administrativo, transferencia de propiedad,
visuales, Android y despliegue siguen separados. Detenerse al informe.

## Resultado por comando

| ID | Operación | HTTP | Resultado |
| --- | --- | --- | --- |
| A1 | create-barbershop | 201 | APROBADO |
| A2 | configure-shop | 200 | APROBADO |
| A3 | renameBarbershop via PATCH | 200 | APROBADO |
| C1 | upsert-service create | 200 | APROBADO |
| C2 | upsert-service edit | 200 | APROBADO |
| P1 | set-professional | 200 | APROBADO |
| P2 | set-capabilities | 200 | APROBADO |
| D1 | set-shop-hours initial | 200 | APROBADO |
| D2 | set-barber-hours initial | 200 | APROBADO |
| B1 | set-publication published | 200 | APROBADO |
| C3 | upsert-service inactive | 200 | APROBADO |
| C4 | upsert-service active | 200 | APROBADO |
| D3 | set-shop-hours temporary | 200 | APROBADO |
| D4 | set-shop-hours restore | 200 | APROBADO |
| D5 | set-exception | 200 | APROBADO |
| D6 | withdraw-shop-closure | 200 | APROBADO |
| B2 | set-publication withdrawn | 200 | EJECUTADO — TRANSICIÓN APROBADA, EVIDENCIA NEGATIVA PARCIAL |
| B3 | set-publication published | 200 | APROBADO |
| Y1 | care/configure temporary | 200 | APROBADO |
| Y2 | care/configure restore | 200 | APROBADO |
| N1 | confirm cash pending | 201 | APROBADO |
| N2 | care/no-show | — | NO EJECUTADO — BLOQUEO TEMPORAL |

[Detalle y evidencias completas](b523-funcional.json).
