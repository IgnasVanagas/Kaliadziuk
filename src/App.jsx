import { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { addItem, loadCart, saveCart } from './state/cart';
import { getProductImageUrl } from './lib/productImages';
import { sendEvent } from './lib/tracking';

const fromUploads = (file) => new URL(`../uploads/${file}`, import.meta.url).pathname;

const heroImageDesktop = fromUploads('_optimized/IMG_0443-scaled-2560w.webp');
const heroImageDesktopAvif = fromUploads('_optimized/IMG_0443-scaled-2560w.avif');
const heroImageMobile = fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1485w.webp');
const heroImageMobileAvif = fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1485w.avif');
const heroImageSrcSetDesktopWebp = [
  `${fromUploads('_optimized/IMG_0443-scaled-640w.webp')} 640w`,
  `${fromUploads('_optimized/IMG_0443-scaled-768w.webp')} 768w`,
  `${fromUploads('_optimized/IMG_0443-scaled-960w.webp')} 960w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1024w.webp')} 1024w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1280w.webp')} 1280w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1440w.webp')} 1440w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1600w.webp')} 1600w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1920w.webp')} 1920w`,
  `${fromUploads('_optimized/IMG_0443-scaled-2560w.webp')} 2560w`,
].join(', ');
const heroImageSrcSetDesktopAvif = [
  `${fromUploads('_optimized/IMG_0443-scaled-640w.avif')} 640w`,
  `${fromUploads('_optimized/IMG_0443-scaled-768w.avif')} 768w`,
  `${fromUploads('_optimized/IMG_0443-scaled-960w.avif')} 960w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1024w.avif')} 1024w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1280w.avif')} 1280w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1440w.avif')} 1440w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1600w.avif')} 1600w`,
  `${fromUploads('_optimized/IMG_0443-scaled-1920w.avif')} 1920w`,
  `${fromUploads('_optimized/IMG_0443-scaled-2560w.avif')} 2560w`,
].join(', ');
const heroImageSrcSetMobileWebp = [
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-320w.webp')} 320w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-480w.webp')} 480w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-640w.webp')} 640w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-768w.webp')} 768w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-960w.webp')} 960w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1024w.webp')} 1024w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1280w.webp')} 1280w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1440w.webp')} 1440w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1485w.webp')} 1485w`,
].join(', ');
const heroImageSrcSetMobileAvif = [
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-320w.avif')} 320w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-480w.avif')} 480w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-640w.avif')} 640w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-768w.avif')} 768w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-960w.avif')} 960w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1024w.avif')} 1024w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1280w.avif')} 1280w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1440w.avif')} 1440w`,
  `${fromUploads('_optimized/IMG_0441-modified-scaled-e1750335226133-1485w.avif')} 1485w`,
].join(', ');
const successImage = fromUploads('grupine5.jpg');

const contactImage = fromUploads('_optimized/IMG_0469-scaled-2560w.webp');
const contactImageAvif = fromUploads('_optimized/IMG_0469-scaled-2560w.avif');
const contactImageSrcSetWebp = `${fromUploads('_optimized/IMG_0469-scaled-2560w.webp')} 2560w`;
const contactImageSrcSetAvif = `${fromUploads('_optimized/IMG_0469-scaled-2560w.avif')} 2560w`;

const heroStatsByLocale = {
  lt: [
    { label: 'Pasikeitę klientai', value: 1000, suffix: '+', delay: 100 },
    { label: 'Metų patirtis', value: 8, suffix: '', delay: 200 },
    { label: 'Klientų pasitenkinimas', value: 98, suffix: '%', delay: 300 },
  ],
  en: [
    { label: 'Client transformations', value: 1000, suffix: '+', delay: 100 },
    { label: 'Years of experience', value: 8, suffix: '', delay: 200 },
    { label: 'Client satisfaction', value: 98, suffix: '%', delay: 300 },
  ],
};

const Hero = ({ stats, backgroundDesktop, backgroundMobile, title, subtitle, ctaLabel, ctaLink, imageAlt }) => (
  <section id="hero" className="relative min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)] overflow-hidden text-white">
    <picture className="pointer-events-none absolute inset-0 z-0">
      {backgroundMobile ? (
        <>
          <source
            type="image/avif"
            media="(max-width: 768px)"
            srcSet={heroImageSrcSetMobileAvif}
            sizes="100vw"
          />
          <source
            type="image/webp"
            media="(max-width: 768px)"
            srcSet={heroImageSrcSetMobileWebp}
            sizes="100vw"
          />
        </>
      ) : null}
      <source type="image/avif" srcSet={heroImageSrcSetDesktopAvif} sizes="100vw" />
      <source type="image/webp" srcSet={heroImageSrcSetDesktopWebp} sizes="100vw" />
      <img
        src={backgroundDesktop}
        alt={imageAlt}
        className="h-full w-full object-cover"
        style={{ objectPosition: 'center 30%' }}
        loading="eager"
      />
    </picture>

    {/* Layered overlays for consistent text contrast - Mobile (Lighter) */}
    <div
      className="pointer-events-none absolute inset-0 z-10 md:hidden"
      aria-hidden="true"
      style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.2) 65%, rgba(0,0,0,0.12) 100%)' }}
    />
    <div
      className="pointer-events-none absolute inset-0 z-15 md:hidden"
      aria-hidden="true"
      style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%)' }}
    />

    {/* Layered overlays for consistent text contrast - Desktop (Original) */}
    <div
      className="pointer-events-none absolute inset-0 z-10 hidden md:block"
      aria-hidden="true"
      style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.15) 100%)' }}
    />
    <div
      className="pointer-events-none absolute inset-0 z-15 hidden md:block"
      aria-hidden="true"
      style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 60%)' }}
    />
  <div className="relative z-20 mx-auto flex min-h-full w-full max-w-7xl flex-col items-start px-6 pt-60 pb-20 sm:pt-72 sm:pb-24 lg:pt-80 lg:pb-28">
  <div className="max-w-4xl mx-auto text-center space-y-8" data-aos="fade-up">
        <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-base text-white/90 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
        <div className="flex w-full justify-center flex-col gap-4 sm:w-auto sm:flex-row">
          {!ctaLink || ctaLink.startsWith('#') ? (
            <a
              href={ctaLink || "#programos"}
              className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 text-xl font-extrabold text-black shadow-lg transition-transform duration-150 hover:-translate-y-1 sm:px-8 sm:py-4 sm:text-2xl"
            >
              {ctaLabel}
            </a>
          ) : (
            <Link
              to={ctaLink}
              className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 text-xl font-extrabold text-black shadow-lg transition-transform duration-150 hover:-translate-y-1 sm:px-8 sm:py-4 sm:text-2xl"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Stats — de-emphasized visually but visible for trust */}
  <div className="mt-20 w-full flex flex-col gap-4 text-sm sm:mt-28 sm:flex-row sm:gap-10 items-center justify-center" data-aos="fade-up" data-aos-delay="150">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="glass-card inline-flex flex-col items-center justify-center space-y-2 rounded-full px-5 py-5 sm:min-w-[220px] sm:px-6 text-center"
          >
            <p className="font-heading text-4xl font-extrabold text-accent">
              <AnimatedCounter to={stat.value} suffix={stat.suffix} delay={stat.delay} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/85">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PROGRAM_IDS = {
  weightLoss: '11111111-1111-1111-1111-111111111111',
  muscleGain: '22222222-2222-2222-2222-222222222222',
  homeTraining: '33333333-3333-3333-3333-333333333333',
  mobility: '44444444-4444-4444-4444-444444444444',
};

const programsLt = [
  {
    productId: '55555555-5555-5555-5555-555555555555', // VIP Plan (Stable ID)
    cartName: 'VIP individualus koučingas',
    unitPriceCents: 49900, // 499€
    title: 'VIP individualus koučingas',
    subtitle: 'Maksimalus dėmesys (12 savaičių)',
    description:
      'Aukščiausios kokybės programa su visiškai individualia priežiūra, kasdienu bendravimu ir giliausia analize. Tie, kas nori greičiausių ir užtikrintų rezultatų.',
    price: '499€', // Anchor Price
    duration: '12 savaičių',
    hasDietician: true,
    image: fromUploads('grupine1.jpg'), // Start with a placeholder or reuse one
    result: 'Maksimalūs rezultatai per trumpiausią laiką, pilna transformacija ir nuolatinis trenerio palaikymas.',
    highlights: [
      {
        title: 'Kasdienė komunikacija',
        detail: 'Nuolatinis ryšys ir priežiūra kiekviename žingsnyje.',
      },
      {
        title: 'Technikos analizė',
        detail: 'Vaizdo įrašų analizė ir technikos korekcijos realiu laiku.',
      },
      {
        title: 'Individualus mitybos planas',
        detail: 'Visiškai pritaikytas mitybos planas su receptais ir pirkinių sąrašais.',
      },
      {
        title: 'Psichologinis palaikymas',
        detail: 'Mentorystė ir motyvacija sunkiausiomis akimirkomis.',
      },
    ],
    extras: [
      'Viskas, kas įeina į standartines programas',
      'Kasdienė atskaitomybė ir palaikymas',
      'Neribotos konsultacijos',
      'Technikos vaizdo analizė',
      'Pirmenybė gaunant atsakymus',
    ],
    isPremium: true, // Marker for styling if needed
  },
  {
    productId: PROGRAM_IDS.weightLoss,
    cartName: 'Svorio metimo programa',
    unitPriceCents: 19900,
    title: 'Svorio metimo programa',
    subtitle: '8–12 savaičių',
    description:
      'Programa skirta tiems, kurie nori saugiai, tvariai ir be chaoso sumažinti svorį bei išsiugdyti sveikus įpročius.',
    price: '199€',
    // Removed duplicate anchor props
    duration: '8–12 savaičių',
    hasDietician: true,
    image: fromUploads('brokolis.jpg'),
    result: 'Rezultatai išliks ir po programos.',
    highlights: [
      {
        title: 'Individualus planas',
        detail: 'Sporto planas, sudarytas pagal Jūsų poreikius.',
      },
      {
        title: 'Aiškios mitybos gairės',
        detail: 'Supraskite bendrą kalorijų ir makroelementų balansą, be griežtų dietų.',
      },
      {
        title: 'Ilgalaikis požiūris',
        detail: 'Vertiname ne tik kilogramus, bet ir savijautą bei tvarius pokyčius.',
      },
      {
        title: 'Nuodugni analizė',
        detail: 'Nemokama konsultacija: tikslų, gyvenimo būdo ir galimybių įvertinimas.',
      },
    ],
    extras: [
      'Nemokama konsultacija (tikslų, gyvenimo būdo ir galimybių įvertinimas)',
      'Individualus sporto planas, sudarytas pagal Jūsų poreikius',
      'Aiškios mitybos gairės – supraskite bendrą kalorijų ir makroelementų balansą',
      '1 asmeninė treniruotė (technikos, pajėgumo ir silpnų vietų įvertinimui)',
      'Lojalumo bonusas: atnaujinimas po 8–12 sav. tik 50 €',
    ],
  },
  {
    productId: PROGRAM_IDS.muscleGain,
    cartName: 'Raumenų auginimo programa',
    unitPriceCents: 19900,
    title: 'Raumenų auginimo programa',
    subtitle: '8–12 savaičių',
    description:
      'Programa skirta tiems, kurie nori auginti liesą raumeninę masę, treniruotis protingai ir suprasti hipertrofiją per mokslo prizmę.',
    price: '199€',
    duration: '8–12 savaičių',
    hasDietician: true,
    image: fromUploads('paaugliu4.jpg'),
    result: 'Matomas raumenų augimas, didesnė jėga ir aiškus supratimas, kaip treniruotis ateityje be spėliojimo.',
    highlights: [
      {
        title: 'Liesa raumenų masė',
        detail: 'Auginti raumenis be nereikalingo riebalų priaugimo.',
      },
      {
        title: 'Mokslinis požiūris',
        detail: 'Suprasti, kaip veikia pratimai, apkrovos ir poilsis.',
      },
      {
        title: 'Hipertrofijos metodai',
        detail: 'Išbandyti moksliškai įrodytus hipertrofijos metodus.',
      },
      {
        title: 'Mitybos strategija',
        detail: 'Supraskite kalorijų perteklių ir makroelementų balansą raumenų augimui.',
      },
    ],
    extras: [
      'Nemokama konsultacija (tikslų, patirties ir pasirengimo įvertinimas)',
      'Individualus sporto planas pagal Jūsų poreikius',
      'Mitybos gairės raumenų augimui',
      '1 asmeninė treniruotė (technikos, apkrovų ir silpnų vietų įvertinimui)',
      'Skaitmeninis progreso dienoraštis',
      'Lojalumo bonusas: atnaujinimas tik 50 €',
    ],
  },
  {
    productId: '66666666-6666-6666-6666-666666666666', // Home Training Plus (Stable ID)
    cartName: 'Namų treniruotės su asmenine priežiūra',
    unitPriceCents: 29900, // 299€
    title: 'Namų treniruotės + Asmeninė priežiūra',
    subtitle: 'Su nuolatine priežiūra (8 savaitės)',
    description:
      'Tiems, kas nori sportuoti namuose, bet su griežta trenerio priežiūra, technikos taisymu ir nuolatiniu palaikymu.',
    price: '299€', // Anchor Price
    duration: '8 savaitės',
    image: fromUploads('grupine3.jpg'), // Reuse or placeholder
    result: 'Profesionali trenerio priežiūra namų sąlygomis – lyg sportuotumėte salėje su treneriu.',
    highlights: [
      {
        title: 'Vaizdo analizė',
        detail: 'Siunčiate pratimo atlikimo video, gaunate korekcijas.',
      },
      {
        title: 'Nuolatinis ryšys',
        detail: 'Galimybė klausti ir konsultuotis bet kuriuo metu.',
      },
      {
        title: 'Adaptacija',
        detail: 'Programos koregavimas pagal savijautą ir progresą.',
      },
    ],
    extras: [
      'Viskas, kas įeina į standartinę namų programą',
      'Video technikos analizė',
      'Nuolatinis bendravimas',
      'Programos adaptacija eigoje',
    ],
    isPremium: true,
  },
  {
    productId: PROGRAM_IDS.homeTraining,
    cartName: 'Namų treniruočių programa',
    unitPriceCents: 14700,
    title: 'Namų treniruočių programa',
    subtitle: '6–8 savaitės',
    description:
      'Programa skirta tiems, kurie nori treniruoti visą kūną namuose, sutaupyti laiką ir pasiekti tvirtą, atletišką kūną – be sporto salės.',
    price: '147€',
    duration: '6–8 savaitės',
    image: fromUploads('grupine8.jpg'),
    result: 'Stiprus, funkcionalus kūnas, geresnė savijauta ir aiškus planas, kaip treniruotis namuose be chaoso.',
    highlights: [
      {
        title: 'Jokio klubo',
        detail: 'Neturite laiko ar noro lankytis sporto salėje.',
      },
      {
        title: 'Be inventoriaus',
        detail: 'Suprasti, kaip apkrauti kūną be salės inventoriaus.',
      },
      {
        title: 'Aiški sistema',
        detail: 'Sistema „nuo A iki Z“',
      },
      {
        title: 'Dovana: Inventorius',
        detail: 'Sporto inventorius namų treniruotėms – pradėkite iš karto.',
      },
    ],
    extras: [
      'Nemokama konsultacija',
      'Individualus namų treniruočių planas',
      '1 asmeninė treniruotė technikos mokymui',
      'Vaizdo įrašai su visais pratimais',
      'Aiški treniruočių struktūra progresavimui',
      'Dovana: sporto inventorius namų treniruotėms',
    ],
  },
  {
    productId: PROGRAM_IDS.mobility,
    cartName: 'Mobilumo lavinimo programa',
    unitPriceCents: 9700,
    title: 'Mobilumo lavinimo programa',
    subtitle: 'Kasdienė mankšta (6–8 savaitės)',
    description:
      'Programa skirta tiems, kurie nori judėti laisviau, geriau jaustis kūne ir formuoti discipliną per kasdienį, sąmoningą judėjimą.',
    price: '97€',
    duration: '6–8 savaitės',
    image: fromUploads('testavimas8.jpg'),
    result: 'Mažiau įtampos, daugiau judėjimo laisvės, geresnė laikysena ir stipresnis ryšys su kūnu.',
    highlights: [
      {
        title: 'Ryto rutina',
        detail: 'Teisingai pradėti dieną ir paruošti kūną.',
      },
      {
        title: 'Kūno suvokimas',
        detail: 'Suvokti savo kūno struktūrą ir judesio kokybę.',
      },
      {
        title: 'Be įtampos',
        detail: 'Mažinti sustingimą, įtampą ar judesių ribotumą.',
      },
    ],
    extras: [
      'Konsultacija tikslų įvertinimui',
      'Individualus planas (10–30 min/d.)',
      'Vaizdo įrašai ir seka',
      'Struktūra „kas po ko“',
      'Gilinsimės į: mobilumą, stabilumą, savimasažą',
    ],
  },
];

const programsEn = [
  {
    productId: PROGRAM_IDS.weightLoss,
    cartName: 'Weight loss plan',
    unitPriceCents: 20000,
    title: 'Weight loss',
    subtitle: 'A lighter body and more energy',
    description:
      'An 8‑week plan combining nutrition structure, fat‑loss training blocks, and weekly support. We adjust steps, recovery, and intensity to keep progress steady and sustainable.',
    price: '200€',
    duration: '8 weeks',
    hasDietician: true,
    image: fromUploads('brokolis.jpg'),
    result: 'Sustainable results even after the program ends.',
    highlights: [
      {
        title: 'Personalized nutrition',
        detail: 'Macros and meal structure adapted to your schedule and preferences, with practical recipes.',
      },
      {
        title: 'Training phases',
        detail: 'Blocks rotate to keep stimulus high and reduce burnout.',
      },
      {
        title: 'Recovery & mindset',
        detail: 'Simple routines that help you stay consistent on stressful days.',
      },
    ],
    extras: ['Weekly progress check + adjustments', 'Recipe library + weekly shopping lists', 'Weekday support 9–18'],
  },
  {
    productId: PROGRAM_IDS.muscleGain,
    cartName: 'Muscle gain plan',
    unitPriceCents: 20000,
    title: 'Muscle gain',
    subtitle: 'More strength and visible shape',
    description:
      'A structured plan for functional strength and muscle growth. We progress loads in cycles and keep nutrition aligned with recovery and performance.',
    price: '200€',
    duration: '10 weeks',
    hasDietician: true,
    image: fromUploads('paaugliu4.jpg'),
    result: 'Visible muscle growth, increased strength, and a clear understanding of how to train in the future without guesswork.',
    highlights: [
      {
        title: 'Strength + hypertrophy blocks',
        detail: 'Periodized structure with clear progression and technique focus.',
      },
      {
        title: 'Nutrition for growth',
        detail: 'Gradual increases so you gain quality mass while feeling good.',
      },
      {
        title: 'Progress tracking',
        detail: 'Simple tracking so you see changes in strength and body composition.',
      },
    ],
    extras: ['Weekly load/progression adjustments', 'Supplement guidance (optional)', 'Mobility primer before sessions'],
  },
  {
    productId: PROGRAM_IDS.homeTraining,
    cartName: 'Home training plan',
    unitPriceCents: 15000,
    title: 'Home training',
    subtitle: 'Gym quality at home',
    description:
      'A complete program adapted to the equipment you have. Technique guidance and check‑ins make it feel like coaching is right next to you.',
    price: '150€',
    duration: '6 weeks',
    image: fromUploads('grupine8.jpg'),
    result: 'A strong, functional body, better well-being, and a clear plan for home training without chaos.',
    highlights: [
      {
        title: 'Adapted to your equipment',
        detail: 'Bands, dumbbells, kettlebell, or bodyweight — built around your real setup.',
      },
      {
        title: 'Form-check calls',
        detail: 'Quick video calls to correct technique and answer questions.',
      },
      {
        title: 'Recovery routines',
        detail: 'Daily mobility + weekend reset for your back and joints.',
      },
    ],
    extras: ['Reminders so you don’t miss sessions', 'Playlists by intensity', 'Community chat access'],
  },
  {
    productId: PROGRAM_IDS.mobility,
    cartName: 'Mobility training program',
    unitPriceCents: 10000,
    title: 'Mobility training',
    subtitle: 'Daily routine (6–8 weeks)',
    description:
      'A program for those who want to move more freely, feel better in their body and build discipline through daily, conscious movement.',
    price: '100€',
    duration: '6–8 weeks',
    image: fromUploads('testavimas8.jpg'),
    result: 'Less tension, more freedom of movement, better posture, and a stronger connection with your body.',
    highlights: [
      {
        title: 'Morning routine',
        detail: 'Start the day right and prepare your body.',
      },
      {
        title: 'Body awareness',
        detail: 'Understand your body structure and movement quality.',
      },
      {
        title: 'Without tension',
        detail: 'Reduce stiffness, tension, or movement limitations.',
      },
      {
        title: 'Biomechanics',
        detail: 'Dive into biomechanical nuances for effective movement.',
      },
    ],
    extras: [
      'Consultation for goals and needs assessment',
      'Individual mobility plan (10–30 min per day)',
      'Videos with all exercises',
      'Structure "what follows what" – no need to improvise',
      'Self-massage and relaxation',
    ],
  },
];

const programsByLocale = {
  lt: programsLt,
  en: programsEn,
};

const storiesLt = [
  {
    name: 'Ingrida Brazytė-Česevičienė',
    avatar: fromUploads('_optimized/atsiliepimai/470469671_9420998764591504_1367316031802033160_n-e1743524043787-320w.webp'),
    quote:
      '“Pavelas – profesionalus, atidus, nuoširdus treneris ir puikus motyvatorius! Lankausi jau daugiau nei tris mėnesius, ir dar nė viena treniruotė nebuvo tokia pati. Treniruotės pralekia greitai ir nenuobodžiai! Svarbiausia – po kiekvienos treniruotės jaučiu, kad turiu raumenukus, tačiau niekada nebuvo taip, kad dėl stipraus skausmo neišlipčiau iš lovos.”',
  },
  {
    name: 'Dovydas Sem',
    avatar: fromUploads('_optimized/atsiliepimai/485767155_2433248600372198_5450357866485351546_n-e1743523994763-320w.webp'),
    quote:
      '“Sportuoju pas Pavelą jau antrus metus ir tikrai nesiruošiu sustoti! Drįsčiau teigti, kad treniruotės su juo – geriausias mano pasirinkimas. Jis gali jaunimui padėti susikurti itin tvirtą pagrindą sporte, supažindinti su įvairiais pratimais ir jų veikimo principais bei skatinti sveiką gyvenseną. Su šiuo treneriu niekada nebūna nuobodu – pratimų įvairovė ir nuolatinis bendravimas tiesiog kviečia į salę!”',
  },
  {
    name: 'Artūras Kozlov',
    avatar: fromUploads('_optimized/atsiliepimai/394284740_6710013242385928_5528573044851569625_n-320w.webp'),
    quote:
      '“Atsakingas, kvalifikuotas ir savo darbą mylintis treneris. Matosi, kad kiekvienai treniruotei kruopščiai pasiruošia – parenka tinkamą krūvį ir ateina su būtent tau pritaikytu treniruotės planu, o ne „copy-paste“ schema visiems. Pratimai įvairūs ir įdomūs, nėra monotonijos – visada išmoksti kažką naujo. Kas labai svarbu – Pavelas yra be galo dėmesingas: visos treniruotės metu stebi techniką, paaiškina kiekvieno pratimo paskirtį ir naudą. Jokio broko tikrai nepraleis!”',
  },
  {
    name: 'Julia Gatsko',
    avatar: fromUploads('_optimized/atsiliepimai/Picture1 (1)-320w.webp'),
    quote:
      '“Pasha išsiskiria profesionalumu ir moksliniu požiūriu – jis atsižvelgia į tavo sveikatą ir kūno būklę, padeda ne tik atrodyti sportiškai, bet ir jaustis geriau. Su juo treniruojuosi beveik metus ir matau didelius pokyčius tiek fizinėje formoje, tiek savijautoje. Labai rekomenduoju!”',
  },
  {
    name: 'Justė Perveneckaitė',
    avatar: fromUploads('_optimized/atsiliepimai/Picture2-1-277w.webp'),
    quote:
      '“Esu sportininkė, kuri anksčiau susidūrė su įvairiais raumenų disbalansais, tačiau trenerio sudaryta individuali programa padėjo juos išspręsti ir sustiprėti. Ypač vertinu jo pagalbą atsistatymo procese bei traumų prevencijoje, kas man labai svarbu siekiant ilgalaikių rezultatų. Treneris itin malonus, dėmesingas ir visada nuoširdžiai atsako į visus rūpimus klausimus.”',
  },
  {
    name: 'Edvard Korovacki',
    avatar: fromUploads('_optimized/atsiliepimai/Picture3 (1)-320w.webp'),
    quote:
      '“Pavelas – išskirtinis treneris, įvertinantis asmeninius poreikius, motyvuojantis ir suteikiantis aiškų grįžtamąjį ryšį. Jo žinios apima ne tik pratimus, bet ir mitybą bei atsistatymą, todėl rezultatai – realūs. Treniruotės visada pilnos pozityvios energijos, o su juo jautiesi laukiamas ir įkvėptas kiekvieną kartą.”',
  },
  {
    name: 'Greta Valasinavičiūtė',
    avatar: fromUploads('_optimized/atsiliepimai/373064400_6180419855414750_1227222582074733444_n-320w.webp'),
    quote:
      '“Pavelas – nuostabus treneris, o kiekviena treniruotė pas jį – motyvacijos, energijos ir žinių šaltinis. Su nekantrumu laukiu kiekvienos treniruotės! Profesionalumas garantuotas – rekomenduoju!”',
  },
  {
    name: 'Tadas Kibirkštis',
    avatar: fromUploads('_optimized/atsiliepimai/367460586_6616155658420913_6885742354305016905_n-320w.webp'),
    quote:
      '“Pavelas – tikras savo srities profesionalas. Įsigilina į situaciją, atidžiai parenka pratimus pagal būklę ir savijautą, o rezultatas jaučiasi iškart. Jis – žmogus, mylintis savo darbą ir atsiduodantis jam 100 %. Ačiū Jam ir tikrai rekomenduoju kitiems!”',
  },
  {
    name: 'Ūlė Julija Masteikaitė',
    avatar: fromUploads('_optimized/atsiliepimai/Screenshot-2025-03-19-at-5.40.07 PM-320w.webp'),
    quote:
      '“Pavelas yra the absolute best 🫶 Susidūrus su nugaros skausmo problema, padėjo ją spręsti bei pasiūlė daug prevencinių pratimų. Viską aiškina suuuuper detaliai - ne tik kaip atlikti pratimą, bet taip pat ir kokie raumenys dirba bei visapusę pratimo naudą. Po treniruotės lieki ne tik pasportavęs, bet ir sužinojęs daug dalykų apie savo kūną, laikyseną, mobilumą.”',
  },
  {
    name: 'Roma Šablinskienė',
    avatar: fromUploads('_optimized/atsiliepimai/459630769_10230433925305293_4458957318428687233_n-320w.webp'),
    quote:
      '“Kaip visišką nedraugystę su sportu paversti meile sportui? Lengva – tereikia Pavelo pagalbos! Labai atsargiai, ilgai dairydamasi iš tolo ieškojau, kas man padėtų prisijaukinti šį „žvėrį“. Įvairūs bandymai grupinėse treniruotėse būdavo trumpalaikiai, todėl beveik buvau nurašiusi sportą kaip „ne mano arkliuką“. Tačiau jau po pirmos treniruotės supratau, kad su Pavelu – tobula chemija! Jis tikras profesionalas, nenaudojantis vienos schemos visiems. Respektas!”',
  },
  {
    name: 'Evelina Jurčiukonytė',
    avatar: fromUploads('_optimized/atsiliepimai/302925805_5629860167034966_3216542933912186510_n-320w.webp'),
    quote:
      '“Vienas geriausių sprendimų – treniruotis pas Pavelą! Jis puikiai išmano savo darbą, įsiklauso į kliento poreikius bei norus, yra labai atsakingas, mylintis savo profesiją ir tiksliai žinantis, ką daro. Treniruotės praskrieja akimirksniu!”',
  },
  {
    name: 'Anna Levkovich',
    avatar: fromUploads('_optimized/atsiliepimai/image00001 (2)-320w.webp'),
    quote:
      '“Sportuoju pas Pavelą jau virš trejų metų ir tai geriausia, kas nutiko mano savijautai. Per šį laiką dingo nugaros skausmai bei migrena, o kūnas akivaizdžiai sutvirtėjo. Pavelas yra neįtikėtinai dėmesingas: jis ne tik atsižvelgia į moterišką ciklą, bet ir profesionaliai padėjo man atsistatyti po mastektomijos su specialiai pritaikytu planu. Nors važiuoju pas jį per visą miestą, rasti tokį empatišką specialistą yra tokia pat sėkmė, kaip rasti „savo“ gydytoją ar psichologą.”',
  },
  {
    name: 'Gabrielė Juozapavičiūtė',
    avatar: '/uploads/atsiliepimai/_thumbs/IMG_8426.jpeg',
    quote:
      '“Niekada nemaniau, kad sporto klubas man gali patikti – kol nepradėjau treniruotis su Pavelu. Su juo treniruotės niekada nėra nuobodžios! Visi pratimai parenkami individualiai, atsižvelgiant į mano tikslus ir iššūkius, todėl kiekviena treniruotė yra prasminga ir tikslinga. Po užsiėmimų visada jaučiuosi stipresnė, tvirtesnė ir labiau pasitikinti savimi. Pavelas – vienas geriausių trenerių Lietuvoje, ir esu labai dėkinga už galimybę sportuoti prižiūrint tokiam aukšto lygio profesionalui.”',
  },
];

const storiesEn = [
  {
    name: 'Ingrida Brazytė-Česevičienė',
    avatar: fromUploads('_optimized/atsiliepimai/470469671_9420998764591504_1367316031802033160_n-e1743524043787-320w.webp'),
    quote:
      '“Pavel is a professional, attentive and sincere coach—and a great motivator! I’ve been training for over three months and no two sessions have been the same. Workouts fly by and never feel boring. Most importantly, after each session I feel my muscles working, but it’s never been so painful that I couldn’t get out of bed.”',
  },
  {
    name: 'Dovydas Sem',
    avatar: fromUploads('_optimized/atsiliepimai/485767155_2433248600372198_5450357866485351546_n-e1743523994763-320w.webp'),
    quote:
      '“I’ve been training with Pavel for my second year now and I’m definitely not stopping! I’d say working out with him has been my best choice. He helps young people build a strong foundation, introduces a wide range of exercises and how they work, and encourages a healthy lifestyle. With this coach it’s never boring—exercise variety and constant communication make you want to come to the gym!”',
  },
  {
    name: 'Artūras Kozlov',
    avatar: fromUploads('_optimized/atsiliepimai/394284740_6710013242385928_5528573044851569625_n-320w.webp'),
    quote:
      '“A responsible, qualified coach who truly loves his work. You can see he prepares carefully for every session—chooses the right load and comes with a plan tailored specifically to you, not a copy‑paste scheme for everyone. Exercises are varied and interesting—there’s no monotony and you always learn something new. Most importantly, Pavel is extremely attentive: throughout the session he watches your technique, explains what each exercise is for and its benefits. He definitely doesn’t let any mistakes slip!”',
  },
  {
    name: 'Julia Gatsko',
    avatar: fromUploads('_optimized/atsiliepimai/Picture1 (1)-320w.webp'),
    quote:
      '“Pasha stands out with his professionalism and scientific approach—he considers your health and body condition, helping you not only look fit but also feel better. I’ve been training with him for almost a year and see great improvements in both fitness and overall well-being. Highly recommended!”',
  },
  {
    name: 'Justė Perveneckaitė',
    avatar: fromUploads('_optimized/atsiliepimai/Picture2-1-277w.webp'),
    quote:
      '“I’m an athlete who used to deal with various muscle imbalances, but the coach’s personalized program helped me resolve them and get stronger. I especially value his support in recovery and injury prevention, which is crucial for long-term progress. He’s very kind, attentive, and always sincerely answers every question.”',
  },
  {
    name: 'Edvard Korovacki',
    avatar: fromUploads('_optimized/atsiliepimai/Picture3 (1)-320w.webp'),
    quote:
      '“Pavel is an outstanding trainer who considers personal needs, motivates, and gives clear feedback. His knowledge covers not only exercises but also nutrition and recovery, helping to achieve real results. Trainings are always full of positive energy, and with him you feel welcome and inspired every time.”',
  },
  {
    name: 'Greta Valasinavičiūtė',
    avatar: fromUploads('_optimized/atsiliepimai/373064400_6180419855414750_1227222582074733444_n-320w.webp'),
    quote:
      '“Pavel is an amazing coach, and every workout with him is a source of motivation, energy and knowledge. I look forward to every session! Professionalism guaranteed—highly recommend!”',
  },
  {
    name: 'Tadas Kibirkštis',
    avatar: fromUploads('_optimized/atsiliepimai/367460586_6616155658420913_6885742354305016905_n-320w.webp'),
    quote:
      '“Pavel is a true professional. He dives into the situation, carefully selects exercises based on your condition and how you feel, and the result is noticeable immediately. He’s someone who loves his work and gives it 100%. Thank you—and I definitely recommend him to others!”',
  },
  {
    name: 'Ūlė Julija Masteikaitė',
    avatar: fromUploads('_optimized/atsiliepimai/Screenshot-2025-03-19-at-5.40.07 PM-320w.webp'),
    quote:
      '“Pavel is the absolute best 🫶 When I faced back pain, he helped me address it and suggested plenty of preventive exercises. He explains everything super thoroughly—not only how to do an exercise, but also which muscles work and the full benefit. After a workout you leave not only having trained, but also having learned a lot about your body, posture and mobility.”',
  },
  {
    name: 'Roma Šablinskienė',
    avatar: fromUploads('_optimized/atsiliepimai/459630769_10230433925305293_4458957318428687233_n-320w.webp'),
    quote:
      '“How do you turn a total dislike of sport into love for it? Easy—you just need Pavel’s help! Very carefully, for a long time, I looked for someone who could help me ‘tame this beast’. My attempts at group workouts were short‑lived, so I had almost written off sport as ‘not my thing’. But after the very first session I understood that with Pavel it’s perfect chemistry! He’s a true professional who doesn’t use one scheme for everyone. Respect!”',
  },
  {
    name: 'Evelina Jurčiukonytė',
    avatar: fromUploads('_optimized/atsiliepimai/302925805_5629860167034966_3216542933912186510_n-320w.webp'),
    quote:
      '“One of the best decisions—training with Pavel! He really knows his craft, listens to the client’s needs and wishes, is very responsible, loves his profession and knows exactly what he’s doing. Workouts fly by in an instant!”',
  },
  {
    name: 'Anna Levkovich',
    avatar: fromUploads('_optimized/atsiliepimai/image00001 (2)-320w.webp'),
    quote:
      '“I’ve been training with Pavel for over three years and it’s the best thing that’s happened to my well-being. During this time my back pain and migraines disappeared, and my body has clearly become stronger. Pavel is incredibly attentive: he not only considers the female cycle, but also helped me recover professionally after a mastectomy with a specially adapted plan. Even though I travel across the city to train with him, finding such an empathetic specialist is as lucky as finding ‘your’ doctor or psychologist.”',
  },
  {
    name: 'Gabrielė Juozapavičiūtė',
    avatar: '/uploads/atsiliepimai/_thumbs/IMG_8426.jpeg',
    quote:
      '“I never thought I could enjoy the gym – until I started training with Pavel. Training with him is never boring! All exercises are selected individually, taking into account my goals and challenges, so every workout is meaningful and purposeful. After sessions I always feel stronger, firmer and more confident. Pavel is one of the best trainers in Lithuania, and I am very grateful for the opportunity to train under the supervision of such a high-level professional.”',
  },
];

const storiesByLocale = {
  lt: storiesLt,
  en: storiesEn,
};

const transformationsLt = [
  {
    name: 'TADAS NORUŠAITIS',
    program: 'Jėgos ir raumenų auginimo',
    goal: 'Geras fizinis pasiruošimas ir mažesnis riebalinis audinys',
    result: 'Priaugo 15 kg raumenų per 9 mėnesius',
    before: {
      image: fromUploads('_optimized/atsiliepimai/before-2-960w.webp'),
      label: 'Foto prieš',
      weight: '105 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/after-2-960w.webp'),
      label: 'Foto po',
      weight: '90 kg',
    },
  },
  {
    name: 'ARTŪRAS KOZLOV',
    program: 'Jėgos ir raumenų auginimo',
    goal: 'Bendras fizinis pasiruošimas su akcentu į svorio metimą',
    result: 'Numetė 30 kg per metus',
    before: {
      image: fromUploads('_optimized/atsiliepimai/before-3-960w.webp'),
      label: 'Foto prieš',
      weight: '118 kg',
      objectPosition: '60% top',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/after-3-960w.webp'),
      label: 'Foto po',
      weight: '88 kg',
      objectPosition: '60% top',
    },
  },
  {
    name: 'ROKAS RUTKAUSKAS',
    program: 'Svorio metimo',
    goal: 'Sumažinti riebalinį audinį išlaikant raumeninę masę',
    result: 'Numetė 42 kg per pusę metų',
    before: {
      image: fromUploads('_optimized/atsiliepimai/before-1-960w.webp'),
      label: 'Foto prieš',
      weight: '125 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/after-1-960w.webp'),
      label: 'Foto po',
      weight: '83 kg',
    },
  },
  {
    name: 'MIROSLAV MICHOLČ',
    program: 'Svorio metimo',
    goal: 'Atsikratyti riebalinės masės',
    result: 'Numetė 13 kg riebalinės masės per 2 mėnesius',
    before: {
      image: fromUploads('_optimized/atsiliepimai/image00001-960w.webp'),
      label: 'Foto prieš',
      weight: '113 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/image00002-960w.webp'),
      label: 'Foto po',
      weight: '99 kg',
    },
  },
  {
    name: 'JOLITA VARNAGIRIENĖ',
    program: 'Svorio metimo',
    goal: 'Daugiau energijos, stipresnė sveikata ir lengvesnis kūnas',
    result: 'Numetė 7 kg per 4 mėnesius',
    before: {
      image: fromUploads('_optimized/atsiliepimai/Unknown-4 (1)-768w.webp'),
      label: 'Foto prieš',
      weight: '67 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/Po2-1-768w.webp'),
      label: 'Foto po',
      weight: '60 kg',
    },
  },
  {
    name: 'LAURYNAS ČEPLIKAS',
    program: 'Jėgos ir raumenų auginimo',
    goal: 'Raumenų hipertrofija ir jėgos didinimas',
    result: 'Priaugo 10 kg raumenų per 11 mėnesių',
    before: {
      image: fromUploads('_optimized/atsiliepimai/IMG_6824-scaled-960w.webp'),
      label: 'Foto prieš',
      weight: '63 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/Bicepsa-scaled-960w.webp'),
      label: 'Foto po',
      weight: '73 kg',
    },
  },
];

const transformationsEn = [
  {
    name: 'TADAS NORUŠAITIS',
    program: 'Strength & muscle gain',
    goal: 'Better overall fitness and lower body fat',
    result: 'Gained 15 kg of muscle in 9 months',
    before: {
      image: fromUploads('_optimized/atsiliepimai/before-2-960w.webp'),
      label: 'Before photo',
      weight: '105 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/after-2-960w.webp'),
      label: 'After photo',
      weight: '90 kg',
    },
  },
  {
    name: 'ARTŪRAS KOZLOV',
    program: 'Strength & muscle gain',
    goal: 'Overall fitness with a focus on fat loss',
    result: 'Lost 30 kg in 1 year',
    before: {
      image: fromUploads('_optimized/atsiliepimai/before-3-960w.webp'),
      label: 'Before photo',
      weight: '118 kg',
      objectPosition: '60% top',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/after-3-960w.webp'),
      label: 'After photo',
      weight: '88 kg',
      objectPosition: '60% top',
    },
  },
  {
    name: 'ROKAS RUTKAUSKAS',
    program: 'Weight loss',
    goal: 'Reduce body fat while maintaining muscle mass',
    result: 'Lost 42 kg in 6 months',
    before: {
      image: fromUploads('_optimized/atsiliepimai/before-1-960w.webp'),
      label: 'Before photo',
      weight: '125 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/after-1-960w.webp'),
      label: 'After photo',
      weight: '83 kg',
    },
  },
  {
    name: 'MIROSLAV MICHOLČ',
    program: 'Weight loss',
    goal: 'Lose body fat',
    result: 'Lost 13 kg of body fat in 2 months',
    before: {
      image: fromUploads('_optimized/atsiliepimai/image00001-960w.webp'),
      label: 'Before photo',
      weight: '113 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/image00002-960w.webp'),
      label: 'After photo',
      weight: '99 kg',
    },
  },
  {
    name: 'JOLITA VARNAGIRIENĖ',
    program: 'Weight loss',
    goal: 'More energy, stronger health, and a lighter body',
    result: 'Lost 7 kg in 4 months',
    before: {
      image: fromUploads('_optimized/atsiliepimai/Unknown-4 (1)-768w.webp'),
      label: 'Before photo',
      weight: '67 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/Po2-1-768w.webp'),
      label: 'After photo',
      weight: '60 kg',
    },
  },
  {
    name: 'LAURYNAS ČEPLIKAS',
    program: 'Strength & muscle gain',
    goal: 'Muscle hypertrophy and strength increase',
    result: 'Gained 10 kg of muscle in 11 months',
    before: {
      image: fromUploads('_optimized/atsiliepimai/IMG_6824-scaled-960w.webp'),
      label: 'Before photo',
      weight: '63 kg',
    },
    after: {
      image: fromUploads('_optimized/atsiliepimai/Bicepsa-scaled-960w.webp'),
      label: 'After photo',
      weight: '73 kg',
    },
  },
];

const transformationsByLocale = {
  lt: transformationsLt,
  en: transformationsEn,
};

const helpListLt = [
  'Atrodyti ir jaustis geriau',
  'Padidinti pasitikėjimą savimi',
  'Pagerinti savo laikyseną',
  'Tikslingai ir taisyklingai treniruotis',
  'Valgyti sveiką, subalansuotą maistą nebadaujant',
  'Padidinti savo energijos lygį',
];

const helpListEn = [
  'Look and feel better',
  'Build confidence',
  'Improve posture',
  'Train with correct technique and structure',
  'Eat balanced without starving',
  'Increase daily energy',
];

const helpListByLocale = {
  lt: helpListLt,
  en: helpListEn,
};

const notHelpListLt = [
  'Tikite greitais rezultatais be nuoseklaus darbo',
  'Nenorite keisti mitybos ir gyvenimo būdo įpročių',
  'Ieškote „stebuklingų“ papildų ar trumpų kelių',
  'Atsisakote laikytis individualiai sudaryto plano',
  'Negalite skirti laiko bent kelioms treniruotėms per savaitę',
];

const notHelpListEn = [
  'Believe in quick results without consistent work',
  'Are not willing to adjust nutrition and lifestyle',
  'Look for “magic” supplements or shortcuts',
  'Refuse to follow an individual plan',
  'Can’t commit to a few sessions per week',
];

const notHelpListByLocale = {
  lt: notHelpListLt,
  en: notHelpListEn,
};

const servicesLt = [
  {
    title: 'Testavimo treniruotė su kūno analize ir programos sudarymu',
    image: fromUploads('_optimized/testavimas4-960w.webp'),
    description:
      'Pirmas žingsnis į aiškius rezultatus! Atliekame išsamią kūno analizę ir paruošiame programą pagal tavo tikslus.',
    features: [
      'Raumenų balanso, laikysenos ir kūno sudėties įvertinimas',
      'Išryškinamos stiprybės ir silpnosios vietos',
      'Asmeninė treniruočių programa',
      'Puikiai tinka pradedantiesiems ir pažengusiems',
    ],
  },
  {
    title: 'Treniruotės jūsų įmonėje',
    image: fromUploads('_optimized/IMG_0458-scaled-960w.webp'),
    description:
      'Suteikite komandai daugiau energijos ir geresnę savijautą. Trumpi, efektyvūs užsiėmimai darbo metu motyvuoja ir sutelkia.',
    features: [
      'Treniruočių grafikas derinamas su jūsų komanda',
      'Trumpi, bet intensyvūs užsiėmimai',
      'Skatinamas produktyvumas ir komandiškumas',
    ],
  },
  {
    title: 'Asmeninės treniruotės – Vilniuje ir Varėnoje',
    image: fromUploads('_optimized/IMG_0481-scaled-960w.webp'),
    description:
      'Individualus dėmesys, aiškus planas ir realūs rezultatai. Gauk profesionalų palaikymą kiekviename žingsnyje.',
    features: ['100 % dėmesio vienam klientui', 'Aiškios treniruočių struktūros', 'Motyvacija ir atsakomybė'],
  },
  {
    title: 'Online coaching',
    image: fromUploads('_optimized/Planu_darymas3-960w.webp'),
    description:
      'Sportuok bet kur – gautas planas, palaikymas ir atsakomybė padeda išlikti kelyje į tikslą net kelionėje.',
    features: ['Individualus nuotolinis planas', 'Reguliarus palaikymas ir grįžtamasis ryšys', 'Treniruočių korekcijos pagal progresą'],
  },
  {
    title: 'Treniruotės jūsų namuose',
    image: fromUploads('_optimized/grupine8-960w.webp'),
    description:
      'Treneris atvyksta pas jus! Patogus ir saugus sportas, pritaikytas jūsų erdvei, tikslams ir galimybėms.',
    features: ['Inventoriaus pritaikymas namų erdvei', 'Treniruočių grafikas pagal jūsų laiką', 'Asmeninis dėmesys ir saugumas'],
  },
  {
    title: 'Grupinės treniruotės – Varėnoje ir Vilniuje',
    image: fromUploads('_optimized/grupine1-960w.webp'),
    description:
      'Energija, kuri užkrečia! Sportuokite mažose ar didelėse grupėse, jauskite palaikymą ir bendrumą.',
    features: ['Skirtingo dydžio grupės', 'Motyvuojanti ir pozityvi atmosfera', 'Idealiai tinka socialiai motyvuotiems sportui'],
  },
  {
    title: 'Sportas poroje',
    image: fromUploads('_optimized/IMG_0451-scaled-960w.webp'),
    description:
      'Labai populiarus pasirinkimas! Dviguba motyvacija ir bendras tikslas stiprina kūną bei santykį.',
    features: ['Planai pritaikyti dviem žmonėms', 'Bendro progreso sekimas', 'Treniruotės, kurios stiprina ryšį'],
  },
  {
    title: 'Paauglių grupinės treniruotės – Varėnoje',
    image: fromUploads('_optimized/paaugliu-grupine-960w.webp'),
    description:
      'Saugi, smagi ir lavinanti aplinka jauniems sportininkams. Stiprėk, gerink laikyseną, pasitikėjimą ir fizinį pasirengimą!',
    features: ['Amžiui pritaikyti pratimai', 'Dėmesys laikysenai ir fiziniam pasirengimui', 'Palaikanti ir draugiška bendruomenė'],
  },
  {
    title: 'Senjorų treniruotės – sporto salėje ir baseine',
    image: fromUploads('_optimized/senjoru5-960w.webp'),
    description:
      'Švelnios, bet veiksmingos treniruotės geresnei savijautai, lankstumui ir gyvenimo džiaugsmui. Judėjimas tinka visiems!',
    features: ['Mažo poveikio pratimai salėje ir baseine', 'Gerina lankstumą ir balansą', 'Pritaikoma individualioms galimybėms'],
  },
];

const servicesEn = [
  {
    title: 'Assessment training + body analysis + plan setup',
    image: fromUploads('_optimized/testavimas4-960w.webp'),
    description: 'A clear starting point: assess, understand your body, and build the right plan for your goal.',
    features: [
      'Muscle balance, posture and body composition overview',
      'Identify strengths and weak points',
      'Personal training plan outline',
      'Great for beginners and advanced',
    ],
  },
  {
    title: 'Workplace training for your company',
    image: fromUploads('_optimized/IMG_0458-scaled-960w.webp'),
    description: 'Boost energy and well-being with short, effective sessions during the workday.',
    features: ['Schedule aligned with your team', 'Short but efficient sessions', 'Supports productivity and team culture'],
  },
  {
    title: 'Personal training — Vilnius and Varėna',
    image: fromUploads('_optimized/IMG_0481-scaled-960w.webp'),
    description: 'Individual attention, a clear plan, and real results with accountability.',
    features: ['100% focus on you', 'Clear training structure', 'Motivation and responsibility'],
  },
  {
    title: 'Online coaching',
    image: fromUploads('_optimized/Planu_darymas3-960w.webp'),
    description: 'Train anywhere with a plan, feedback and accountability that keeps you on track.',
    features: ['Personal remote plan', 'Regular support and feedback', 'Adjustments based on progress'],
  },
  {
    title: 'Training at your home',
    image: fromUploads('_optimized/grupine8-960w.webp'),
    description: 'Convenient and safe training adapted to your space, goals, and capabilities.',
    features: ['Adapted to your space/equipment', 'Schedule that fits you', 'Personal attention and safety'],
  },
  {
    title: 'Group training — Varėna and Vilnius',
    image: fromUploads('_optimized/grupine1-960w.webp'),
    description: 'High-energy sessions with community support and a great atmosphere.',
    features: ['Different group sizes', 'Positive motivating atmosphere', 'Great if you like social training'],
  },
  {
    title: 'Partner training (2 people)',
    image: fromUploads('_optimized/IMG_0451-scaled-960w.webp'),
    description: 'A popular choice: shared goals and double motivation build consistency.',
    features: ['Plans for two', 'Shared progress tracking', 'Sessions that build habits'],
  },
  {
    title: 'Teen group training — Varėna',
    image: fromUploads('_optimized/paaugliu-grupine-960w.webp'),
    description: 'A safe and fun environment: strength, posture, confidence, and athletic basics.',
    features: ['Age-appropriate exercises', 'Focus on posture and fundamentals', 'Supportive community'],
  },
  {
    title: 'Senior training — gym and pool',
    image: fromUploads('_optimized/senjoru5-960w.webp'),
    description: 'Gentle but effective training for flexibility, balance, and better daily well-being.',
    features: ['Low-impact training', 'Improves flexibility and balance', 'Adapted to your capabilities'],
  },
];

const servicesByLocale = {
  lt: servicesLt,
  en: servicesEn,
};

const groupServicesLt = [
  {
    title: 'Motivacinės grupinės treniruotės',
    features: [
      'Dinamiški visi kūną įtraukiantys užsiėmimai',
      'Komandos palaikymas ir papildoma motyvacija',
      'Pigiau nei sportuojant individualiai',
      'Profesionali priežiūra viso užsiėmimo metu',
    ],
  },
  {
    title: 'Vaikų grupinės treniruotės',
    features: ['Taisyklingos laikysenos formavimas', 'Veikla pritaikyta pagal amžių', 'Saugi ir palaikanti aplinka', 'Bendravimas ir linksmybės'],
  },
  {
    title: 'Vaikų stovykla',
    features: ['Aktyvus laisvalaikis', 'Vaikų lavinimas', 'Pramogos ir mokymasis', 'Komandiniai užsiėmimai'],
  },
  {
    title: 'Senjorų grupinės treniruotės',
    features: ['Mažo intensyvumo pratimai', 'Dėmesys pusiausvyros ir lankstumo gerinimui', 'Dėmesys kiekvienam', 'Bendruomenės kuriama atmosfera'],
  },
];

const groupServicesEn = [
  {
    title: 'Motivational group sessions',
    features: [
      'Dynamic full-body sessions',
      'Group support and extra motivation',
      'More affordable than 1:1 training',
      'Professional supervision throughout',
    ],
  },
  {
    title: 'Kids group training',
    features: ['Build healthy posture habits', 'Age-appropriate activity', 'Safe and supportive environment', 'Fun + social skills'],
  },
  {
    title: 'Kids camp',
    features: ['Active time', 'Skill development', 'Fun + learning', 'Team activities'],
  },
  {
    title: 'Senior group training',
    features: ['Low-intensity exercises', 'Balance and mobility focus', 'Attention to each person', 'Community atmosphere'],
  },
];

const groupServicesByLocale = {
  lt: groupServicesLt,
  en: groupServicesEn,
};

const vilniusOutletLogo = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="150"
    height="35"
    viewBox="0 0 150 35"
    fill="none"
    className="h-12 w-auto"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M65.2265 25.9346H71.1084V9.69616H79.2906C81.6097 9.69616 82.166 10.1677 82.166 12.0168V25.9283H88.0667V12.0292C88.0667 10.0747 88.748 9.69616 90.942 9.68996L96.2239 9.67755C98.6679 9.67755 99.1117 10.2174 99.1117 12.054V25.9408H105V10.751C105.019 6.01041 101.975 4.03103 97.9616 4.02482L90.6857 4.01241C86.8228 4.01241 86.0977 4.81906 85.1288 5.8739C84.085 4.83767 83.3599 4.01862 79.4844 4.01862H65.2202V25.9346H65.2265ZM43.2239 23.0182L35.6668 34.9876L43.2052 35L62.1386 4.00621H55.2378L46.5743 17.5641L38.2608 4.01862H30.8599L43.2177 23.0182H43.2239ZM5.82576 18.0294C5.82576 19.6675 6.48208 20.1143 8.28855 20.1143H21.5714V9.68996H9.15115C6.76962 9.68996 5.83201 9.78924 5.83826 11.75L5.82576 18.0232V18.0294ZM21.6151 25.9656L21.5964 27.9946C21.5839 29.1984 20.4712 29.4528 19.6461 29.4528H3.44423V34.9442L19.9524 34.9628C23.7091 34.9628 27.4095 33.2688 27.422 28.4165L27.4721 4H8.80736C3.66925 4.00621 -0.018681 4.51502 7.11874e-05 11.5949L0.0250741 19.3883C0.0438263 24.7928 3.75676 25.9718 7.63847 25.9718H21.6151V25.9656Z"
      fill="black"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M131.97 3.8147e-06H138.03V30H131.97V18.0265H120V11.9675H131.97V3.8147e-06ZM138.096 18.0265L142.834 11.9675H150V18.0265H138.096Z"
      fill="#00AEEF"
    />
  </svg>
);

const partnerLogos = [
  { name: 'Vilnius Outlet', logoInline: vilniusOutletLogo, link: 'https://maps.app.goo.gl/d3iY2LjH72AQD8vcA' },
  { name: 'VSC', logo: fromUploads('image.png'), link: 'https://maps.app.goo.gl/1biqtcWhnr4dDt5v5' },
];

function AnimatedCounter({ from = 0, to, suffix = '', delay = 0 }) {
  const [value, setValue] = useState(from);
  const elementRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) {
      return undefined;
    }

    let animationFrame;
    let timeoutId;
    const duration = 1600;

    const startAnimation = () => {
      if (startedRef.current) {
        return;
      }

      startedRef.current = true;
      const startTime = performance.now();

      const step = now => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const nextValue = Math.floor(from + (to - from) * progress);
        setValue(nextValue);
        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        }
      };

      if (delay > 0) {
        timeoutId = window.setTimeout(() => {
          animationFrame = requestAnimationFrame(step);
        }, delay);
      } else {
        animationFrame = requestAnimationFrame(step);
      }
    };

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      observer.disconnect();
    };
  }, [delay, from, to]);

  return (
    <span ref={elementRef} className="text-3xl font-semibold text-white">
      {`${value}${suffix}`}
    </span>
  );
}

function App({ locale = 'lt' }) {
  const activeLocale = locale === 'en' ? 'en' : 'lt';
  const location = useLocation();

  useEffect(() => {
    const items = activeLocale === 'lt' ? programsLt : programsEn;
    sendEvent('view_item_list', {
      item_list_id: 'main_plans',
      item_list_name: 'Main Plans',
      items: items.map((p) => ({
        item_id: p.productId,
        item_name: p.cartName || p.title,
        price: (p.unitPriceCents || 0) / 100,
        currency: 'EUR',
        quantity: 1,
      })),
    });
  }, [activeLocale]);

  const [isDesktop, setIsDesktop] = useState(false);
  const [contactNotice, setContactNotice] = useState(null);
  const [contactError, setContactError] = useState(null);
  const [contactBusy, setContactBusy] = useState(false);
  const [expandedProgramIdsMobile, setExpandedProgramIdsMobile] = useState(() => ({}));

  const cartPath = activeLocale === 'lt' ? '/lt/krepselis' : '/en/cart';

  const toggleProgramExpandedMobile = programId => {
    if (!programId) return;
    setExpandedProgramIdsMobile(prev => ({
      ...prev,
      [programId]: !prev?.[programId],
    }));
  };

  const onBuyProgram = program => {
    const cart = loadCart();
    const next = addItem(cart, {
      kind: 'product',
      productId: program.productId,
      name: program.cartName || program.title,
      imageUrl: program.image || getProductImageUrl(program.productId),
      unitPriceCents: Number(program.unitPriceCents || 0),
      qty: 1,
    });
    saveCart(next);

    sendEvent('add_to_cart', {
      currency: 'EUR',
      value: Number(program.unitPriceCents || 0) / 100,
      items: [
        {
          item_id: program.productId,
          item_name: program.cartName || program.title,
          price: Number(program.unitPriceCents || 0) / 100,
          quantity: 1,
        },
      ],
    });

    // Open the global slide-out cart.
    try {
      window.dispatchEvent(new Event('cart:open'));
    } catch {
      // ignore
    }
  };

  const [testimonialsRef, testimonials] = useKeenSlider(
    {
      loop: true,
      mode: 'snap',
      renderMode: 'performance',
      drag: true,
      slides: {
        perView: 1,
        spacing: 24,
      },
      breakpoints: {
        '(min-width: 768px)': {
          slides: {
            perView: 2,
            spacing: 24,
          },
        },
        '(min-width: 1024px)': {
          slides: {
            perView: 3,
            spacing: 24,
          },
        },
      },
      defaultAnimation: {
        duration: 800,
        easing: t => 1 - Math.pow(1 - t, 4),
      },
    },
    [
      slider => {
        let timeout;
        let isInteracting = false;

        const clearNextTimeout = () => {
          clearTimeout(timeout);
        };

        const nextTimeout = () => {
          clearTimeout(timeout);
          if (isInteracting) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 5000);
        };

        slider.on('created', () => {
          const container = slider.container;

          const onPointerDown = () => {
            isInteracting = true;
            clearNextTimeout();
          };
          const onPointerUp = () => {
            isInteracting = false;
            nextTimeout();
          };
          const onMouseEnter = () => {
            isInteracting = true;
            clearNextTimeout();
          };
          const onMouseLeave = () => {
            isInteracting = false;
            nextTimeout();
          };

          container.addEventListener('pointerdown', onPointerDown, { passive: true });
          window.addEventListener('pointerup', onPointerUp, { passive: true });
          container.addEventListener('mouseenter', onMouseEnter, { passive: true });
          container.addEventListener('mouseleave', onMouseLeave, { passive: true });

          nextTimeout();

          slider.on('destroyed', () => {
            container.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            container.removeEventListener('mouseenter', onMouseEnter);
            container.removeEventListener('mouseleave', onMouseLeave);
          });
        });

        slider.on('dragStarted', () => {
          isInteracting = true;
          clearNextTimeout();
        });
        slider.on('animationEnded', () => {
          isInteracting = false;
          nextTimeout();
        });
        slider.on('updated', nextTimeout);
      },
    ]
  );

  const [servicesRef, servicesSlider] = useKeenSlider(
    {
      loop: true,
      mode: 'snap',
      renderMode: 'performance',
      drag: true,
      slides: {
        perView: 1,
        spacing: 24,
      },
      breakpoints: {
        '(min-width: 768px)': {
          slides: {
            perView: 2,
            spacing: 24,
          },
        },
        '(min-width: 1280px)': {
          slides: {
            perView: 3,
            spacing: 24,
          },
        },
      },
      defaultAnimation: {
        duration: 800,
        easing: t => 1 - Math.pow(1 - t, 4),
      },
    },
    [
      slider => {
        let timeout;
        let isInteracting = false;
        let resizeObserver;

        const clearNextTimeout = () => {
          clearTimeout(timeout);
        };

        const requestUpdate = () => {
          try {
            slider.update();
          } catch {
            // ignore
          }
        };

        const nextTimeout = () => {
          clearTimeout(timeout);
          if (isInteracting) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 6000);
        };

        slider.on('created', () => {
          const container = slider.container;

          const onPointerDown = () => {
            isInteracting = true;
            clearNextTimeout();
          };
          const onPointerUp = () => {
            isInteracting = false;
            nextTimeout();
          };
          const onMouseEnter = () => {
            isInteracting = true;
            clearNextTimeout();
          };
          const onMouseLeave = () => {
            isInteracting = false;
            nextTimeout();
          };

          container.addEventListener('pointerdown', onPointerDown, { passive: true });
          window.addEventListener('pointerup', onPointerUp, { passive: true });
          container.addEventListener('mouseenter', onMouseEnter, { passive: true });
          container.addEventListener('mouseleave', onMouseLeave, { passive: true });

          if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
              requestAnimationFrame(requestUpdate);
            });
            resizeObserver.observe(container);
          }

          // Defensive: ensure correct initial measurements after images/fonts settle.
          requestAnimationFrame(requestUpdate);
          window.setTimeout(requestUpdate, 50);

          nextTimeout();

          slider.on('destroyed', () => {
            container.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            container.removeEventListener('mouseenter', onMouseEnter);
            container.removeEventListener('mouseleave', onMouseLeave);
            resizeObserver?.disconnect();
          });
        });

        slider.on('dragStarted', () => {
          isInteracting = true;
          clearNextTimeout();
        });
        slider.on('animationEnded', () => {
          isInteracting = false;
          nextTimeout();
        });
        slider.on('updated', nextTimeout);
      },
    ]
  );

  useEffect(() => {
    // Services slides change with locale; force Keen Slider to re-measure.
    requestAnimationFrame(() => servicesSlider.current?.update());
    window.setTimeout(() => servicesSlider.current?.update(), 50);
    window.setTimeout(() => servicesSlider.current?.update(), 200);
  }, [activeLocale]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = event => setIsDesktop(event.matches);
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);





  const [transformationsRef, transformationsSlider] = useKeenSlider(
    {
      loop: true,
      mode: 'snap',
      renderMode: 'performance',
      drag: true,
      slides: {
        perView: 1,
        spacing: 24,
      },
      defaultAnimation: {
        duration: 1000,
        easing: t => 1 - Math.pow(1 - t, 4),
      },
    },
    [
      slider => {
        let timeout;
        let isInteracting = false;

        const clearNextTimeout = () => {
          clearTimeout(timeout);
        };

        const nextTimeout = () => {
          clearTimeout(timeout);
          if (isInteracting) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 7000);
        };

        slider.on('created', () => {
          const container = slider.container;

          const onPointerDown = () => {
            isInteracting = true;
            clearNextTimeout();
          };
          const onPointerUp = () => {
            isInteracting = false;
            nextTimeout();
          };
          const onMouseEnter = () => {
            isInteracting = true;
            clearNextTimeout();
          };
          const onMouseLeave = () => {
            isInteracting = false;
            nextTimeout();
          };

          container.addEventListener('pointerdown', onPointerDown, { passive: true });
          window.addEventListener('pointerup', onPointerUp, { passive: true });
          container.addEventListener('mouseenter', onMouseEnter, { passive: true });
          container.addEventListener('mouseleave', onMouseLeave, { passive: true });

          nextTimeout();

          slider.on('destroyed', () => {
            container.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            container.removeEventListener('mouseenter', onMouseEnter);
            container.removeEventListener('mouseleave', onMouseLeave);
          });
        });

        slider.on('dragStarted', () => {
          isInteracting = true;
          clearNextTimeout();
        });
        slider.on('animationEnded', () => {
          isInteracting = false;
          nextTimeout();
        });
        slider.on('updated', nextTimeout);
      },
    ]
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    const initAos = () => {
      AOS.init({
        once: true,
        duration: mobileQuery.matches ? 560 : 700,
        easing: 'ease-out-cubic',
        offset: mobileQuery.matches ? 90 : 120,
        disable: false,
      });
      AOS.refreshHard();
    };

    initAos();

    const handleChange = () => initAos();
    mobileQuery.addEventListener('change', handleChange);
    prefersReducedMotion.addEventListener('change', handleChange);
    window.addEventListener('load', AOS.refreshHard);
    window.addEventListener('orientationchange', AOS.refreshHard);
    window.setTimeout(() => AOS.refreshHard(), 350);

    return () => {
      mobileQuery.removeEventListener('change', handleChange);
      prefersReducedMotion.removeEventListener('change', handleChange);
      window.removeEventListener('load', AOS.refreshHard);
      window.removeEventListener('orientationchange', AOS.refreshHard);
    };
  }, []);

  return (
    <div className="relative bg-white text-black">
      <main>
        <Hero
          stats={heroStatsByLocale[activeLocale]}
          backgroundDesktop={heroImageDesktop}
          backgroundMobile={heroImageMobile}
          title={
            activeLocale === 'lt'
              ? 'Asmeninis treneris Vilniuje: raumenų auginimas ir svorio metimas'
              : 'Personal trainer in Vilnius: muscle gain and fat loss'
          }
          subtitle={null}
          imageAlt={
            activeLocale === 'lt'
              ? 'Asmeninis treneris Vilniuje treniruoje'
              : 'Personal trainer in Vilnius during training'
          }
          ctaLabel={activeLocale === 'lt' ? 'Gauti asmeninį pasiūlymą' : 'Get personal offer'}
          ctaLink={activeLocale === 'lt' ? '/lt/anketa' : '/en/questionnaire'}
        />

        <section id="apie-mane" className="bg-white py-20 text-black">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center" data-aos="fade-up">
              <div>
                <figure className="rounded-2xl overflow-hidden">
                  <img
                    src={fromUploads('_optimized/IMG_0462-scaled-e1750332801471-1347w.webp')}
                    alt={
                      activeLocale === 'lt'
                        ? 'Asmeninis treneris Pavel Kaliadziuk – apie mane'
                        : 'Personal trainer Pavel Kaliadziuk – about me'
                    }
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </figure>
              </div>
              <div>
                <h3 className="font-heading text-4xl font-black uppercase">{activeLocale === 'lt' ? 'Apie mane' : 'About me'}</h3>
                <div className="space-y-4 text-base text-black/75">
                  {activeLocale === 'lt' ? (
                    <>
                      <p>
                        Labas, aš Pavel Kaliadziuk — asmeninis treneris Vilniuje, sveikatingumo treneris ir biomechanikos specialistas,
                        jau daugiau nei aštuonerius metus padedantis žmonėms raumenų auginimo, svorio metimo ir judėjimo be skausmo kelyje.
                        Asmeninis treneris Vilniuje: raumenų auginimas ir svorio metimas.
                      </p>
                      <p>
                        Mano kelionė sporte prasidėjo dar būnant septynerių. Nuo pat vaikystės jutau tą vidinę ugnį — norą atrasti save,
                        tapti stipriu ne tik kūnu, bet ir charakteriu. Sportas man tapo būdu augti ir įrodyti, kad galiu daugiau, net tada, kai
                        aplinkybėse trūko atramos.
                      </p>
                      <p>
                        Pradėjau nuo imtynių, vėliau pasinėriau į lengvąją atletiką, futbolą ir galiausiai į treniruotes savo kūno svoriu.
                        Maksimalizmas ir noras viską daryti „iki galo“ atvedė prie traumų — pečių, stuburo, kelių skausmai privertė sustoti ir
                        klausytis savo kūno.
                      </p>
                      <p>
                        Kai kūnas nebeleidžia eiti pirmyn, turi suprasti, ką jis tau sako. Pradėjau gilintis į anatomiją, stuburo struktūrą,
                        biomechaniką, analizavau kiekvieną judesį kaip eksperimentą. Supratau, kad judėjimas turi būti protingas, o kiekvieno
                        žmogaus kūnas — unikalus.
                      </p>
                      <p>
                        Buvo laikas, kai skaudėjo ne tik kūną, bet ir vidų. Depresijos bangos, finansiniai sunkumai, jausmas, kad esi vienas su
                        savo skausmu. Tai nepalaužė — priešingai, paskatino ieškoti gilesnės prasmės ir dalintis patirtimi su kitais.
                      </p>
                      <p>
                        Todėl įstojau į sporto universitetą ir pradėjau gilinti žinias moksliškai. Studijos, seminarai, darbas su specialistais ir
                        praktika su klientais vedė prie vieno tikslo — padėti žmonėms atrasti sveiką, harmoningą ir sąmoningą judėjimą.
                      </p>
                      <p>
                        Dirbau sporto klubuose, universitete, vedžiau treniruotes, organizavau seminarus, kūriau įrangą ir drabužius — sportas tapo
                        mano gyvenimo būdu, ne tik darbu.
                      </p>
                      <p>
                        Šiandien padedu žmonėms ne tik sustiprinti kūną, bet ir jį suprasti. Mokau judėti be skausmo, be baimės ir su pasitikėjimu.
                        Tikiu, kad judėjimas — kelias į vidinę ramybę. Jei gali kiti, kodėl negali tu? Aš tikiu tavimi, ir jei eisi kartu, pasieksime
                        daugiau, nei kada nors įsivaizdavai.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Hi, I’m Pavel — a health & wellness coach and biomechanics specialist. For more than eight years I’ve been helping
                        people not only get physically stronger, but also find inner calm and confidence.
                      </p>
                      <p>
                        My journey in sports started when I was seven. Even as a kid I felt that inner fire — the desire to discover myself and
                        become strong not only in body, but in character.
                        Sport became my way to grow and prove that I can do more, even when life didn’t offer much support.
                      </p>
                      <p>
                        I began with wrestling, later dove into track & field and football, and eventually focused on bodyweight training.
                        My maximalism and the need to do everything “all the way” led to injuries — shoulder, spine, and knee pain forced me to stop
                        and listen to my body.
                      </p>
                      <p>
                        When your body won’t let you move forward, you have to understand what it’s telling you.
                        I started studying anatomy, the structure of the spine, and biomechanics — analyzing every movement like an experiment.
                        I learned that movement must be intelligent, and every person’s body is unique.
                      </p>
                      <p>
                        There was a time when it hurt not only physically, but internally too — waves of depression, financial pressure,
                        and the feeling of being alone with my pain.
                        It didn’t break me; instead, it pushed me to look for deeper meaning and share what I learned with others.
                      </p>
                      <p>
                        That’s why I entered a sports university and started building knowledge scientifically.
                        Studies, seminars, working with specialists, and hands-on practice with clients led to one goal:
                        helping people discover healthy, harmonious, and mindful movement.
                      </p>
                      <p>
                        I worked in gyms and at the university, coached clients, ran seminars, and even created equipment and clothing —
                        sport became my lifestyle, not just my job.
                      </p>
                      <p>
                        Today I help people not only strengthen their bodies, but understand them.
                        I teach you to move without pain, without fear, and with confidence.
                        I believe movement is a path to inner calm. If others can do it, why can’t you?
                        I believe in you — and if we walk this path together, we’ll reach more than you ever imagined.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="programos" className="bg-white py-24 text-black">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl space-y-4 text-center" data-aos="fade-up">
              <h2 className="font-heading text-4xl font-black uppercase">
                {activeLocale === 'lt' ? 'Treniruočių ir mitybos planai' : 'Training & nutrition plans'}
              </h2>
              <p className="text-base text-black/70">
                {activeLocale === 'lt'
                  ? 'Pasirinkite programą pagal savo tikslus – kiekviena sudaroma individualiai, atsižvelgiant į jūsų poreikius ir galimybes.'
                  : 'Choose a program for your goals — each one is tailored to your needs and capabilities.'}
              </p>
            </div>
            <div className="mt-16 grid gap-8 pb-6 lg:grid-cols-2 xl:grid-cols-3">
              {programsByLocale[activeLocale].map((plan, index) => (
                <article
                  key={plan.title}
                  className={`flex flex-col overflow-hidden rounded-[40px] border bg-white shadow-[0_30px_90px_rgba(15,23,42,0.1)] transition duration-500 hover:-translate-y-2 ${
                    plan.isPremium ? 'border-yellow-400 ring-4 ring-yellow-400/20' : 'border-slate-200'
                  }`}
                  data-aos="fade-up"
                  data-aos-delay={index * 80}
                >
                  <div className="relative h-[380px] sm:h-[360px] shrink-0">
                    <img src={plan.image} alt={plan.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${
                        plan.isPremium
                          ? 'from-yellow-900/20 via-black/40 to-black/90'
                          : 'from-transparent via-black/20 to-black/70'
                      }`}
                    />
                    <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-10 text-white">
                      <button
                        type="button"
                        onClick={() => toggleProgramExpandedMobile(plan.productId)}
                        aria-expanded={Boolean(expandedProgramIdsMobile?.[plan.productId])}
                        aria-controls={`program-details-${plan.productId || index}`}
                        className="md:hidden !absolute bottom-6 right-6 z-20 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full glass-green-surface text-2xl font-semibold leading-none text-black shadow-[0_18px_45px_rgba(15,23,42,0.25)] transition hover:brightness-95"
                      >
                        {expandedProgramIdsMobile?.[plan.productId] ? '-' : '+'}
                      </button>
                      <div className="space-y-3 sm:space-y-4">
                        {plan.isPremium && (
                          <span className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase tracking-widest text-black mb-2">
                             VIP / Premium
                          </span>
                        )}
                        <p className={`text-sm font-semibold uppercase tracking-widest ${plan.isPremium ? 'text-yellow-400' : 'text-white/70'}`}>
                          {plan.subtitle}
                        </p>
                        <h3 className="font-heading text-2xl font-black leading-tight sm:text-4xl">{plan.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-sm font-semibold pr-14 md:pr-0">
                        <span className="glass-card rounded-full px-4 py-2 text-white/90">{plan.duration}</span>
                        {plan.hasDietician && (
                          <span className="glass-card flex items-center gap-2 rounded-full px-4 py-2 text-white/90">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black">
                              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </span>
                            {activeLocale === 'lt' ? 'Parengta su dietologu' : 'Approved by dietician'}
                          </span>
                        )}
                        <span className={`glass-card rounded-full px-4 py-2 text-white ${plan.isPremium ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-400' : ''}`}>
                          {plan.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    id={`program-details-${plan.productId || index}`}
                    className={`flex flex-col flex-1 gap-6 bg-white p-6 sm:p-8 text-slate-900 ${expandedProgramIdsMobile?.[plan.productId] ? 'flex' : 'hidden'} md:flex`}
                  >
                    <p className="text-base leading-relaxed text-slate-600">{plan.description}</p>

                    <div className="py-2">
                      {plan.highlights.map((highlight, index) => (
                        <div
                          key={highlight.title}
                          className={`py-6 flex flex-col gap-1 ${
                            index !== plan.highlights.length - 1 ? 'border-b border-slate-100' : ''
                          }`}
                        >
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{highlight.title}</p>
                          <p className="text-sm font-medium text-slate-900 leading-relaxed">{highlight.detail}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        {activeLocale === 'lt' ? 'Į paketą įeina' : "What's included"}
                      </p>
                      <ul className="space-y-4">
                        {plan.extras.map(extra => (
                          <li key={extra} className="flex items-start gap-4 text-sm text-slate-600">
                            <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full glass-green-surface text-sm font-bold text-slate-900">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </span>
                            <span>{extra}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto space-y-8">
                      {plan.result && (
                        <div className="pt-6 border-t border-slate-100">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                            {activeLocale === 'lt' ? 'Rezultatas' : 'The Result'}
                          </p>
                          <p className="text-base font-medium text-slate-900 leading-relaxed">{plan.result}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => onBuyProgram(plan)}
                          className="inline-flex items-center gap-2 rounded-full glass-green-surface px-8 py-4 text-base font-semibold text-black transition hover:bg-slate-900 hover:text-white"
                        >
                          {activeLocale === 'lt' ? 'Pirkti' : 'Buy'}
                        </button>
                        <a
                          href="#kontaktai"
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition hover:border-accent hover:text-accent"
                        >
                          {activeLocale === 'lt' ? 'Nemokama konsultacija' : 'Free consultation'}
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {activeLocale === 'lt' && (
              <div className="mt-12 mx-auto max-w-4xl text-center">
                <p className="text-lg leading-relaxed text-black font-semibold">
                  Po apmokėjimo su Jumis susisieksiu ir suderinsiu nemokamą pirmąją nuotolinę konsultaciją. Jos metu įvertinsiu Jūsų kūno poreikius, galimybes ir tikslus. Po konsultacijos sudarysiu treniruočių planą – gyvą arba nuotolinę treniruotę – ir atsakysiu į visus Jums rūpimus klausimus.
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="sekmes" className="relative overflow-hidden py-28 text-white">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <img
              src={successImage}
              alt={activeLocale === 'lt' ? 'Klientų transformacijų fonas' : 'Client transformations background'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_60%)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center mb-8" data-aos="fade-up">
              <h2 className="font-heading text-4xl font-black uppercase text-white">
                {activeLocale === 'lt' ? 'Klientų istorijos' : 'Client stories'}
              </h2>
            </div>
            <div className="relative" data-aos="fade-up">
              <div
                ref={transformationsRef}
                className="keen-slider overflow-hidden will-change-transform"
              >
                {/* simplified loop: no overlay */}
                {transformationsByLocale[activeLocale].map((item, index) => {
                  const storyNumber = index + 1;
                  const photos = [
                    { key: 'before', ...item.before },
                    { key: 'after', ...item.after },
                  ];

                  const capitalizeFirst = (value) => {
                    const s = String(value || '').trim();
                    if (!s) return s;
                    const first = s[0];
                    const upper = first.toLocaleUpperCase('lt-LT');
                    return `${upper}${s.slice(1)}`;
                  };

                  const normalizeLtPeriod = (value) => {
                    const s = String(value || '').trim();
                    if (!s) return s;

                    // Specific common phrases from our results.
                    if (/^metus$/i.test(s)) return 'metai';
                    if (/^pusę\s+metų$/i.test(s)) return 'pusė metų';

                    let m = s.match(/^(\d+)\s+mėnes(ius|į)$/i);
                    if (m) {
                      const n = Number(m[1]);
                      if (!Number.isFinite(n)) return s;
                      if (n === 1) return '1 mėnuo';
                      if (n >= 10) return `${n} mėnesių`;
                      return `${n} mėnesiai`;
                    }

                    m = s.match(/^(\d+)\s+metus$/i);
                    if (m) {
                      const n = Number(m[1]);
                      if (!Number.isFinite(n)) return s;
                      if (n === 1) return '1 metai';
                      if (n >= 10) return `${n} metų`;
                      return `${n} metai`;
                    }

                    return s;
                  };

                  const extractPeriodFromResult = (resultText) => {
                    const s = String(resultText || '').trim();
                    if (!s) return null;

                    // Prefer a trailing "per ..." (LT) or "in ..." (EN) clause.
                    const m = s.match(/\s+(per|in)\s+([^.;,]+)\s*$/i);
                    if (!m) return null;

                    const raw = String(m[2] || '').trim();
                    if (!raw) return null;
                    return raw;
                  };

                  const stripPeriodFromResult = (resultText) => {
                    const s = String(resultText || '').trim();
                    if (!s) return s;
                    return s.replace(/\s+(per|in)\s+([^.;,]+)\s*$/i, '').trim();
                  };

                  const periodTextRaw = extractPeriodFromResult(item.result);
                  const periodText = periodTextRaw
                    ? (activeLocale === 'lt' ? capitalizeFirst(normalizeLtPeriod(periodTextRaw)) : periodTextRaw)
                    : null;
                  const resultTextPc = stripPeriodFromResult(item.result);

                  return (
                    <article
                      key={item.name}
                      className="keen-slider__slide glass-card group rounded-[36px] p-8 text-white transition-colors duration-500 ease-out hover:border-accent/60"
                    >
                      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
                        <div className="flex-1 space-y-6">
                          {/* removed: Kliento istorija and Asmeninis planas as requested */}
                          <h3 className="font-heading text-3xl font-black tracking-tight text-white">{item.name}</h3>
                          <dl className="space-y-3 text-sm text-white">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-5">
                              <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                                {activeLocale === 'lt' ? 'Tikslas' : 'Goal'}
                              </dt>
                              <dd className="mt-2 text-base font-medium text-white lg:text-lg">{item.goal}</dd>
                            </div>
                            {periodText ? (
                              <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-5">
                                <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                                  {activeLocale === 'lt' ? 'Laikotarpis' : 'Period'}
                                </dt>
                                <dd className="mt-2 text-base font-medium text-white lg:text-lg">{periodText}</dd>
                              </div>
                            ) : null}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-5">
                              <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                                {activeLocale === 'lt' ? 'Rezultatai' : 'Results'}
                              </dt>
                              <dd className="mt-2 text-base font-medium text-white lg:hidden">{item.result}</dd>
                              <dd className="mt-2 hidden text-base font-medium text-white lg:block lg:text-lg">{resultTextPc}</dd>
                            </div>
                          </dl>
                        </div>
                          <div className="flex flex-1 flex-row gap-4">
                          {photos.map(photo => (
                            (() => {
                              const photoLabel =
                                activeLocale === 'lt'
                                  ? photo.key === 'before'
                                    ? 'Prieš'
                                    : 'Po'
                                  : photo.key === 'before'
                                    ? 'Before'
                                    : 'After';
                              const altSuffix = activeLocale === 'lt'
                                ? (photo.key === 'before' ? 'transformacijos foto prieš' : 'transformacijos foto po')
                                : `transformation ${photoLabel.toLowerCase()}`;

                              const weightText = String(photo.weight || '').trim();
                              const weightParts = weightText ? weightText.split(/\s+/) : [];
                              const weightValue = weightParts[0] || weightText;
                              const weightUnit = weightParts.slice(1).join(' ');

                              return (
                                <figure
                                  key={photo.key}
                                  className="relative flex-1 overflow-hidden rounded-3xl border border-white/15"
                                >
                                  <img
                                    src={photo.image}
                                    alt={`${item.name} ${altSuffix}`}
                                    className="h-64 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] md:h-72 lg:h-[420px]"
                                    style={{ objectPosition: photo.objectPosition || 'center top' }}
                                    loading="lazy"
                                  />
                                  <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white sm:tracking-[0.3em]">
                                    <span>{photoLabel}</span>
                                    <span className="flex flex-col items-end leading-none text-sm tracking-normal">
                                      <span>{weightValue}</span>
                                      {weightUnit ? <span className="text-[10px] uppercase tracking-[0.2em]">{weightUnit}</span> : null}
                                    </span>
                                  </figcaption>
                                </figure>
                              );
                            })()
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-8 flex items-center justify-between gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => transformationsSlider.current?.prev()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-accent hover:text-accent"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  onClick={() => transformationsSlider.current?.next()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-accent hover:text-accent"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="paslaugos" className="bg-white text-slate-900">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="text-center" data-aos="fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{activeLocale === 'lt' ? 'Paslaugos' : 'Services'}</p>
              <h2 className="font-heading text-4xl font-black uppercase text-slate-900">
                {activeLocale === 'lt' ? 'Treniruotės ir sveikatingumo paslaugos' : 'Training & wellness services'}
              </h2>
              <p className="mt-3 text-base text-slate-600 sm:text-lg">
                {activeLocale === 'lt' ? 'Judėjimas, kuris keičia kūną, nuotaiką ir energiją!' : 'Movement that changes your body, mood, and energy!'}
              </p>
              <p className="mt-6 text-base text-slate-600 sm:text-lg">
                {activeLocale === 'lt'
                  ? 'Rask tau tinkamiausią būdą sportuoti – individualiai, su pora, grupe ar visa komanda.'
                  : 'Find the training style that fits you — 1:1, with a partner, in a group, or with your whole team.'}
              </p>
            </div>
            <div className="relative mt-16" data-aos="fade-up">
              <div key={`services-${activeLocale}`} ref={servicesRef} className="keen-slider">
                {servicesByLocale[activeLocale].map((service, index) => (
                  <div key={service.title} className="keen-slider__slide py-12 px-4">
                    <article
                      className="flex flex-col h-full overflow-hidden rounded-[32px] border border-slate-200 bg-white"
                    >
                      <figure className="relative h-56 w-full sm:h-64">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </figure>
                      <div className="flex flex-1 flex-col gap-6 p-8 text-slate-700">
                        <div>
                          <h3 className="font-heading text-2xl font-semibold text-slate-900">{service.title}</h3>
                          <p className="mt-4 text-sm leading-relaxed">{service.description}</p>
                        </div>
                        <ul className="space-y-2 text-sm">
                          {service.features.map(feature => (
                            <li key={feature} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full glass-green-surface" aria-hidden="true" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={() => servicesSlider?.current?.prev()}
                className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:border-accent hover:text-accent"
                aria-label={activeLocale === 'lt' ? 'Ankstesnė skaidrė' : 'Previous slide'}
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => servicesSlider?.current?.next()}
                className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:border-accent hover:text-accent"
                aria-label={activeLocale === 'lt' ? 'Kita skaidrė' : 'Next slide'}
              >
                &gt;
              </button>
            </div>
          </div>
        </section>

        <section
          className="relative overflow-hidden py-24 sm:py-32 lg:py-56"
          style={{ minHeight: 'clamp(420px, 96vw, 820px)' }}
        >
          <picture className="pointer-events-none absolute inset-0 z-0">
            <source type="image/avif" srcSet={contactImageSrcSetAvif} sizes="100vw" />
            <source type="image/webp" srcSet={contactImageSrcSetWebp} sizes="100vw" />
            <img
              src={contactImage}
              alt={activeLocale === 'lt' ? 'Kontaktų skilties fonas' : 'Contact section background'}
              srcSet={contactImageSrcSetWebp}
              sizes="100vw"
              className="h-full w-full object-cover object-[center_50%] md:object-[center_65%]"
              loading="lazy"
            />
          </picture>

          {/* Layered overlays for consistent text contrast - Mobile (Lighter) */}
          <div
            className="pointer-events-none absolute inset-0 z-10 md:hidden"
            aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.2) 65%, rgba(0,0,0,0.12) 100%)' }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-15 md:hidden"
            aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%)' }}
          />

          {/* Layered overlays for consistent text contrast - Desktop (Original) */}
          <div
            className="pointer-events-none absolute inset-0 z-10 hidden md:block"
            aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.15) 100%)' }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-15 hidden md:block"
            aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 60%)' }}
          />
          <div className="relative z-20">
            <div className="mx-auto max-w-6xl px-6 text-white" data-aos="fade-up">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] lg:items-center">
                <div className="space-y-5">
                  <h3 className="font-heading text-4xl font-black uppercase">
                    {activeLocale === 'lt'
                      ? 'Padovanok geresnę savijautą artimiesiems be papildomo streso.'
                      : 'Gift better well-being to someone you care about — without extra stress.'}
                  </h3>
                  <p className="text-base text-white/90">
                    {activeLocale === 'lt'
                      ? 'Pasirinkite sumą, o likusia dalimi pasirūpinsiu asmeniškai: tikslų aptarimas, individualus planas ir aiškios pirmosios užduotys.'
                      : 'Choose an amount and I’ll take care of the rest: goals, a personal plan, and clear first steps.'}
                  </p>
                </div>
                <div className="glass-card space-y-4 rounded-3xl p-6 text-sm text-white sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full glass-green-surface text-black font-semibold">01</span>
                    <span>{activeLocale === 'lt' ? 'Pasirinkite kupono vertę ir gavėją' : 'Choose the voucher amount and recipient'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full glass-green-surface text-black font-semibold">02</span>
                    <span>{activeLocale === 'lt' ? 'Sudarysiu personalizuotą planą ir tvarkaraštį' : 'We create a personalized plan and schedule'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full glass-green-surface text-black font-semibold">03</span>
                    <span>{activeLocale === 'lt' ? 'Stebėsiu pažangą ir suteiksiu grįžtamąjį ryšį' : 'We track progress and give feedback'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-4 text-sm sm:flex-row">
                <Link
                  to={activeLocale === 'lt' ? '/lt/dovanu-kuponas' : '/en/gift-card'}
                  className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 font-semibold text-black transition duration-200 hover:-translate-y-0.5"
                >
                  {activeLocale === 'lt' ? 'Pirkti dovanų kuponą' : 'Buy a gift voucher'}
                </Link>
                <Link
                  to={activeLocale === 'lt' ? '/lt/anketa' : '/en/questionnaire'}
                  className="inline-flex items-center justify-center rounded-full border border-white px-6 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:text-accent"
                >
                  {activeLocale === 'lt' ? 'Išbandyti nemokamai' : 'Try for free'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="istorijos" className="bg-white text-slate-900">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="flex flex-col gap-3 text-center" data-aos="fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                {activeLocale === 'lt' ? 'Gyvos patirtys' : 'Real experiences'}
              </p>
              <h2 className="font-heading text-4xl font-black uppercase text-slate-900">
                {activeLocale === 'lt' ? 'Klientų atsiliepimai' : 'Client testimonials'}
              </h2>
              <p className="text-base text-slate-600">
                {activeLocale === 'lt'
                  ? 'Tikros istorijos iš žmonių, kurie jaučiasi stipresni, sveikesni ir labiau pasitikintys savimi.'
                  : 'Real stories from people who feel stronger, healthier, and more confident.'}
              </p>
            </div>
            <div className="relative mt-16">
              <div ref={testimonialsRef} className="keen-slider overflow-visible">
                {storiesByLocale[activeLocale].map((story, index) => (
                  <div key={story.name} className="keen-slider__slide py-12 px-4">
                    <article
                      className="flex flex-col h-full rounded-[32px] border border-slate-200 bg-white/90 p-8"
                    >
                      <div>
                        <div className="flex items-center gap-4">
                          {story.avatar ? (
                            <img
                              src={story.avatar}
                              alt={activeLocale === 'lt' ? `Kliento nuotrauka — ${story.name}` : `Client photo — ${story.name}`}
                              className="h-14 w-14 rounded-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-500 uppercase">
                              {story.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-heading text-lg font-semibold text-slate-900">{story.name}</h3>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-accent" aria-hidden="true">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <svg
                              key={starIndex}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              vectorEffect="non-scaling-stroke"
                              paintOrder="stroke fill"
                              className="h-4 w-4 stroke-black"
                            >
                              <path d="M9.049 2.927a1 1 0 0 1 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462a1 1 0 0 1 .588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292a1 1 0 0 1-1.538 1.118L10 13.347l-2.987 2.133a1 1 0 0 1-1.538-1.118l1.07-3.292a1 1 0 0 0-.364-1.118l-2.8-2.034a1 1 0 0 1 .588-1.81h3.462a1 1 0 0 0 .95-.69z" />
                            </svg>
                          ))}
                          <span className="sr-only">{activeLocale === 'lt' ? '5 iš 5 žvaigždučių' : '5 out of 5 stars'}</span>
                        </div>
                      </div>
                      <p className="mt-6 text-sm leading-relaxed text-slate-600">{story.quote}</p>
                    </article>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => testimonials?.current?.prev()}
                className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:border-accent hover:text-accent"
                aria-label="Previous slide"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => testimonials?.current?.next()}
                className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:border-accent hover:text-accent"
                aria-label="Next slide"
              >
                &gt;
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2" data-aos="fade-up">
            <div className="space-y-6">
              <h3 className="font-heading text-4xl font-black uppercase text-black">
                {activeLocale === 'lt' ? 'Galiu jums padėti, jei siekiate:' : 'I can help you if you want to:'}
              </h3>
              <ul className="grid gap-3 text-base text-black">
                {helpListByLocale[activeLocale].map(item => (
                  <li key={item} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full glass-green-surface text-black">+</span>

                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6" data-aos="fade-up" data-aos-delay="100">
              <h3 className="font-heading text-4xl font-black uppercase text-black">
                {activeLocale === 'lt' ? 'Negaliu jums padėti, jeigu:' : "I'm not a fit if you:"}
              </h3>
              <ul className="grid gap-3 text-base text-black">
                {notHelpListByLocale[activeLocale].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">-</span>

                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="kontaktai" className="relative overflow-hidden py-24">
          <img
            src={contactImage}
            alt={activeLocale === 'lt' ? 'Asmeninio trenerio kontaktų fonas' : 'Contact background'}
            className="absolute inset-0 -z-30 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 -z-20 bg-white/75 backdrop-blur-sm" />
          <div className="absolute inset-0 -z-10 bg-white/60" />
          <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* On phones, show the form first then the descriptive text. On lg+ keep original order. */}
          <div className="order-2 lg:order-1 space-y-8 text-black">
                <div className="space-y-4">
                  <h2 className="font-heading text-4xl font-black uppercase">{activeLocale === 'lt' ? 'Susisiekite dabar' : 'Contact me'}</h2>
                  <p className="text-base text-black">
                    {activeLocale === 'lt'
                      ? 'Įveskite savo kontaktus ir per 24 valandas suderinsime individualų susitikimo laiką bei aptarsime jūsų tikslus.'
                      : 'Leave your contact details and we’ll schedule a time within 24 hours to discuss your goals.'}
                  </p>
                </div>
                <div className="space-y-4 text-sm text-black">
                  <p className="font-semibold text-black">{activeLocale === 'lt' ? 'Ką gausite:' : 'What you get:'}</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full glass-green-surface text-black">+</span>
                      <span>{activeLocale === 'lt' ? 'Asmeninį įvertinimą ir aiškų startą' : 'A clear starting point and assessment.'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full glass-green-surface text-black">+</span>
                      <span>{activeLocale === 'lt' ? 'Pritaikytas mitybos bei treniruočių kryptis' : 'Nutrition and training direction tailored to you.'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full glass-green-surface text-black">+</span>
                      <span>{activeLocale === 'lt' ? 'Atsakymus į visus klausimus apie treniruočių procesą' : 'Answers to all your questions about the process.'}</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 space-y-4">
                  <h3 className="font-heading text-4xl font-black uppercase">{activeLocale === 'lt' ? 'Mane rasite:' : 'You can find me at:'}</h3>
                  {partnerLogos.map(partner => (
                    <a
                      key={partner.name}
                      href={partner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm transition hover:border-black/20 hover:shadow-md"
                    >
                      {partner.logoInline ? (
                        <span aria-label={activeLocale === 'lt' ? `${partner.name} logotipas` : `${partner.name} logo`}>
                          {partner.logoInline}
                        </span>
                      ) : (
                        <img
                          src={partner.logo}
                          alt={activeLocale === 'lt' ? `${partner.name} logotipas` : `${partner.name} logo`}
                          className="h-12 w-auto"
                          loading="lazy"
                        />
                      )}
                      <div className="ml-auto flex items-center gap-3 text-right">
                        <span className="text-lg font-semibold text-black">{partner.name}</span>
                        <span className="text-2xl text-black" aria-hidden="true">
                          &rarr;
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              <form
                className="order-1 lg:order-2 space-y-5 rounded-[32px] bg-white p-8 text-black shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setContactNotice(null);
                  setContactError(null);
                  setContactBusy(true);

                  try {
                    const base = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
                    if (!base) throw new Error('Missing VITE_SUPABASE_FUNCTIONS_URL');
                    const url = `${String(base).replace(/\/$/, '')}/contact-form`;

                    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                    if (!anonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY');

                    const form = event.currentTarget;
                    const fd = new FormData(form);

                    const payload = {
                      locale: activeLocale,
                      name: String(fd.get('name') || '').trim(),
                      phone: String(fd.get('phone') || '').trim(),
                      email: String(fd.get('email') || '').trim(),
                      message: String(fd.get('message') || '').trim(),
                      page_url: typeof window !== 'undefined' ? window.location.href : null,
                    };

                    const headers = {
                      'Content-Type': 'application/json',
                      apikey: anonKey,
                      Authorization: `Bearer ${anonKey}`,
                    };

                    // Supabase Edge Functions gateway expects both `apikey` and `Authorization`.
                    // New-format keys like `sb_publishable_...` are not JWTs, but still must be sent
                    // as `Authorization: Bearer <key>` for the gateway to authorize the request.

                    const resp = await fetch(url, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify(payload),
                    });

                    const body = await resp.json().catch(() => ({}));
                    if (!resp.ok) {
                      const code = body?.error || body?.message || `http_${resp.status}`;
                      const err = new Error(code);
                      err.status = resp.status;
                      throw err;
                    }

                    setContactNotice(
                      activeLocale === 'lt'
                        ? 'Ačiū! Jūsų žinutė išsiųsta. Susisieksiu kuo greičiau.'
                        : 'Thanks! Your message was sent. I will contact you soon.'
                    );
                    form.reset();
                  } catch (e) {
                    const status = Number(e?.status || 0);
                    if (status === 401) {
                      setContactError(
                        activeLocale === 'lt'
                          ? 'Nepavyko išsiųsti (401). Patikrinkite VITE_SUPABASE_ANON_KEY ir VITE_SUPABASE_FUNCTIONS_URL (ar tai tas pats Supabase projektas) bei ar contact-form Edge Function leidžia anoniminius kvietimus.'
                          : 'Failed to send (401). Check VITE_SUPABASE_ANON_KEY and VITE_SUPABASE_FUNCTIONS_URL (same Supabase project) and that the contact-form Edge Function allows anonymous calls.'
                      );
                      return;
                    }
                    setContactError(
                      activeLocale === 'lt'
                        ? 'Nepavyko išsiųsti. Pabandykite dar kartą.'
                        : 'Failed to send. Please try again.'
                    );
                  } finally {
                    setContactBusy(false);
                  }
                }}
              >
                {contactNotice ? (
                  <div role="status" className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm">
                    <div className="font-semibold">{activeLocale === 'lt' ? 'Išsiųsta' : 'Sent'}</div>
                    <div className="mt-1 text-black/70">{contactNotice}</div>
                  </div>
                ) : null}
                {contactError ? (
                  <div role="alert" className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-black shadow-sm">
                    <div className="font-semibold">{activeLocale === 'lt' ? 'Klaida' : 'Error'}</div>
                    <div className="mt-1 text-black/70">{contactError}</div>
                  </div>
                ) : null}
                <div>
                  <label htmlFor="name" className="text-sm font-semibold text-black">
                    {activeLocale === 'lt' ? 'Jūsų vardas' : 'Your name'}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={activeLocale === 'lt' ? 'Įrašykite savo vardą' : 'Enter your name'}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-black placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-semibold text-black">
                    {activeLocale === 'lt' ? 'Telefonas' : 'Phone'}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={activeLocale === 'lt' ? 'Pageidaujamas kontaktinis numeris' : 'Preferred phone number'}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-black placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-black">
                    {activeLocale === 'lt' ? 'El. paštas *' : 'Email *'}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={activeLocale === 'lt' ? 'Susisieksiu su jumis čia' : 'I will contact you here'}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-black placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-semibold text-black">
                    {activeLocale === 'lt' ? 'Žinutė *' : 'Message *'}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder={activeLocale === 'lt' ? 'Aprašykite savo tikslus arba klausimus' : 'Describe your goals or questions'}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-black placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <label className="flex items-center gap-3 text-sm text-black cursor-pointer group">
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      required
                    />
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white transition-all peer-checked:border-[#DCF41E] peer-checked:bg-[#DCF41E] peer-focus:ring-2 peer-focus:ring-[#DCF41E] peer-focus:ring-offset-2"></div>
                    <svg 
                      className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 transition-opacity peer-checked:opacity-100" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>
                    {activeLocale === 'lt' ? 'Sutinku su ' : 'I agree to the '}
                    <a
                      href={activeLocale === 'lt' ? '/lt/privatumas' : '/en/privacy'}
                      className="underline underline-offset-2 hover:text-accent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {activeLocale === 'lt' ? 'privatumo politika' : 'privacy policy'}
                    </a>
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={contactBusy}
                  className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-black"
                >
                  {contactBusy
                    ? (activeLocale === 'lt' ? 'Siunčiama…' : 'Sending…')
                    : (activeLocale === 'lt' ? 'Siųsti užklausą' : 'Send message')}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-accent py-32 text-center flex justify-center">
          <img
            src={fromUploads('Branding/Pozityvi-full-TP-RGB.png')}
            alt="Kaliadziuk"
            className="h-32 w-auto object-contain"
            loading="lazy"
          />
        </section>
      </main>

      <footer className="border-t border-black bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-black md:flex-row md:items-center md:justify-between">
          <p>Kaliadziuk &copy; 2026. Visos teises saugomos.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/pavel_kaliadziuk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black transition hover:text-accent"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/povilas.pasa.3/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black transition hover:text-accent"
              aria-label="Facebook"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
          <a
            href={activeLocale === 'lt' ? '/lt/privatumas' : '/en/privacy'}
            className="text-sm font-medium text-black transition hover:text-accent"
          >
            {activeLocale === 'lt' ? 'Privatumo politika' : 'Privacy policy'}
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
