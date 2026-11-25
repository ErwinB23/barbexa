import fs from 'node:fs';
import ts from 'typescript';
const config = ts.readConfigFile(
  'tsconfig.server-core.json',
  ts.sys.readFile,
).config;
const parsed = ts.parseJsonConfigFileContent(config, ts.sys, '.');
const program = ts.createProgram(parsed.fileNames, parsed.options),
  checker = program.getTypeChecker();
const sources = program.getSourceFiles();
function exported(suffix, name) {
  const file = sources.find((f) =>
    f.fileName.replaceAll('\\', '/').endsWith(suffix),
  );
  if (!file) throw Error(suffix);
  const symbol = checker
    .getExportsOfModule(checker.getSymbolAtLocation(file))
    .find((s) => s.name === name);
  if (!symbol) throw Error(name);
  return checker.getDeclaredTypeOfSymbol(symbol);
}
function shape(type, depth = 0) {
  if (depth > 12) return {};
  const F = ts.TypeFlags;
  if (type.flags & (F.Any | F.Unknown)) return {};
  if (type.flags & F.StringLike)
    return {
      type: 'string',
      ...(type.isStringLiteral() ? { enum: [type.value] } : {}),
    };
  if (type.flags & F.NumberLike)
    return {
      type: 'number',
      ...(type.isNumberLiteral() ? { enum: [type.value] } : {}),
    };
  if (type.flags & F.BooleanLike)
    return {
      type: 'boolean',
      ...(type.flags & F.BooleanLiteral
        ? { enum: [type.intrinsicName === 'true'] }
        : {}),
    };
  if (type.isUnion()) {
    const present = type.types.filter(
      (t) => !(t.flags & (F.Undefined | F.Null)),
    );
    const nullable = type.types.some((t) => t.flags & F.Null);
    let out;
    if (present.every((t) => t.flags & F.BooleanLike))
      out = { type: 'boolean' };
    else if (present.every((t) => t.isStringLiteral()))
      out = { type: 'string', enum: present.map((t) => t.value) };
    else if (present.length === 1) out = shape(present[0], depth + 1);
    else out = { oneOf: present.map((t) => shape(t, depth + 1)) };
    return {
      ...out,
      ...(nullable
        ? { nullable: true, ...(out.enum ? { enum: [...out.enum, null] } : {}) }
        : {}),
    };
  }
  if (type.isIntersection() && type.types.some((t) => t.flags & F.StringLike))
    return { type: 'string' };
  if (checker.isArrayType(type) || type.getSymbol()?.name === 'ReadonlyArray')
    return {
      type: 'array',
      items: shape(checker.getTypeArguments(type)[0], depth + 1),
    };
  const properties = {},
    required = [];
  for (const prop of type.getProperties()) {
    const decl = prop.valueDeclaration ?? prop.declarations?.[0];
    properties[prop.name] = shape(
      checker.getTypeOfSymbolAtLocation(prop, decl),
      depth + 1,
    );
    if (!(prop.flags & ts.SymbolFlags.Optional)) required.push(prop.name);
  }
  if (!Object.keys(properties).length)
    return { type: 'object', additionalProperties: true };
  return {
    type: 'object',
    properties,
    ...(required.length ? { required } : {}),
    additionalProperties: false,
  };
}
const S = {},
  ref = (name) => ({ $ref: '#/components/schemas/' + name });
const named = (name, suffix, symbol = name) => {
  S[name] = shape(exported(suffix, symbol));
  return ref(name);
};
for (const n of ['Profile', 'ProfileInput', 'CreatedBarbershop', 'Membership'])
  named(n, 'tenant-foundation/domain/types.ts');
for (const n of [
  'Service',
  'Professional',
  'Hours',
  'ShopSetup',
  'StaffInvitation',
  'BookingCatalog',
])
  named(n, 'barbershop-operation/domain/types.ts');
for (const n of [
  'BookingDetail',
  'AvailableSlot',
  'ReservationInput',
  'CancellationInput',
])
  named(n, 'reservations/domain/types.ts');
for (const n of [
  'RescheduleInput',
  'RescheduleQuery',
  'ReschedulePolicy',
  'RescheduleEvent',
])
  named(n, 'reservations/domain/reschedule.ts');
named('CareView', 'reservations/domain/care.ts');
named(
  'ProfessionalProfile',
  'barbershop-operation/domain/professional-profile.ts',
);
S.ProfileInput.required = ['displayName'];
named('AdminInvitation', 'barbershop-operation/domain/admin-invitations.ts');
named('ShopClosure', 'barbershop-operation/domain/shop-closure.ts');
named('OwnProfessionalSummary', 'barbershop-operation/domain/own-summary.ts');
const obj = (properties, required = Object.keys(properties)) => ({
  type: 'object',
  properties,
  ...(required.length ? { required } : {}),
  additionalProperties: false,
});
const str = { type: 'string' },
  uuid = { type: 'string', format: 'uuid' },
  integer = (minimum = 0, maximum) => ({
    type: 'integer',
    minimum,
    ...(maximum !== undefined ? { maximum } : {}),
  });
