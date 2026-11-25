-- Disposable DB only. Minimal Auth SQL contract, NOT a GoTrue session test.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create schema private;
create schema extensions;
create table auth.users(id uuid primary key,email text,is_anonymous boolean default false,email_confirmed_at timestamptz,banned_until timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb); $$;
grant usage on schema auth to authenticated,anon,service_role;
grant execute on function auth.uid(),auth.jwt() to authenticated,anon,service_role;
