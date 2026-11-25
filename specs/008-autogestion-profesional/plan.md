# Plan — 008

Reutilizar `barbershop-operation`: dos comandos cerrados get/update-own-professional;
puertos cliente/servidor y adaptadores existentes, composición explícita, panel en personal.
Backend preparado: dos RPC públicas SECURITY DEFINER solo service_role y una privada
INVOKER cerrada incluso a service_role. search_path vacío; identidad verificada en Edge
y pertenencia revalidada en PostgreSQL. Wrappers definer permiten llamar la privada sin
conceder su EXECUTE directo; nunca disponibles a anon/authenticated.
Sin tablas, RLS o migraciones históricas cambiadas. SQL activado mediante migración
aditiva; comandos conectados en barbershop-operation Cloud. Web aceptada; Android pendiente.

Locks: configuración tenant → membresía vigente → perfil propio; compatibles con004.
Nombre no modifica snapshots de reservas ni disponibilidad. Invalidar catálogo con comando
existente. Cliente protege respuesta propia/contexto y duplicados; backend autoriza.

Constitución2.0.0 conforme: núcleo independiente, multitenant, Web/Android obligatorios;
sin nuevas dependencias/diseño/operaciones externas. Habilitación de desarrollo mediante
capacidad pública explícita únicamente después del backend autorizado.

Validación: RED→GREEN dirigido en puertos, payload/actor, adaptadores y UI. SQL estructural
sin conexión; permisos/locks reales se acreditarán después de autorizar aplicación.
