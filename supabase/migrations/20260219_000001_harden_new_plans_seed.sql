begin;

-- Ensure metadata exists for richer plan content.
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'product_translations'
      and column_name = 'metadata'
  ) then
    alter table public.product_translations
      add column metadata jsonb not null default '{}'::jsonb;
  end if;
end $$;

-- Ensure target products exist with stable IDs and canonical prices.
insert into public.products (id, type, active, price_cents, currency)
values
  ('55555555-5555-5555-5555-555555555555'::uuid, 'plan', true, 49900, 'EUR'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'plan', true, 19900, 'EUR'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'plan', true, 19900, 'EUR'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'plan', true, 29900, 'EUR'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'plan', true, 14700, 'EUR'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'plan', true,  9700, 'EUR')
on conflict (id) do update
set
  type = excluded.type,
  active = excluded.active,
  price_cents = excluded.price_cents,
  currency = excluded.currency;

-- Keep only the canonical plan set active (non-destructive: no deletions).
update public.products
set active = false
where type = 'plan'
  and id not in (
    '55555555-5555-5555-5555-555555555555'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid
  );

-- Upsert localized content + UI metadata for each plan.
insert into public.product_translations (product_id, locale, name, description, metadata)
values
  (
    '55555555-5555-5555-5555-555555555555'::uuid,
    'lt',
    'VIP individualus koučingas',
    'Maksimali transformacija per trumpiausią laiką.',
    jsonb_build_object(
      'subtitle', 'VIP / Premium',
      'tag', 'Maksimalus dėmesys (12 savaičių)',
      'duration', '12 savaičių',
      'sort_order', 10,
      'features', jsonb_build_array(
        'Parengta su dietologu',
        'Kasdienė komunikacija– nuolatinis ryšys kiekviename žingsnyje',
        'Neribotos konsultacijos– greiti atsakymai viso proceso metu',
        'Technikos video analizė– korekcijos realiu laiku'
      ),
      'result', 'Maksimali transformacija per trumpiausią laiką.'
    )
  ),
  (
    '55555555-5555-5555-5555-555555555555'::uuid,
    'en',
    'VIP individual coaching',
    'Maximum transformation in the shortest time.',
    jsonb_build_object(
      'subtitle', 'VIP / Premium',
      'tag', 'Maximum focus (12 weeks)',
      'duration', '12 weeks',
      'sort_order', 10,
      'features', jsonb_build_array(
        'Prepared with a dietician',
        'Daily communication – constant contact at every step',
        'Unlimited consultations – quick responses throughout the process',
        'Technique video analysis – real-time corrections'
      ),
      'result', 'Maximum transformation in the shortest time.'
    )
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'lt',
    'Svorio metimo programa',
    'Svoris krenta tvariai ir užtikrintai.',
    jsonb_build_object(
      'tag', 'Populiariausia',
      'duration', '8–12 savaičių',
      'sort_order', 20,
      'features', jsonb_build_array(
        'Parengta su dietologu',
        'Individualus sporto planas– pagal jūsų poreikius ir pajėgumą',
        'Aiškios mitybos gairės– be griežtų dietų',
        'Technikos korekcijos– saugesni ir efektyvesni pratimai'
      ),
      'result', 'Svoris krenta tvariai ir užtikrintai.'
    )
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'en',
    'Weight loss program',
    'Weight drops sustainably and steadily.',
    jsonb_build_object(
      'tag', 'Most popular',
      'duration', '8–12 weeks',
      'sort_order', 20,
      'features', jsonb_build_array(
        'Prepared with a dietician',
        'Individual training plan tailored to your needs and capacity',
        'Clear nutrition guidelines without strict dieting',
        'Technique corrections for safer and more effective exercises'
      ),
      'result', 'Weight drops sustainably and steadily.'
    )
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'lt',
    'Raumenų auginimo programa',
    'Augini raumenis ir jėgą be spėliojimo.',
    jsonb_build_object(
      'duration', '8–12 savaičių',
      'sort_order', 30,
      'features', jsonb_build_array(
        'Parengta su dietologu',
        'Individualus sporto planas– progresijai ir hipertrofijai',
        'Mitybos gairės masei– kalorijų ir makro balansui',
        'Technikos korekcijos– tikslesniam raumenų aktyvavimui'
      ),
      'result', 'Augini raumenis ir jėgą be spėliojimo.'
    )
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'en',
    'Muscle building program',
    'Build muscle and strength without guesswork.',
    jsonb_build_object(
      'duration', '8–12 weeks',
      'sort_order', 30,
      'features', jsonb_build_array(
        'Prepared with a dietician',
        'Individual training plan for progression and hypertrophy',
        'Nutrition guidance for mass gain with calorie and macro balance',
        'Technique corrections for more precise muscle activation'
      ),
      'result', 'Build muscle and strength without guesswork.'
    )
  ),
  (
    '66666666-6666-6666-6666-666666666666'::uuid,
    'lt',
    'Namų treniruotės + Asmeninė priežiūra',
    'Namų treniruotės su profesionalia kasdiene priežiūra.',
    jsonb_build_object(
      'subtitle', 'VIP / Premium',
      'tag', 'Su nuolatine priežiūra (8 savaitės)',
      'duration', '8 savaitės',
      'sort_order', 40,
      'features', jsonb_build_array(
        'Individualus namų planas– pritaikytas jūsų sąlygoms',
        'Kasdienis trenerio ryšys– nuolatinė motyvacija ir kontrolė',
        'Video technikos analizė– aiškios korekcijos kiekvienam pratimui'
      ),
      'result', 'Namų treniruotės su profesionalia kasdiene priežiūra.'
    )
  ),
  (
    '66666666-6666-6666-6666-666666666666'::uuid,
    'en',
    'Home workouts + personal supervision',
    'Home workouts with professional daily supervision.',
    jsonb_build_object(
      'subtitle', 'VIP / Premium',
      'tag', 'With constant supervision (8 weeks)',
      'duration', '8 weeks',
      'sort_order', 40,
      'features', jsonb_build_array(
        'Individual home plan tailored to your setup',
        'Daily coach communication for constant motivation and control',
        'Video technique analysis with clear corrections for every exercise'
      ),
      'result', 'Home workouts with professional daily supervision.'
    )
  ),
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'lt',
    'Namų treniruočių programa',
    'Stiprus kūnas ir aiški namų treniruočių sistema.',
    jsonb_build_object(
      'duration', '6–8 savaitės',
      'sort_order', 50,
      'features', jsonb_build_array(
        'Individualus namų planas– aiški sistema nuo A iki Z',
        'Pratimų video biblioteka– paprastas sekimas namuose',
        'Technikos įvedimas– saugus ir taisyklingas startas'
      ),
      'result', 'Stiprus kūnas ir aiški namų treniruočių sistema.'
    )
  ),
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'en',
    'Home workout program',
    'Strong body and a clear home workout system.',
    jsonb_build_object(
      'duration', '6–8 weeks',
      'sort_order', 50,
      'features', jsonb_build_array(
        'Individual home plan with a clear A-to-Z system',
        'Exercise video library for simple at-home follow-through',
        'Technique onboarding for a safe and proper start'
      ),
      'result', 'Strong body and a clear home workout system.'
    )
  ),
  (
    '44444444-4444-4444-4444-444444444444'::uuid,
    'lt',
    'Mobilumo lavinimo programa',
    'Daugiau laisvės judėti be įtampos.',
    jsonb_build_object(
      'tag', 'Kasdienė mankšta (6–8 savaitės)',
      'duration', '6–8 savaitės',
      'sort_order', 60,
      'features', jsonb_build_array(
        'Mobilumo planas kasdienai– 10–30 min. pagal jūsų ritmą',
        'Judesio video seka– aišku, ką daryti ir kokia tvarka',
        'Laikysenos gerinimas– mažiau įtampos kasdienėje veikloje'
      ),
      'result', 'Daugiau laisvės judėti be įtampos.'
    )
  ),
  (
    '44444444-4444-4444-4444-444444444444'::uuid,
    'en',
    'Mobility development program',
    'More freedom to move without tension.',
    jsonb_build_object(
      'tag', 'Daily mobility (6–8 weeks)',
      'duration', '6–8 weeks',
      'sort_order', 60,
      'features', jsonb_build_array(
        'Daily mobility plan: 10–30 minutes based on your rhythm',
        'Movement video sequence with clear order of actions',
        'Posture improvement for less daily tension'
      ),
      'result', 'More freedom to move without tension.'
    )
  )
on conflict (product_id, locale) do update
set
  name = excluded.name,
  description = excluded.description,
  metadata = excluded.metadata;

-- Include metadata in the public view and keep security invoker behavior.
create or replace view public.products_active_localized
with (security_invoker=true) as
select
  p.id as product_id,
  p.type,
  p.price_cents,
  p.currency,
  p.created_at,
  pt.locale,
  pt.name,
  pt.description,
  pt.metadata
from public.products p
join public.product_translations pt on pt.product_id = p.id
where p.active = true;

commit;