const nul = (s) => ({ ...s, nullable: true });
const action = (a, s) => ({
  ...s,
  properties: { action: { type: 'string', enum: [a] }, ...s.properties },
  required: ['action', ...(s.required ?? [])],
});
function refine(schema, key = '') {
  if (!schema || typeof schema !== 'object') return;
  if (schema.type === 'number')
    Object.assign(schema, {
      type: 'integer',
      ...(/Version|version|durationMin|bookingHorizonDays|maxFuturePerClient|slotStepMin/.test(
        key,
      )
        ? { minimum: 1 }
        : { minimum: 0 }),
    });
  if (schema.type === 'string') {
    if (/(?:Id|_id)$/.test(key) || key === 'id' || key === 'requestId')
      schema.format = 'uuid';
    if (/At$/.test(key) && key !== 'memberSince') schema.format = 'date-time';
    if (key === 'localDate') schema.pattern = '^\\d{4}-\\d{2}-\\d{2}$';
  }
  if (schema.properties)
    for (const [k, v] of Object.entries(schema.properties)) refine(v, k);
  if (schema.items) refine(schema.items, key);
  if (schema.oneOf) for (const v of schema.oneOf) refine(v, key);
}
const permissions = (a) =>
  /administrator|ownership|secondary|admin-invitation|team-authority/.test(a)
    ? 'Capacidad contextual según el comando: propietario para administrar equipo/administradores; destinatario para responder invitaciones o rechazar transferencia. read-team-authority consulta capacidades del propio actor; no concede permisos. SQL revalida cupos, versión e identidad.'
    : /own-|professional-profile/.test(a)
      ? 'Profesional propio activo de la barbería seleccionada, también si administra y atiende.'
      : /invitation|existing-user|publication/.test(a)
        ? 'Propietario para gestionar equipo/publicación; destinatario exacto para aceptar/rechazar invitación.'
        : 'Administrador contextual con capacidad operativa; el servidor revalida actor, membresía, recurso y tenant.';
const type = exported(
  'barbershop-operation/application/operation.ts',
  'OperationCommand',
);
const opVariants = [];
for (const t of type.types) {
  const base = shape(t),
    a = base.properties.action;
  for (const value of a.enum) {
    if (value === 'accept-ownership-transfer') continue;
    const name = 'Operation_' + value.replaceAll('-', '_');
    S[name] = {
      ...base,
      properties: {
        ...base.properties,
        action: { type: 'string', enum: [value] },
      },
      description: permissions(value),
    };
    opVariants.push(name);
  }
}
S.OperationCommand = {
  oneOf: opVariants.map(ref),
  discriminator: {
    propertyName: 'action',
    mapping: Object.fromEntries(
      opVariants.map((n) => [
        S[n].properties.action.enum[0],
        '#/components/schemas/' + n,
      ]),
    ),
  },
  description:
    'Comandos reales; aceptar definitivamente transferencia de propiedad permanece bloqueado y no se anuncia como funcionalidad disponible.',
};
const reservationVariants = [];
for (const [a, name] of [
  ['confirm', 'ReservationInput'],
  ['cancel', 'CancellationInput'],
  ['reschedule', 'RescheduleInput'],
  ['reschedule-slots', 'RescheduleQuery'],
]) {
  const n = 'Reservation_' + a.replaceAll('-', '_');
  S[n] = action(a, structuredClone(S[name]));
  reservationVariants.push(n);
}
S.Reservation_policy_read = action(
  'reschedule-policy',
  obj({ barbershopId: uuid }),
);
S.Reservation_policy_write = action(
  'reschedule-policy',
  obj({ barbershopId: uuid, advanceMin: integer() }),
);
S.Reservation_history = action(
  'reschedule-history',
  obj({ reservationId: uuid }),
);
reservationVariants.push(
  'Reservation_policy_read',
  'Reservation_policy_write',
  'Reservation_history',
);
const careVariants = [];
for (const command of [
  'read',
  'settings',
  'payment-options',
  'configure',
  'start',
  'complete',
  'no-show',
  'receive',
  'refund',
  'report-yape',
]) {
  const read = ['read', 'settings', 'payment-options'].includes(command),
    shop = ['settings', 'payment-options', 'configure'].includes(command);
  const props = {
    command: { type: 'string', enum: [command] },
    [shop ? 'barbershopId' : 'reservationId']: uuid,
  };
  if (!read) props.requestId = uuid;
  if (command === 'configure')
    Object.assign(props, {
      noShowToleranceMin: integer(0, 1440),
      yapeInstructions: nul({ type: 'string', minLength: 1, maxLength: 2000 }),
    });
  if (['receive', 'refund'].includes(command))
    props.attested = { type: 'boolean', enum: [true] };
  if (command === 'refund')
    props.reason = { type: 'string', minLength: 1, maxLength: 2000 };
  if (command === 'report-yape')
    props.securityCode = { type: 'string', pattern: '^[0-9]{3}$' };
  const n = 'Care_' + command.replaceAll('-', '_');
  S[n] = action('care', obj(props));
  careVariants.push(n);
}
S.CareCommand = {
  oneOf: careVariants.map(ref),
  discriminator: {
    propertyName: 'command',
    mapping: Object.fromEntries(
      careVariants.map((n) => [
        S[n].properties.command.enum[0],
        '#/components/schemas/' + n,
      ]),
    ),
  },
  description:
    'Atención solo profesional asignado activo; recepción manual por asignado/administrador autorizado; reembolso por propietario. Reportar Yape: solo cliente propietario, no confirma recepción.',
};
S.ReservationCommand = {
  oneOf: [...reservationVariants.map(ref), ref('CareCommand')],
  description:
    'action selecciona confirm/cancel/reschedule/reschedule-slots/reschedule-policy/reschedule-history/care; command discrimina care. Política puede consultarse o editarse según presencia de advanceMin.',
};
S.EdgeError = obj({ error: obj({ code: str, message: str }), requestId: uuid });
S.PostgrestError = {
  type: 'object',
  properties: { code: str, message: str, details: nul(str), hint: nul(str) },
  required: ['code', 'message'],
  additionalProperties: true,
};
S.CreateBarbershop = obj({
  name: { type: 'string', minLength: 1, description: 'No vacío tras trim.' },
});
for (const s of Object.values(S)) refine(s);
S.CareSettings = obj({
  barbershopId: uuid,
  noShowToleranceMin: integer(0, 1440),
  yapeInstructions: nul(str),
});
S.PaymentOptions = obj({
  cash: { type: 'boolean', enum: [true] },
  yape: { type: 'boolean' },
});
S.BookingCatalog.additionalProperties = true; // SQL adds public metadata beyond the domain projection.
S.StaffInvitation.additionalProperties = true; // Wire projection can include barbershopName.
S.Operation_upsert_service.properties.archived = {
  type: 'boolean',
  enum: [true],
  description:
    'Solo para archivar: requiere id existente y active=false; el servidor valida esa relación.',
};
S.Operation_upsert_service.properties.name.minLength = 1;
S.Operation_invite_administrator.properties.email.maxLength = 254;
S.BookingDetail.properties.items.minItems = 1;
S.BookingDetail.properties.items.maxItems = 100;
for (const name of ['ReservationInput', 'Reservation_confirm']) {
  S[name].properties.serviceIds.minItems = 1;
  S[name].properties.serviceIds.uniqueItems = true;
}
for (const name of ['RescheduleInput', 'Reservation_reschedule'])
  S[name].properties.reason.maxLength = 2000;
