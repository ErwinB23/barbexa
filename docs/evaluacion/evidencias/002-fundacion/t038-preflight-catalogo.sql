select pg_catalog.jsonb_build_object(
  'postgresVersion', pg_catalog.current_setting('server_version'),
  'transactionReadOnly', pg_catalog.current_setting('transaction_read_only'),
  'authUsersTableExists', pg_catalog.to_regclass('auth.users') is not null,
  'migrationLedgerExists', pg_catalog.to_regclass('supabase_migrations.schema_migrations') is not null,
  'privateSchemaExists', exists(select 1 from pg_catalog.pg_namespace where nspname='private'),
  'businessRelations', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('schema',n.nspname,'name',c.relname,'kind',c.relkind))
    from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname in ('profiles','barbershops','barbershop_memberships')), '[]'::jsonb),
  'publicRelations', coalesce((select pg_catalog.jsonb_agg(c.relname order by c.relname)
    from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('r','p','v','m','f','S')), '[]'::jsonb),
  'privateRelations', coalesce((select pg_catalog.jsonb_agg(c.relname order by c.relname)
    from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
    where n.nspname='private'), '[]'::jsonb),
  'conflictingFunctions', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('schema',n.nspname,'name',p.proname,'arguments',pg_catalog.pg_get_function_identity_arguments(p.oid)))
    from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
    where (n.nspname='private' or n.nspname='public' and p.proname in ('ensure_own_profile','create_own_barbershop','is_active_member','is_active_admin','list_barbershop_memberships'))), '[]'::jsonb),
  'requiredRoles', (select pg_catalog.jsonb_agg(rolname order by rolname) from pg_catalog.pg_roles where rolname in ('anon','authenticated','service_role'))
) as catalog;
