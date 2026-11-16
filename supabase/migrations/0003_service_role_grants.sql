-- New Supabase projects no longer grant table privileges automatically.
-- The server uses the service role for everything; anon and authenticated stay without any access.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