function hourBounds(s) {
  if (s?.properties?.weekday)
    Object.assign(s.properties.weekday, { minimum: 0, maximum: 6 });
  if (s?.properties?.opensMin)
    Object.assign(s.properties.opensMin, { minimum: 0, maximum: 1439 });
  if (s?.properties?.closesMin)
    Object.assign(s.properties.closesMin, { minimum: 1, maximum: 1440 });
  if (s?.properties) Object.values(s.properties).forEach(hourBounds);
  if (s?.items) hourBounds(s.items);
}
Object.values(S).forEach(hourBounds);
const content = (s) => ({ 'application/json': { schema: s } });
const response = (description, s) => ({ description, content: content(s) });
const errors = (kind) =>
  Object.fromEntries(
    (kind === 'foundation'
      ? [400, 401, 403, 405, 409, 413, 500, 503]
      : kind === 'operation'
        ? [400, 401, 403, 404, 405, 409, 413, 500, 503]
        : [400, 401, 403, 404, 405, 409, 413, 503]
    ).map((code) => [
      code,
      response(
        {
          400: 'INVALID_INPUT',
          401: 'UNAUTHENTICATED',
          403: 'FORBIDDEN / Origin no admitido',
          404: 'NOT_AVAILABLE',
          405: 'METHOD_NOT_ALLOWED',
          409: 'CONFLICT / PROFILE_REQUIRED',
          413: 'PAYLOAD_TOO_LARGE (>8192 bytes)',
          500: 'INTERNAL_ERROR',
          503: 'DEPENDENCY_UNAVAILABLE',
        }[code],
        ref('EdgeError'),
      ),
    ]),
  );
