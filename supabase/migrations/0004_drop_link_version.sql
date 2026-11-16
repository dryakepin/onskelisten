-- Personal links are gone: givers sign in with Google only.
alter table public.givers drop column if exists link_version;
