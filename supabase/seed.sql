-- Local development data only (applied by `supabase db reset`). Not real wishes or people.
insert into public.givers (name, email, sort_order) values
  ('Test Mor',  'mor@example.com',  1),
  ('Test Adam', 'adam@example.com', 2);

insert into public.wishes (title, url, price_amount, currency, note, category, priority) values
  ('Gæringsspand 30 L', 'https://example.com/spand', 249, 'DKK', 'Med tappehane', 'bryg', 1),
  ('Sejlerhandsker', '', 399, 'DKK', 'Str. L', 'baad', 1),
  ('En god krimi', '', null, null, 'Overrask mig', 'boeger', 2),
  ('Støbejernspande', 'https://example.com/pande', 59.95, 'EUR', '', 'koekken', 3);
insert into public.wishes (title, category, priority, suggested) values ('Forslag: USB-lader', 'gadget', 2, true);