const paths = {};
function post(
  route,
  id,
  tag,
  body,
  result,
  description,
  status = '200',
  kind = 'operation',
) {
  paths[route] = {
    post: {
      operationId: id,
      tags: [tag],
      summary: description.split('.')[0],
      description,
      requestBody: { required: true, content: content(body) },
      responses: {
        [status]: response(
          'Resultado JSON. Ejemplos sintéticos, no datos obtenidos de Cloud.',
          result,
        ),
        ...errors(kind),
      },
    },
  };
}
post(
  '/functions/v1/ensure-profile',
  'ensureProfile',
  'Edge / Cuenta',
  ref('ProfileInput'),
  ref('Profile'),
  'Crea o conserva el perfil propio del actor Auth verificado. No acepta identidad o rol del cliente.',
  '200',
  'foundation',
);
post(
  '/functions/v1/create-barbershop',
  'createBarbershop',
  'Edge / Barbería',
  ref('CreateBarbershop'),
  ref('CreatedBarbershop'),
  'Creación atómica de barbería, membresía administrativa y propiedad del creador; exige perfil propio.',
  '201',
  'foundation',
);
post(
  '/functions/v1/barbershop-operation',
  'barbershopOperation',
  'Edge / Operación',
  ref('OperationCommand'),
  {
    description:
      'Resultado específico del comando; consulte x-command-results. El handler retorna el recurso/RPC o {ok:true} cuando no hay valor.',
  },
  'Una única ruta POST con unión discriminada por action. No hay rutas separadas por comando. Las capacidades definitivas las valida PostgreSQL.',
);
paths['/functions/v1/barbershop-operation'].post['x-command-results'] = {
  'upsert-service': ref('Service'),
  'set-professional': ref('Professional'),
  'get-own-professional': ref('Professional'),
  'update-own-professional': ref('Professional'),
  'get-own-professional-profile': {
    description:
      'ProfessionalProfile, incluidos descripción/redes y fecha nullable.',
  },
  'read-team-authority': {
    description:
      'Authority con revision, userId, barbershopId, capacity, version, secondaryCount y permisos; sin conceder roles globales.',
  },
};
post(
  '/functions/v1/reservation-command',
  'reservationCommand',
  'Edge / Reservas',
  ref('ReservationCommand'),
  {
    description:
      'BookingDetail para confirm/cancel/reschedule; array AvailableSlot para reschedule-slots; ReschedulePolicy para política; array RescheduleEvent para historial; CareView para acciones de cita care. settings/configure/payment-options devuelven configuración de atención y Yape.',
  },
  'Reservas atómicas con identidad, precios, políticas y disponibilidad revalidados. action=confirm o reschedule:201 nueva ejecución,200 replay del mismo requestId. cancel:200. care:200. Efectivo/Yape requieren confirmación manual.',
  '200',
  'reservation',
);
paths['/functions/v1/reservation-command'].post.responses['201'] = response(
  'Confirmación/reprogramación nueva; mismo BookingDetail que200 replay, no envoltorio detail/replayed.',
  ref('BookingDetail'),
);
const rpcErrors = {
  400: response('Error de parámetros SQL/PostgREST.', ref('PostgrestError')),
  401: response('Sesión ausente o inválida.', ref('PostgrestError')),
  403: response('Permiso insuficiente.', ref('PostgrestError')),
  404: response('Recurso no disponible o RPC ausente.', ref('PostgrestError')),
};
function rpc(name, props, result, description, required = Object.keys(props)) {
  post(
    '/rest/v1/rpc/' + name,
    'rpc_' + name,
    'PostgREST / RPC',
    obj(props, required),
    result,
    description,
  );
  paths['/rest/v1/rpc/' + name].post.responses = {
    200: response('Proyección JSON del RPC.', result),
    ...rpcErrors,
  };
  paths['/rest/v1/rpc/' + name].post['x-api-layer'] = 'managed-postgrest';
}
const array = (items) => ({ type: 'array', items });
rpc(
  'list_booking_barbershops',
  { p_cursor: nul(uuid), p_name: { type: 'string', maxLength: 200 } },
  array({ type: 'object', additionalProperties: true }),
  'Exploración autenticada: nombre, contacto, dirección y publicación; paginación por cursor.',
);
rpc(
  'get_booking_catalog',
  { p_barbershop_id: uuid },
  ref('BookingCatalog'),
  'Catálogo vigente público para usuario autenticado; no autoriza una confirmación.',
);
rpc(
  'list_booking_slots',
  {
    p_barbershop_id: uuid,
    p_local_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    p_service_ids: {
      type: 'array',
      items: uuid,
      minItems: 1,
      uniqueItems: true,
    },
    p_barber_id: nul(uuid),
  },
  array(ref('AvailableSlot')),
  'Disponibilidad según fecha America/Lima, duración, horarios, bloqueos y cierres; puede quedar obsoleta antes de confirmar.',
);
rpc(
  'list_booking_agenda',
  {
    p_barbershop_id: uuid,
    p_local_date: str,
    p_barber_id: nul(uuid),
    p_state: nul({ type: 'string', enum: ['confirmed', 'cancelled'] }),
  },
  { ...array(ref('BookingDetail')), maxItems: 200 },
  'Agenda del establecimiento: administrador contextual o profesional asignado vigente; RLS/SQL no concede acceso por el filtro.',
);
for (const name of [
  'list_shop_staff_invitations',
  'list_barbershop_memberships',
])
  rpc(
    name,
    { p_barbershop_id: uuid },
    array(
      name === 'list_barbershop_memberships'
        ? ref('Membership')
        : ref('StaffInvitation'),
    ),
    'Solo propietario autorizado puede obtener equipo/datos del establecimiento. Las proyecciones se validan en cliente.',
  );
