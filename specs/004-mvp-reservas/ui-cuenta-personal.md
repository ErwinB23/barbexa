# Mi cuenta y editor personal Web — 24/11/2026

**Corrección posterior vigente:** usuario requiere total exacto. Se sustituye «1 o más»
por AccountMembershipCount con la consulta listOwnMemberships existente, conectada como
puerto de solo lectura en el proveedor de composición. Deduplica barberías activas de
la cuenta; estados Consultando/error/reintento, descarte de resultados tardíos y fence
actor/generación. choosing/none conservan cálculo sin petición extra. Sin endpoints,
esquema o permisos nuevos; la limitación inicial descrita abajo queda resuelta.

Referencia e instrucciones adjuntas del usuario. Alcance exclusivo de presentación Web:
banner autenticado, editor52/resumen48, citas y accesos. No modificar Android, perfil
profesional, autenticación, backend, permisos, servicios o datos reales Cloud.

## Cambios

- account-profile-web.tsx/styles.ts: banner de cuenta, curvas CSS, avatar con borde
  dorado, título con línea de degradado y columnas responsive. Bloque izquierdo con
  encabezado de edición siempre visible; el editor existente determina consulta/edición.
  Resumen de confirmación, próximas citas y accesos se ordenan a la derecha.
- personal-profile-form.web.tsx: formulario Web semántico, nombre/teléfono autocomplete,
  hint de retirada, envío/cancelación, carga/error y estados disabled/foco. Exporta props
  y pequeños iconos locales. personal-profile-editor.tsx conserva todos sus estados,
  guardia pending, llamadas onSave, actualización tras éxito y cancelación local;
  únicamente delega a la vista Web cuando Platform=web. Android sigue la vista anterior.
- web-profile-access.web.tsx: subtítulo y flechas en invitaciones/crear barbería,
  mismos enlaces; no reincorpora espacio de trabajo ni altera menú/sidebar.
- Actualizar datos utiliza onSave personal existente, sin llamar al servicio profesional.
  Borrador/error conservados y guardado único bajo doble intento. Cancelar no escribe.

## Datos verificados y límite del contador

Identidad de sesión incluye emailConfirmed: se muestra «Correo confirmado», no un
estado «Activa» sin respaldo. Sin membresías se muestra «Sin barberías vinculadas».
Contexto choosing aporta lista: cuenta barberías distintas de membresías activas propias;
none=0. Contexto selected contiene únicamente la membresía seleccionada, sin lista
completa: muestra «1 o más» con nota explícita, NO un total1 inventado. Error/resolviendo
indica Por consultar. Obtener total exacto en selected requeriría ampliar la proyección
o consultar otro puerto; no se cambia autenticación ni se añaden consultas por esta UI.
Esta es una diferencia justificada respecto al contador exacto de la referencia.

## Validación

Resultado:32/32 pruebas dirigidas aprobadas, TypeScript cliente/núcleo, ESLint sin
advertencias, Prettier, grafo de arquitectura sin ciclos y diff --check aprobados.

Pruebas account-profile-web.test.mjs, profile-edit.test.mjs y workspace-navigation.test.mjs:
perfiles reales/escape de texto, sin/con contexto, conteos distintos/propios/activos,
confirmación, navegación, editar/cancelar, retiro teléfono, errores sin filtrar detalles,
guardia de guardado y descarte tras desmontaje. Harness traduce DOM de la nueva vista
para conservar escenarios de controlador; también verifica Android anterior.

Vista estática aislada con fixtures en Chrome nuevo, sin sesión de usuario y sin red
Cloud:1260/800/390px sin desbordamiento. Cuenta/teléfono de prueba solo en .artifacts,
nunca en aplicación. Primitivas de botones RN representadas en el artefacto; Outfit
de la aplicación usa fallback en captura aislada. No acredita E2E con cuenta real.
Logs/scripts/capturas ignorados .artifacts/account-premium-*.
Pendiente aprobación visual integrada; no guardar datos personales reales para probar.
Sin instalaciones, imágenes externas, SQL, migraciones, Edge, publicación ni Git writes.
