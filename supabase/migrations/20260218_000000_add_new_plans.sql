
-- 1. Add metadata column to product_translations if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'product_translations' and column_name = 'metadata') then
    alter table public.product_translations add column metadata jsonb default '{}'::jsonb;
  end if;
end $$;

-- 2. Update view to include metadata
create or replace view public.products_active_localized as
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

-- 3. Deactivate old plans
update public.products set active = false where type = 'plan';

-- 4. Insert new plans
do $$
declare
  v_product_id uuid;
begin

  -- Plan 1: VIP individualus koučingas
  insert into public.products (type, active, price_cents)
  values ('plan', true, 49900)
  returning id into v_product_id;

  insert into public.product_translations (product_id, locale, name, description, metadata)
  values 
  (v_product_id, 'lt', 'VIP individualus koučingas', 'Maksimali transformacija per trumpiausią laiką.', 
  '{
     "subtitle": "VIP / Premium",
     "duration": "12 savaičių",
     "features": [
       "Parengta su dietologu",
       "Programos akcentai",
       "Kasdienė komunikacija– nuolatinis ryšys kiekviename žingsnyje",
       "Neribotos konsultacijos– greiti atsakymai viso proceso metu",
       "Technikos video analizė– korekcijos realiu laiku"
     ],
     "result": "Maksimali transformacija per trumpiausią laiką.",
     "tag": "Maksimalus dėmesys (12 savaičių)"
   }'),
  (v_product_id, 'en', 'VIP Coaching', 'Maximum transformation in the shortest time.', 
  '{
     "subtitle": "VIP / Premium",
     "duration": "12 weeks",
     "features": [
       "Prepared with a dietician",
       "Program highlights",
       "Daily communication – constant contact at every step",
       "Unlimited consultations – quick answers throughout the process",
       "Technical video analysis – real-time corrections"
     ],
     "result": "Maximum transformation in the shortest time.",
     "tag": "Maximum attention (12 weeks)"
   }');


  -- Plan 2: Svorio metimo programa
  insert into public.products (type, active, price_cents)
  values ('plan', true, 19900)
  returning id into v_product_id;

  insert into public.product_translations (product_id, locale, name, description, metadata)
  values 
  (v_product_id, 'lt', 'Svorio metimo programa', 'Svoris krenta tvariai ir užtikrintai.', 
  '{
     "tag": "Populiariausia",
     "duration": "8–12 savaičių",
     "features": [
       "Parengta su dietologu",
       "Programos akcentai",
       "Individualus sporto planas– pagal jūsų poreikius ir pajėgumą",
       "Aiškios mitybos gairės– be griežtų dietų",
       "Technikos korekcijos– saugesni ir efektyvesni pratimai"
     ],
     "result": "Svoris krenta tvariai ir užtikrintai."
   }'),
  (v_product_id, 'en', 'Weight Loss Program', 'Weight drops sustainably and surely.', 
  '{
     "tag": "Most Popular",
     "duration": "8–12 weeks",
     "features": [
       "Prepared with a dietician",
       "Program highlights",
       "Individual sports plan – according to your needs and capacity",
       "Clear nutritional guidelines – no strict diets",
       "Technical corrections – safer and more effective exercises"
     ],
     "result": "Weight drops sustainably and surely."
   }');


  -- Plan 3: Raumenų auginimo programa
  insert into public.products (type, active, price_cents)
  values ('plan', true, 19900)
  returning id into v_product_id;

  insert into public.product_translations (product_id, locale, name, description, metadata)
  values 
  (v_product_id, 'lt', 'Raumenų auginimo programa', 'Augini raumenis ir jėgą be spėliojimo.', 
  '{
     "duration": "8–12 savaičių",
     "features": [
       "Parengta su dietologu",
       "Programos akcentai",
       "Individualus sporto planas– progresijai ir hipertrofijai",
       "Mitybos gairės masei– kalorijų ir makro balansui",
       "Technikos korekcijos– tikslesniam raumenų aktyvavimui"
     ],
     "result": "Augini raumenis ir jėgą be spėliojimo."
   }'),
  (v_product_id, 'en', 'Muscle Building Program', 'Build muscle and strength without guessing.', 
  '{
     "duration": "8–12 weeks",
     "features": [
       "Prepared with a dietician",
       "Program highlights",
       "Individual sports plan – for progression and hypertrophy",
       "Nutrition guidelines for mass – for calorie and macro balance",
       "Technical corrections – for more precise muscle activation"
     ],
     "result": "Build muscle and strength without guessing."
   }');

  -- Plan 4: Namų treniruotės + Asmeninė priežiūra
  insert into public.products (type, active, price_cents)
  values ('plan', true, 29900)
  returning id into v_product_id;

  insert into public.product_translations (product_id, locale, name, description, metadata)
  values 
  (v_product_id, 'lt', 'Namų treniruotės + Asmeninė priežiūra', 'Namų treniruotės su profesionalia kasdiene priežiūra.', 
  '{
     "subtitle": "VIP / Premium",
     "tag": "Su nuolatine priežiūra (8 savaitės)",
     "duration": "8 savaitės",
     "features": [
       "Programos akcentai",
       "Individualus namų planas– pritaikytas jūsų sąlygoms",
       "Kasdienis trenerio ryšys– nuolatinė motyvacija ir kontrolė",
       "Video technikos analizė– aiškios korekcijos kiekvienam pratimui"
     ],
     "result": "Namų treniruotės su profesionalia kasdiene priežiūra."
   }'),
  (v_product_id, 'en', 'Home Workouts + Personal Supervision', 'Home workouts with professional daily supervision.', 
  '{
     "subtitle": "VIP / Premium",
     "tag": "With constant supervision (8 weeks)",
     "duration": "8 weeks",
     "features": [
       "Program highlights",
       "Individual home plan – adapted to your conditions",
       "Daily trainer connection – constant motivation and control",
       "Video technique analysis – clear corrections for every exercise"
     ],
     "result": "Home workouts with professional daily supervision."
   }');

  -- Plan 5: Namų treniruočių programa
  insert into public.products (type, active, price_cents)
  values ('plan', true, 14700)
  returning id into v_product_id;

  insert into public.product_translations (product_id, locale, name, description, metadata)
  values 
  (v_product_id, 'lt', 'Namų treniruočių programa', 'Stiprus kūnas ir aiški namų treniruočių sistema.', 
  '{
     "duration": "6–8 savaitės",
     "features": [
       "Programos akcentai",
       "Individualus namų planas– aiški sistema nuo A iki Z",
       "Pratimų video biblioteka– paprastas sekimas namuose",
       "Technikos įvedimas– saugus ir taisyklingas startas"
     ],
     "result": "Stiprus kūnas ir aiški namų treniruočių sistema."
   }'),
  (v_product_id, 'en', 'Home Workout Program', 'Strong body and clear home workout system.', 
  '{
     "duration": "6–8 weeks",
     "features": [
       "Program highlights",
       "Individual home plan – clear system from A to Z",
       "Exercise video library – simple tracking at home",
       "Technique introduction – safe and correct start"
     ],
     "result": "Strong body and clear home workout system."
   }');

   -- Plan 6: Mobilumo lavinimo programa
  insert into public.products (type, active, price_cents)
  values ('plan', true, 9700)
  returning id into v_product_id;

  insert into public.product_translations (product_id, locale, name, description, metadata)
  values 
  (v_product_id, 'lt', 'Mobilumo lavinimo programa', 'Daugiau laisvės judėti be įtampos.', 
  '{
     "tag": "Kasdienė mankšta (6–8 savaitės)",
     "duration": "6–8 savaitės",
     "features": [
       "Programos akcentai",
       "Mobilumo planas kasdienai– 10–30 min. pagal jūsų ritmą",
       "Judesio video seka– aišku, ką daryti ir kokia tvarka",
       "Laikysenos gerinimas– mažiau įtampos kasdienėje veikloje"
     ],
     "result": "Daugiau laisvės judėti be įtampos."
   }'),
  (v_product_id, 'en', 'Mobility Training Program', 'More freedom to move without tension.', 
  '{
     "tag": "Daily exercise (6–8 weeks)",
     "duration": "6–8 weeks",
     "features": [
       "Program highlights",
       "Mobility plan for daily life – 10–30 min. according to your rhythm",
       "Movement video sequence – clear what to do and in what order",
       "Posture improvement – less tension in daily activities"
     ],
     "result": "More freedom to move without tension."
   }');

end $$;

-- Update the view to include metadata if it's not already dynamic (views usually need dropping and recreating if schema changes, but if it does select * it might be fine, but let's check view definition)
-- The view is likely 'products_active_localized'. Adding a column to table usually propagates to 'select *' view but let's be safe.
-- Actually, I need to check the view definition.