rpc(
  'list_own_staff_invitations',
  {},
  array(ref('StaffInvitation')),
  'Invitaciones del destinatario autenticado, sin conceder membresía antes de aceptar.',
);
rpc(
  'remind_professional_invitation',
  { p_shop_id: uuid, p_invitation_id: uuid },
  obj({ created: { type: 'boolean' } }),
  'Solo propietario con gestión de equipo; invitación profesional pendiente y cooldown60s, aviso in-app, no correo.',
);
S.Notice = obj({
  id: uuid,
  title: str,
  message: str,
  target: { type: 'string', enum: ['/staff', '/my-reservations', '/agenda'] },
  createdAt: { type: 'string', format: 'date-time' },
  readAt: nul({ type: 'string', format: 'date-time' }),
});
rpc(
  'list_my_notifications',
  {},
  obj({
    items: { ...array(ref('Notice')), maxItems: 50 },
    unread: integer(),
    canRemove: { type: 'boolean' },
  }),
  'Últimos50 avisos visibles propios y total no leído. Identidad JWT y membresía/asignación actuales.',
);
rpc(
  'read_my_notification',
  { p_id: uuid },
  obj({ read: { type: 'boolean', enum: [true] } }),
  'Marcar un aviso propio leído; operación idempotente, conserva reserva/invitación.',
);
rpc(
  'delete_my_notification',
  { p_id: uuid },
  obj({ deleted: { type: 'boolean', enum: [true] } }),
  'Tombstone de un aviso propio, idempotente, sin borrar eventos ni recursos de negocio.',
);
const query = (name, description, required = false, schema = str) => ({
  in: 'query',
  name,
  required,
  description,
  schema,
});
for (const table of [
  'profiles',
  'barbershops',
  'barbershop_memberships',
  'services',
  'barber_profiles',
  'barbershop_hours',
  'barber_schedules',
  'barbershop_booking_settings',
  'barber_services',
  'reservations',
]) {
  const route = '/rest/v1/' + table;
  paths[route] = {
    get: {
      operationId: 'select_' + table,
      tags: ['PostgREST / Tablas'],
      summary: 'Consulta ' + table + ' sujeta a RLS',
      description:
        table === 'reservations'
          ? 'Reservas propias: filtro client_user_id=eq.<actor>, order=starts_at.desc,id.desc, limit50; select incluye reservation_items históricos. SQL conserva snapshots de precio/políticas.'
          : 'Proyección snake_case administrada por PostgREST. El adaptador selecciona columnas; actor/tenant siguen sujetos a RLS.',
      parameters: [
        query(
          'select',
          'Proyección de columnas PostgREST; * cuando el adaptador lo utiliza.',
        ),
        query('id', 'Filtro eq.<uuid>, cuando corresponde.'),
        query('barbershop_id', 'Filtro eq.<uuid> para recursos del tenant.'),
        query('user_id', 'Filtro eq.<uuid> propio en membresías.'),
        query('limit', 'Límite solicitado; no modifica permisos.', false, {
          type: 'integer',
          minimum: 1,
        }),
        query('order', 'Orden PostgREST.'),
        ...(table === 'reservations'
          ? [query('client_user_id', 'Filtro eq.<identidad verificada>.')]
          : []),
      ],
      responses: {
        200: response(
          'Array de filas, nombres snake_case y columnas seleccionadas; vacío puede deberse a RLS.',
          array({ type: 'object', additionalProperties: true }),
        ),
        ...rpcErrors,
      },
      'x-api-layer': 'managed-postgrest',
    },
  };
}
for (const [table, body] of [
  [
    'profiles',
    obj(
      { display_name: { type: 'string', minLength: 1 }, phone: nul(str) },
      [],
    ),
  ],
  ['barbershops', obj({ name: { type: 'string', minLength: 1 } })],
]) {
  paths['/rest/v1/' + table].patch = {
    operationId: 'update_' + table,
    tags: ['PostgREST / Tablas'],
    summary: 'Actualizar ' + table + ' bajo RLS',
    description:
      table === 'profiles'
        ? 'Solo perfil propio; enviar al menos un campo. Identidad se obtiene del JWT.'
        : 'Renombrar barbería seleccionada; no crear otra. Administrador operacional autorizado.',
    parameters: [
      query('id', 'eq.<uuid> del recurso.', true),
      query('select', 'Proyección de retorno.'),
      {
        in: 'header',
        name: 'Prefer',
        schema: { type: 'string', enum: ['return=representation'] },
        description: 'El adaptador solicita representación actualizada.',
      },
    ],
    requestBody: { required: true, content: content(body) },
    responses: {
      200: response(
        'Array con filas actualizadas, solicitado por Prefer.',
        array({ type: 'object', additionalProperties: true }),
      ),
      ...rpcErrors,
    },
  };
}
paths['/auth/v1/user'] = {
  get: {
    operationId: 'managedAuthUser',
    tags: ['Supabase Auth'],
    summary: 'Identidad verificada por Supabase Auth',
    description:
      'Servicio administrado, no Edge propia. Lo consumen los adaptadores para verificar la identidad. Login, registro, PKCE, renovación y recovery pertenecen al SDK Supabase; no se reinventan aquí como endpoints propios.',
    responses: {
      200: response(
        'Objeto Auth con id e is_anonymous y otros metadatos administrados.',
        {
          type: 'object',
          properties: { id: uuid, is_anonymous: { type: 'boolean' } },
          additionalProperties: true,
        },
      ),
      401: response(
        'Respuesta administrada por Auth; no utiliza el sobre de errores Edge.',
        { type: 'object', additionalProperties: true },
      ),
      403: response('Respuesta administrada por Auth.', {
        type: 'object',
        additionalProperties: true,
      }),
    },
    externalDocs: { url: 'https://supabase.com/docs/guides/auth' },
  },
};
const id = '11111111-1111-4111-8111-111111111111',
  id2 = '22222222-2222-4222-8222-222222222222',
  date = '2026-11-27T15:00:00.000Z';
const samples = {
  confirm: {
    action: 'confirm',
    requestId: id,
    barbershopId: id,
    serviceIds: [id2],
    barberId: null,
    startsAt: date,
    paymentMethod: 'yape',
  },
  cancel: { action: 'cancel', requestId: id, reservationId: id2 },
  reschedule: {
    action: 'reschedule',
    requestId: id,
    reservationId: id2,
    expectedStartsAt: date,
    startsAt: '2026-11-28T15:00:00.000Z',
  },
  start: {
    action: 'care',
    command: 'start',
    reservationId: id2,
    requestId: id,
  },
  reportYape: {
    action: 'care',
    command: 'report-yape',
    reservationId: id2,
    requestId: id,
    securityCode: '007',
  },
  receive: {
    action: 'care',
    command: 'receive',
    reservationId: id2,
    requestId: id,
    attested: true,
  },
};
paths['/functions/v1/reservation-command'].post.requestBody.content[
  'application/json'
].examples = Object.fromEntries(
  Object.entries(samples).map(([k, value]) => [
    k,
    { summary: 'Ejemplo sintético, no ejecutado', value },
  ]),
);
paths['/functions/v1/create-barbershop'].post.requestBody.content[
  'application/json'
].example = { name: 'Barbería de demostración' };
paths['/functions/v1/ensure-profile'].post.requestBody.content[
  'application/json'
].example = { displayName: 'Cliente de demostración', phone: null };
paths['/functions/v1/barbershop-operation'].post.requestBody.content[
  'application/json'
].examples = {
  service: {
    value: {
      action: 'upsert-service',
      barbershopId: id,
      name: 'Corte de demostración',
      description: 'Ejemplo',
      price: { amountMinor: 1500, currency: 'PEN' },
      durationMin: 30,
      active: true,
      category: 'Corte de cabello',
    },
  },
  invitation: {
    value: {
      action: 'invite-existing-user',
      barbershopId: id,
      email: 'fixture@example.invalid',
    },
  },
  adminInvitation: {
    value: {
      action: 'invite-administrator',
      barbershopId: id,
      requestId: id2,
      email: 'fixture@example.invalid',
    },
  },
};
paths['/rest/v1/rpc/get_booking_catalog'].post.requestBody.content[
  'application/json'
].example = { p_barbershop_id: id };
paths['/rest/v1/rpc/list_booking_slots'].post.requestBody.content[
  'application/json'
].example = {
  p_barbershop_id: id,
  p_local_date: '2026-11-27',
  p_service_ids: [id2],
  p_barber_id: null,
};
paths['/rest/v1/rpc/list_my_notifications'].post.responses[200].content[
  'application/json'
].example = { items: [], unread: 0, canRemove: true };

