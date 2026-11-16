-- Givers can sign in with Google; they are matched on email, so emails are stored lower-case.
update public.givers set email = lower(email) where email <> lower(email);
alter table public.givers add constraint givers_email_lowercase check (email = lower(email));