// Synthetic wire responses: never read application sessions or Cloud data.
const policy = {
  minimumNoticeMin: 0,
  bookingHorizonDays: 30,
  maxFuturePerClient: 12,
  slotStepMin: 15,
  bufferMin: 0,
  cancellationAdvanceMin: 120,
};
const service = {
  id: id2,
  barbershopId: id,
  name: 'Corte de demostración',
  description: 'Ejemplo',
  price: { amountMinor: 1500, currency: 'PEN' },
  durationMin: 30,
  active: true,
  category: 'Corte de cabello',
};
const booking = {
  id: id2,
  barbershopId: id,
  barberId: id2,
  state: 'confirmed',
  startsAt: date,
  endsAt: '2026-11-27T15:30:00.000Z',
  durationMin: 30,
  shopNameSnapshot: 'Barbería de demostración',
  barberNameSnapshot: 'Profesional de demostración',
  clientDisplayNameSnapshot: 'Cliente de demostración',
  items: [
    {
      serviceId: id2,
      nameSnapshot: service.name,
      descriptionSnapshot: 'Ejemplo',
      durationMin: 30,
      priceSnapshot: service.price,
    },
  ],
  total: service.price,
  policySnapshot: policy,
};
const care = {
  reservationId: id2,
  attendance: 'in-service',
  payment: {
    method: 'yape',
    status: 'pending',
    amountMinor: 1500,
    currency: 'PEN',
  },
  noShowToleranceMin: 10,
  yapeInstructions:
    'Yapea al número 900000000 a nombre de Cuenta de demostración.',
  events: [],
  permissions: { attend: true, receive: true, refund: false },
  canReportYape: false,
  yapeReport: null,
};
const examples = (route, status, values) => {
  paths[route].post.responses[status].content['application/json'].examples =
    Object.fromEntries(
      Object.entries(values).map(([name, value]) => [
        name,
        {
          summary: 'Respuesta ilustrativa sintética; no ejecución Cloud',
          value,
        },
      ]),
    );
};
examples('/functions/v1/ensure-profile', 200, {
  profile: { userId: id, displayName: 'Cliente de demostración', phone: null },
});
examples('/functions/v1/create-barbershop', 201, {
  created: {
    barbershop: { id, name: 'Barbería de demostración' },
    membership: {
      id: id2,
      userId: id,
      barbershopId: id,
      role: 'administrator',
      status: 'active',
    },
  },
});
const operationResults =
  paths['/functions/v1/barbershop-operation'].post['x-command-results'];
for (const cmd of [
  'invite-administrator',
  'respond-admin-invitation',
  'cancel-admin-invitation',
  'retry-admin-invitation-email',
])
  operationResults[cmd] = ref('AdminInvitation');
operationResults['list-admin-invitations'] = array(ref('AdminInvitation'));
operationResults['list-shop-closures'] = array(ref('ShopClosure'));
operationResults['own-professional-summary'] = ref('OwnProfessionalSummary');
for (const cmd of [
  'get-own-professional-profile',
  'update-own-professional-profile',
])
  operationResults[cmd] = ref('ProfessionalProfile');
for (const cmd of [
  'invite-existing-user',
  'accept-invitation',
  'reject-invitation',
  'cancel-invitation',
])
  operationResults[cmd] = ref('StaffInvitation');
for (const cmd of [
  'configure-shop',
  'set-publication',
  'set-capabilities',
  'set-shop-hours',
  'set-barber-hours',
  'set-exception',
])
  operationResults[cmd] = obj({ ok: { type: 'boolean', enum: [true] } });
paths['/functions/v1/barbershop-operation'].post.responses[200].content[
  'application/json'
].schema = {
  anyOf: [
    ref('Service'),
    ref('Professional'),
    ref('ProfessionalProfile'),
    ref('StaffInvitation'),
    ref('AdminInvitation'),
    ref('OwnProfessionalSummary'),
    array(ref('AdminInvitation')),
    array(ref('ShopClosure')),
    { type: 'object', additionalProperties: true },
  ],
  description:
    'El resultado varía por action. x-command-results describe las proyecciones tipadas; las extensiones devuelven su DTO JSON sin envoltorio común.',
};
examples('/functions/v1/barbershop-operation', 200, {
  service,
  invitation: { id: id2, barbershopId: id, role: 'barber', status: 'pending' },
  configuration: { ok: true },
});
paths['/functions/v1/reservation-command'].post.responses[200].content[
  'application/json'
].schema = {
  anyOf: [
    ref('BookingDetail'),
    { type: 'array', items: ref('AvailableSlot') },
    ref('ReschedulePolicy'),
    { type: 'array', items: ref('RescheduleEvent') },
    ref('CareView'),
    ref('CareSettings'),
    ref('PaymentOptions'),
  ],
};
examples('/functions/v1/reservation-command', 201, {
  confirmed: booking,
  rescheduled: {
    ...booking,
    startsAt: '2026-11-28T15:00:00.000Z',
    endsAt: '2026-11-28T15:30:00.000Z',
  },
});
examples('/functions/v1/reservation-command', 200, {
  cancelled: { ...booking, state: 'cancelled' },
  started: care,
  yapeReported: {
    ...care,
    attendance: 'confirmed',
    permissions: { attend: false, receive: false, refund: false },
    canReportYape: true,
    yapeReport: { securityCode: '007', submittedAt: date },
  },
  paymentReceived: { ...care, payment: { ...care.payment, status: 'paid' } },
  settings: {
    barbershopId: id,
    noShowToleranceMin: 10,
    yapeInstructions: null,
  },
  paymentOptions: { cash: true, yape: false },
});
examples('/rest/v1/rpc/get_booking_catalog', 200, {
  catalog: {
    barbershopId: id,
    name: 'Barbería de demostración',
    publicationState: 'published',
    publicContact: '900000000',
    address: 'Dirección de demostración',
    policies: policy,
    services: [service],
    professionals: [
      {
        id: id2,
        barbershopId: id,
        professionalName: 'Profesional de demostración',
        active: true,
      },
    ],
    capabilities: [{ barberId: id2, serviceId: id2 }],
  },
});
examples('/rest/v1/rpc/list_booking_slots', 200, {
  slots: [
    {
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      estimatedTotal: booking.total,
    },
  ],
});
for (const [route, item] of Object.entries(paths)) {
  if (!route.startsWith('/functions/')) continue;
  for (const [status, result] of Object.entries(item.post.responses)) {
    if (Number(status) < 400) continue;
    const code = {
      400: 'INVALID_INPUT',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_AVAILABLE',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      413: 'PAYLOAD_TOO_LARGE',
      500: 'INTERNAL_ERROR',
      503: 'DEPENDENCY_UNAVAILABLE',
    }[status];
    result.content['application/json'].example = {
      error: { code, message: code },
      requestId: id,
    };
  }
}

// SQL wire projections are distinct from the camelCase domain DTOs.
S.ProfileRow = obj({ id: uuid, display_name: str, phone: nul(str) });
S.BarbershopRow = obj({ id: uuid, name: str });
S.MembershipRow = obj({
  id: uuid,
  user_id: uuid,
  barbershop_id: uuid,
  role: { type: 'string', enum: ['barber', 'administrator'] },
  status: { type: 'string', enum: ['active', 'inactive'] },
});
S.ServiceRow = {
  ...obj(
    {
      id: uuid,
      barbershop_id: uuid,
      name: str,
      description: str,
      price_amount: { type: 'number', minimum: 0 },
      duration_min: integer(1),
      active: { type: 'boolean' },
      category: S.Service.properties.category,
      archived: { type: 'boolean' },
    },
    [
      'id',
      'barbershop_id',
      'name',
      'description',
      'price_amount',
      'duration_min',
      'active',
    ],
  ),
  additionalProperties: true,
};
S.ProfessionalRow = obj({
  id: uuid,
  barbershop_id: uuid,
  user_id: uuid,
  professional_name: str,
  active: { type: 'boolean' },
});
const sqlHours = {
  weekday: integer(0, 6),
  opens_min: integer(0, 1439),
  closes_min: integer(1, 1440),
};
S.ShopHoursRow = obj(sqlHours);
S.BarberHoursRow = obj({ barber_id: uuid, ...sqlHours });
S.CapabilityRow = obj({
  barber_id: uuid,
  service_id: uuid,
  active: { type: 'boolean' },
});
S.BookingSettingsRow = obj({
  barbershop_id: uuid,
  publication_state: {
    type: 'string',
    enum: ['draft', 'published', 'paused', 'withdrawn'],
  },
  public_contact: nul(str),
  address: nul(str),
  ...Object.fromEntries(
    [
      'minimum_notice_min',
      'booking_horizon_days',
      'max_future_per_client',
      'slot_step_min',
      'buffer_min',
      'cancellation_advance_min',
    ].map((n) => [n, nul(integer())]),
  ),
});
S.ReservationRow = obj({
  id: uuid,
  barbershop_id: uuid,
  client_user_id: uuid,
  barber_id: uuid,
  state: { type: 'string', enum: ['confirmed', 'cancelled'] },
  starts_at: { type: 'string', format: 'date-time' },
  ends_at: { type: 'string', format: 'date-time' },
  duration_min: integer(1),
  total_amount: { type: 'number', minimum: 0 },
  shop_name_snapshot: str,
  barber_name_snapshot: str,
  client_display_name_snapshot: str,
  policy_snapshot: structuredClone(S.BookingDetail.properties.policySnapshot),
  reservation_items: array(
    obj({
      service_id: uuid,
      name_snapshot: str,
      description_snapshot: str,
      price_snapshot: { type: 'number', minimum: 0 },
      duration_min: integer(1),
    }),
  ),
});
for (const [table, schema] of Object.entries({
  profiles: 'ProfileRow',
  barbershops: 'BarbershopRow',
  barbershop_memberships: 'MembershipRow',
  services: 'ServiceRow',
  barber_profiles: 'ProfessionalRow',
  barbershop_hours: 'ShopHoursRow',
  barber_schedules: 'BarberHoursRow',
  barber_services: 'CapabilityRow',
  barbershop_booking_settings: 'BookingSettingsRow',
  reservations: 'ReservationRow',
})) {
  const route = paths['/rest/v1/' + table];
  for (const op of Object.values(route))
    op.responses[200].content['application/json'].schema = array(ref(schema));
}
paths['/rest/v1/rpc/list_barbershop_memberships'].post.responses[200].content[
  'application/json'
].schema = array(ref('MembershipRow'));
const shopList = paths['/rest/v1/rpc/list_booking_barbershops'].post;
shopList.responses[200].content['application/json'].schema = {
  ...array(
    obj({
      barbershopId: uuid,
      name: str,
      publicationState: { type: 'string', enum: ['published', 'paused'] },
      publicContact: nul(str),
      address: nul(str),
    }),
  ),
  maxItems: 50,
};
delete shopList.requestBody.content['application/json'].schema.required;
shopList.requestBody.content[
  'application/json'
].schema.properties.p_cursor.default = null;
shopList.requestBody.content[
  'application/json'
].schema.properties.p_name.default = '';
for (const [name, required] of [
  ['list_booking_slots', ['p_barbershop_id', 'p_local_date', 'p_service_ids']],
  ['list_booking_agenda', ['p_barbershop_id', 'p_local_date']],
])
  paths['/rest/v1/rpc/' + name].post.requestBody.content[
    'application/json'
  ].schema.required = required;

// Keep direct-table parameters aligned with the actual adapter requests.
for (const [route, item] of Object.entries(paths)) {
  if (!route.startsWith('/rest/v1/') || route.includes('/rpc/')) continue;
  const table = route.split('/').at(-1);
  const keep =
    table === 'profiles' || table === 'barbershops'
      ? ['select', 'id']
      : table === 'barbershop_memberships'
        ? ['select', 'user_id']
        : table === 'reservations'
          ? ['select', 'id', 'client_user_id', 'order', 'limit']
          : ['select', 'barbershop_id', 'limit'];
  item.get.parameters = item.get.parameters.filter((p) =>
    keep.includes(p.name),
  );
  if (table === 'profiles')
    item.patch.requestBody.content['application/json'].schema.minProperties = 1;
}
for (const [route, item] of Object.entries(paths)) {
  if (!route.startsWith('/functions/')) continue;
  item.options = {
    operationId: 'options_' + route.split('/').at(-1).replaceAll('-', '_'),
    tags: item.post.tags,
    summary: 'Preflight CORS del handler',
    security: [],
    responses: {
      204: {
        description: 'Preflight admitido; no concede autorización de negocio.',
      },
      403: response('Origin no admitido.', ref('EdgeError')),
    },
  };
  for (const op of Object.values(item))
    for (const r of Object.values(op.responses))
      r.headers = {
        'X-Request-Id': {
          schema: { type: 'string', format: 'uuid' },
          description: 'Identificador generado por el handler.',
        },
        'Cache-Control': { schema: { type: 'string', enum: ['no-store'] } },
      };
}

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'BARBEXA — API REST',
    version: '0.1.0',
    description:
      'Contratos reales de cuatro Edge Functions, PostgREST y RPC consumidos por BARBEXA. JWT identifica al actor; permisos contextuales, tenant, estado y concurrencia se revalidan en servidor/PostgreSQL. Ejemplos exclusivamente sintéticos. Los RPC privados y puertos internos no son endpoints para el cliente. Documentación sin ejecución por defecto; no acredita despliegue/mediciones Cloud actuales.',
  },
  servers: [
    {
      url: 'http://127.0.0.1:54421',
      description:
        'LOCAL: requiere stack local previamente autorizado; Swagger no lo arranca.',
    },
    {
      url: 'https://vuoncrtkkkquvddunrxx.supabase.co',
      description:
        'Referencia Cloud existente; ejecución bloqueada en Swagger UI.',
    },
  ],
  tags: [
    'Edge / Cuenta',
    'Edge / Barbería',
    'Edge / Operación',
    'Edge / Reservas',
    'PostgREST / RPC',
    'PostgREST / Tablas',
    'Supabase Auth',
  ].map((name) => ({ name })),
  security: [{ bearerAuth: [], publicApiKey: [] }],
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Token de usuario no anónimo. Nunca introducir claves privilegiadas.',
      },
      publicApiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'apikey',
        description:
          'Clave pública del proyecto; no concede roles ni sustituye JWT.',
      },
    },
    schemas: S,
  },
  'x-source-contracts': [
    'supabase/functions/_shared/tenant-foundation',
    'supabase/functions/_shared/barbershop-operation/application/operation.ts',
    'supabase/functions/_shared/reservations/presentation/reservation-handler.ts',
    'src/features/*/infrastructure',
  ],
  'x-internal-boundary':
    'service-role-only RPCs y private.* son implementación interna, no API de cliente.',
};
fs.mkdirSync('docs/api', { recursive: true });
fs.writeFileSync('docs/api/openapi.json', JSON.stringify(spec, null, 2) + '\n');
console.log(
  'OpenAPI generado:',
  Object.keys(paths).length,
  'rutas;',
  opVariants.length,
  'variantes de operación;',
  reservationVariants.length + careVariants.length,
  'variantes de reserva/atención.',
);
