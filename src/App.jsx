import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { addItem, loadCart, saveCart } from './state/cart';
import CartToast from './components/CartToast';
import { getProductImageUrl } from './lib/productImages';

const fromUploads = file => new URL(`../uploads/${file}`, import.meta.url).href;

const heroImageDesktop = fromUploads('IMG_0443-scaled.jpg');
const heroImageMobile = fromUploads('IMG_0441-modified-scaled-e1750335226133.jpg');
const successImage = fromUploads('grupine5.jpg');

const contactImage = fromUploads('IMG_0469-scaled.jpg');

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

const Hero = ({ stats, backgroundDesktop, backgroundMobile, title, ctaLabel }) => (
  <section id="hero" className="relative min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)] overflow-hidden text-white">
    <picture className="pointer-events-none absolute inset-0 z-0">
      {backgroundMobile ? <source media="(max-width: 768px)" srcSet={backgroundMobile} /> : null}
      <img
        src={backgroundDesktop}
        alt=""
        className="h-full w-full object-cover"
        style={{ objectPosition: 'center 30%' }}
        aria-hidden="true"
        loading="eager"
      />
    </picture>

    {/* Layered overlays for consistent text contrast */}
    <div
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
      style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.15) 100%)' }}
    />
    <div
      className="pointer-events-none absolute inset-0 z-15"
      aria-hidden="true"
      style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 60%)' }}
    />
  <div className="relative z-20 mx-auto flex min-h-full w-full max-w-7xl flex-col items-start px-6 pt-60 pb-20 sm:pt-72 sm:pb-24 lg:pt-80 lg:pb-28">
  <div className="max-w-4xl mx-auto text-center space-y-8" data-aos="fade-up">
        <h1 className="font-heading text-3xl font-extrabold uppercase leading-tight sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]">
          {title}
        </h1>
        <div className="flex w-full justify-center flex-col gap-4 sm:w-auto sm:flex-row">
          <a
            href="#programos"
            className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 text-xl font-extrabold text-black shadow-lg transition-transform duration-150 hover:-translate-y-1 sm:px-8 sm:py-4 sm:text-2xl"
          >
            {ctaLabel}
          </a>
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
    productId: PROGRAM_IDS.weightLoss,
    cartName: 'Svorio metimo planas',
    unitPriceCents: 10000,
    title: 'Svorio metimo',
    subtitle: 'Lengvesnis kūnas ir daugiau energijos',
    description:
      'Aštuonių savaičių kelionė, kuri derina švelniai agresyvią mitybos strategiją, riebalų deginimo treniruotes ir emocinį palaikymą. Kiekvieną savaitę peržiūrime žingsnius, miego higieną ir kraujo žymenis, kad korekcijos būtų tikslios, o motyvacija – stabili.',
    price: '100€',
    duration: '8 savaitės',
    image: fromUploads('brokolis.jpg'),
    highlights: [
      {
        title: 'Personalizuota mitybos architektūra',
        detail: 'Sudarau makroelementų paskirstymą pagal hormonų balansą ir darbų ritmą, pridedu receptus su realistiška prep trukme.',
      },
      {
        title: 'Kintančios treniruočių fazės',
        detail: 'HIIT ir žemo pulso blokai rotuojami kas dvi savaites, kad kūnas nuolat gautų naują stimulą be perdegimo.',
      },
      {
        title: 'Mindset ir atsistatymas',
        detail: 'Kvėpavimo protokolai, limfodrenažiniai tempimai ir trumpi audio įrašai, padedantys laikytis plano net stresinėmis dienomis.',
      },
    ],
    extras: [
      'Savaitinis progreso „health report“ su korekcijomis',
      'Receptų biblioteka ir apsipirkimo sąrašai kiekvienai savaitei',
      'WhatsApp palaikymas darbo dienomis 9–18 val.',
    ],
  },
  {
    productId: PROGRAM_IDS.muscleGain,
    cartName: 'Raumenų auginimo planas',
    unitPriceCents: 10000,
    title: 'Raumenų auginimo',
    subtitle: 'Didesnė jėga ir aiškiai matoma forma',
    description:
      'Programa sukurta žmonėms, kurie nori ne tik priaugti svorio, bet ir jaustis funkcionaliai stiprūs. Dirbame ciklais – nuo nervų sistemos adaptacijos iki progresuojančių apkrovų, kartu prižiūrint hormonų ir baltymų balansą.',
    price: '100€',
    duration: '10 savaičių',
    image: fromUploads('paaugliu4.jpg'),
    highlights: [
      {
        title: 'Jėgos ir hipertrofijos blokai',
        detail: 'Periodizuotas split planas su RPE gairėmis ir technikos video analizėmis kas dvi savaites.',
      },
      {
        title: 'Mityba testosterono palaikymui',
        detail: 'Didinu kalorijų kiekį laipsniškai, kad augtų švarūs raumenys, o virškinimo sistema suspėtų prisitaikyti.',
      },
      {
        title: 'Pažangos laboratorija',
        detail: 'Naudojame skenavimus ir mobilųjį žurnalą, kuris vizualiai rodo apimčių ir svorių pokytį.',
      },
    ],
    extras: [
      'Kas savaitę koreguojamas darbo svorių grafikas',
      'Papildų protokolas (nebūtinas, bet rekomenduojamas)',
      'Prieiga prie trumpo mobilumo „primer“ prieš kiekvieną sesiją',
    ],
  },
  {
    productId: PROGRAM_IDS.homeTraining,
    cartName: 'Namų treniruotės planas',
    unitPriceCents: 10000,
    title: 'Namų treniruotė',
    subtitle: 'Studijos kokybė tavo svetainėje',
    description:
      'Jei neturi galimybės lankytis sporto klube, visa programa atkeliauja pas tave – nuo dviem hanteliais atliekamų kompleksų iki kūno peso blokų su tempimo ritualais. Vaizdo įrašai ir gyvos korekcijos leidžia jaustis taip, lyg treneris būtų šalia.',
    price: '100€',
    duration: '6 savaitės',
    image: fromUploads('grupine8.jpg'),
    highlights: [
      {
        title: 'Adaptuota įrangai, kurią turi',
        detail: 'Nesvarbu, ar tai pasipriešinimo gumos, ar vienas kettlebellis – planą pritaikau tavo realiam inventorui.',
      },
      {
        title: 'Gyvi „form-check“ skambučiai',
        detail: 'Kas dvi savaites prisijungiame trumpam video skambučiui, kad pakoreguotume techniką ir atsakytume į klausimus.',
      },
      {
        title: 'Regeneracijos ritualai',
        detail: 'Įtraukta trumpa mobilumo seka kiekvienai dienai ir savaitgalio „reset“ sesija stuburui.',
      },
    ],
    extras: [
      'Priminimų sistema telefone, kad nepraleistum treniruotės',
      'Spotify grojaraščiai pagal treniruotės intensyvumą',
      'Prisijungimas prie bendruomenės pokalbių kambario',
    ],
  },
  {
    productId: PROGRAM_IDS.mobility,
    cartName: 'Mobilumo lavinimo planas',
    unitPriceCents: 10000,
    title: 'Mobilumo lavinimo',
    subtitle: 'Lengvas kūnas kasdieniame judesyje',
    description:
      'Skirta žmonėms, kurie nori išmanyti savo kūną, atsikratyti įtampos ir pagerinti laikyseną. Dirbame lėtai, bet tikslingai – deriname fascijų atpalaidavimą, aktyvius tempimus ir funkcinį stabilizavimą.',
    price: '100€',
    duration: '5 savaitės',
    image: fromUploads('testavimas8.jpg'),
    highlights: [
      {
        title: 'Tempimo ir kvėpavimo duetai',
        detail: 'Kiekviena seka turi audio instrukcijas, kad žinotum, kur turi jaustis tempimas ir kaip kvėpuoti.',
      },
      {
        title: 'Funkciniai pratimai',
        detail: 'Stipriname stabilizuojančius raumenis aplink klubus, pečius ir stuburą, kad laikysena išliktų natūrali.',
      },
      {
        title: 'Laikysenos diagnostika',
        detail: 'Prieš pradedant gauni video analizę bei individualius pataisymus, kuriuos peržiūrime kurso pabaigoje.',
      },
    ],
    extras: [
      'Kas savaitę – trumpas vakarinis ritualas sąnariams',
      'Darbo vietos ergonomikos gidas',
      'Praktinių užrašų knygutė su progreso žymomis',
    ],
  },
];

const programsEn = [
  {
    productId: PROGRAM_IDS.weightLoss,
    cartName: 'Weight loss plan',
    unitPriceCents: 10000,
    title: 'Weight loss',
    subtitle: 'A lighter body and more energy',
    description:
      'An 8‑week plan combining nutrition structure, fat‑loss training blocks, and weekly support. We adjust steps, recovery, and intensity to keep progress steady and sustainable.',
    price: '100€',
    duration: '8 weeks',
    image: fromUploads('brokolis.jpg'),
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
    unitPriceCents: 10000,
    title: 'Muscle gain',
    subtitle: 'More strength and visible shape',
    description:
      'A structured plan for functional strength and muscle growth. We progress loads in cycles and keep nutrition aligned with recovery and performance.',
    price: '100€',
    duration: '10 weeks',
    image: fromUploads('paaugliu4.jpg'),
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
    unitPriceCents: 10000,
    title: 'Home training',
    subtitle: 'Gym quality at home',
    description:
      'A complete program adapted to the equipment you have. Technique guidance and check‑ins make it feel like coaching is right next to you.',
    price: '100€',
    duration: '6 weeks',
    image: fromUploads('grupine8.jpg'),
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
    cartName: 'Mobility plan',
    unitPriceCents: 10000,
    title: 'Mobility',
    subtitle: 'Move better every day',
    description:
      'For people who want less stiffness and better posture. We combine release work, active mobility, and functional stability to make movement feel easy again.',
    price: '100€',
    duration: '5 weeks',
    image: fromUploads('testavimas8.jpg'),
    highlights: [
      {
        title: 'Mobility + breathing',
        detail: 'Guided sequences so you know what to feel and how to breathe.',
      },
      {
        title: 'Functional stability',
        detail: 'Strength around hips, shoulders, and spine for lasting posture changes.',
      },
      {
        title: 'Posture baseline',
        detail: 'Start with a simple assessment and track improvements.',
      },
    ],
    extras: ['Weekly evening joint routine', 'Workstation ergonomics guide', 'Practical progress notes'],
  },
];

const programsByLocale = {
  lt: programsLt,
  en: programsEn,
};

const stories = [
  {
    name: 'Ingrida Brazytė-Česevičienė',
    avatar: fromUploads('atsiliepimai/470469671_9420998764591504_1367316031802033160_n-e1743524043787.jpg'),
    quote:
      '“Pavelas – profesionalus, atidus, nuoširdus treneris ir puikus motyvatorius! Lankausi jau daugiau nei tris mėnesius, ir dar nė viena treniruotė nebuvo tokia pati. Treniruotės pralekia greitai ir nenuobodžiai! Svarbiausia – po kiekvienos treniruotės jaučiu, kad turiu raumenukus, tačiau niekada nebuvo taip, kad dėl stipraus skausmo neišlipčiau iš lovos.”',
  },
  {
    name: 'Dovydas Sem',
    avatar: fromUploads('atsiliepimai/485767155_2433248600372198_5450357866485351546_n-e1743523994763.jpg'),
    quote:
      '“Sportuoju pas Pavelą jau antrus metus ir tikrai nesiruošiu sustoti! Drįsčiau teigti, kad treniruotės su juo – geriausias mano pasirinkimas. Jis gali jaunimui padėti susikurti itin tvirtą pagrindą sporte, supažindinti su įvairiais pratimais ir jų veikimo principais bei skatinti sveiką gyvenseną. Su šiuo treneriu niekada nebūna nuobodu – pratimų įvairovė ir nuolatinis bendravimas tiesiog kviečia į salę!”',
  },
  {
    name: 'Artūras Kozlov',
    avatar: fromUploads('atsiliepimai/394284740_6710013242385928_5528573044851569625_n.jpg'),
    quote:
      '“Atsakingas, kvalifikuotas ir savo darbą mylintis treneris. Matosi, kad kiekvienai treniruotei kruopščiai pasiruošia – parenka tinkamą krūvį ir ateina su būtent tau pritaikytu treniruotės planu, o ne „copy-paste“ schema visiems. Pratimai įvairūs ir įdomūs, nėra monotonijos – visada išmoksti kažką naujo. Kas labai svarbu – Pavelas yra be galo dėmesingas: visos treniruotės metu stebi techniką, paaiškina kiekvieno pratimo paskirtį ir naudą. Jokio broko tikrai nepraleis!”',
  },
  {
    name: 'Julia Gatsko',
    avatar: fromUploads('atsiliepimai/Picture1 (1).jpg'),
    quote:
      '“Pasha stands out with his professionalism and scientific approach – he considers your health and body condition, helping you not only look fit but also feel better. I’ve been training with him for almost a year and see great improvements in both fitness and overall well-being. Highly recommended!”',
  },
  {
    name: 'Justė Perveneckaitė',
    avatar: fromUploads('atsiliepimai/Picture2-1.jpg'),
    quote:
      '“Esu sportininkė, kuri anksčiau susidūrė su įvairiais raumenų disbalansais, tačiau trenerio sudaryta individuali programa padėjo juos išspręsti ir sustiprėti. Ypač vertinu jo pagalbą atsistatymo procese bei traumų prevencijoje, kas man labai svarbu siekiant ilgalaikių rezultatų. Treneris itin malonus, dėmesingas ir visada nuoširdžiai atsako į visus rūpimus klausimus.”',
  },
  {
    name: 'Edvard Korovacki',
    avatar: fromUploads('atsiliepimai/Picture3 (1).jpg'),
    quote:
      '“Pavel is an outstanding trainer who considers personal needs, motivates, and gives clear feedback. His knowledge covers not only exercises but also nutrition and recovery, helping to achieve real results. Trainings are always full of positive energy, and with him you feel welcome and inspired every time.”',
  },
  {
    name: 'Greta Valasinavičiūtė',
    avatar: fromUploads('atsiliepimai/373064400_6180419855414750_1227222582074733444_n.jpg'),
    quote:
      '“Pavelas – nuostabus treneris, o kiekviena treniruotė pas jį – motyvacijos, energijos ir žinių šaltinis. Su nekantrumu laukiu kiekvienos treniruotės! Profesionalumas garantuotas – rekomenduoju!”',
  },
  {
    name: 'Tadas Kibirkštis',
    avatar: fromUploads('atsiliepimai/302925805_5629860167034966_3216542933912186510_n.jpg'),
    quote:
      '“Pavelas – tikras savo srities profesionalas. Įsigilina į situaciją, atidžiai parenka pratimus pagal būklę ir savijautą, o rezultatas jaučiasi iškart. Jis – žmogus, mylintis savo darbą ir atsiduodantis jam 100 %. Ačiū Jam ir tikrai rekomenduoju kitiems!”',
  },
  {
    name: 'Ūlė Julija Masteikaitė',
    avatar: fromUploads('atsiliepimai/Screenshot-2025-03-19-at-5.40.07PM.png'),
    quote:
      '“Pavelas yra the absolute best 🫶 Susidūrus su nugaros skausmo problema, padėjo ją spręsti bei pasiūlė daug prevencinių pratimų. Viską aiškina suuuuper detaliai - ne tik kaip atlikti pratimą, bet taip pat ir kokie raumenys dirba bei visapusę pratimo naudą. Po treniruotės lieki ne tik pasportavęs, bet ir sužinojęs daug dalykų apie savo kūną, laikyseną, mobilumą.”',
  },
  {
    name: 'Roma Šablinskienė',
    avatar: fromUploads('atsiliepimai/459630769_10230433925305293_4458957318428687233_n.jpg'),
    quote:
      '“Kaip visišką nedraugystę su sportu paversti meile sportui? Lengva – tereikia Pavelo pagalbos! Labai atsargiai, ilgai dairydamasi iš tolo ieškojau, kas man padėtų prisijaukinti šį „žvėrį“. Įvairūs bandymai grupinėse treniruotėse būdavo trumpalaikiai, todėl beveik buvau nurašiusi sportą kaip „ne mano arkliuką“. Tačiau jau po pirmos treniruotės supratau, kad su Pavelu – tobula chemija! Jis tikras profesionalas, nenaudojantis vienos schemos visiems. Respektas!”',
  },
  {
    name: 'Evelina Jurčiukonytė',
    avatar: fromUploads('atsiliepimai/302925805_5629860167034966_3216542933912186510_n.jpg'),
    quote:
      '“Vienas geriausių sprendimų – treniruotis pas Pavelą! Jis puikiai išmano savo darbą, įsiklauso į kliento poreikius bei norus, yra labai atsakingas, mylintis savo profesiją ir tiksliai žinantis, ką daro. Treniruotės praskrieja akimirksniu!”',
  },
];

const transformations = [
  {
    name: 'TADAS NORUŠAITIS',
    program: 'Jėgos ir raumenų auginimo',
    goal: 'Geras fizinis pasiruošimas ir mažesnis riebalinis audinys',
    result: 'Priaugo 15 kg raumenų per 9 mėnesius',
    before: {
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/04/before-2.jpg',
      label: 'Foto prieš',
      weight: '105 kg',
    },
    after: {
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/04/after-2.jpg',
      label: 'Foto po',
      weight: '90 kg',
    },
  },
  {
    name: 'ATŪRAS KOZLOV',
    program: 'Jėgos ir raumenų auginimo',
    goal: 'Bendras fizinis pasiruošimas su akcentu į svorio metimą',
    result: 'Numetė 30 kg per metus',
    before: {
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/04/before-3.jpg',
      label: 'Foto prieš',
      weight: '118 kg',
    },
    after: {
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/04/after-3.jpg',
      label: 'Foto po',
      weight: '88 kg',
    },
  },
  {
    name: 'ROKAS RUTKAUSKAS',
    program: 'Svorio metimo',
    goal: 'Sumažinti riebalinį audinį išlaikant raumeninę masę',
    result: 'Numetė 42 kg per pusę metų',
    before: {
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/04/before-1.jpg',
      label: 'Foto prieš',
      weight: '125 kg',
    },
    after: {
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/04/after-1.jpg',
      label: 'Foto po',
      weight: '83 kg',
    },
  },
  {
    name: 'JOLITA VARNAGIRIENĖ',
    program: 'Svorio metimo',
    goal: 'Daugiau energijos, stipresnė sveikata ir lengvesnis kūnas',
    result: 'Numetė 7 kg per 4 mėnesius',
    before: {
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/09/Unknown-4.jpg',
      label: 'Foto prieš',
      weight: '67 kg',
    },
    after: {
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/09/Po2-1.jpg',
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
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/09/IMG_6824-scaled.jpg',
      label: 'Foto prieš',
      weight: '63 kg',
    },
    after: {
      image: 'https://kaliadziuk.lt/wp-content/uploads/2025/09/Bicepsa-scaled.jpg',
      label: 'Foto po',
      weight: '73 kg',
    },
  },
];

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
  'Nenorite įsitraukti į mitybos ir gyvenimo būdo pokyčius',
  'Ieškote „stebuklingų“ papildų ar trumpų kelių',
  'Atsisakote laikytis individualiai sudaryto plano',
  'Neturite laiko bent kelioms treniruotėms per savaitę',
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
    image: fromUploads('testavimas4.jpg'),
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
    image: fromUploads('IMG_0458-scaled.jpg'),
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
    image: fromUploads('paaugliu2.jpg'),
    description:
      'Individualus dėmesys, aiškus planas ir realūs rezultatai. Gauk profesionalų palaikymą kiekviename žingsnyje.',
    features: ['100 % dėmesio vienam klientui', 'Aiškios treniruočių struktūros', 'Motyvacija ir atsakomybė'],
  },
  {
    title: 'Online coaching',
    image: fromUploads('Planu_darymas3.jpg'),
    description:
      'Sportuok bet kur – gautas planas, palaikymas ir atskaitomybė padeda išlikti kelyje į tikslą net kelionėje.',
    features: ['Individualus nuotolinis planas', 'Reguliarus palaikymas ir grįžtamasis ryšys', 'Treniruočių korekcijos pagal progresą'],
  },
  {
    title: 'Treniruotės jūsų namuose',
    image: fromUploads('grupine8.jpg'),
    description:
      'Treneris atvyksta pas jus! Patogus ir saugus sportas, pritaikytas jūsų erdvei, tikslams ir galimybėms.',
    features: ['Inventoriaus pritaikymas namų erdvei', 'Treniruočių grafikas pagal jūsų laiką', 'Asmeninis dėmesys ir saugumas'],
  },
  {
    title: 'Grupinės treniruotės – Varėnoje ir Vilniuje',
    image: fromUploads('grupine1.jpg'),
    description:
      'Energija, kuri užkrečia! Sportuokite mažose ar didelėse grupėse, jauskite palaikymą ir bendrumą.',
    features: ['Skirtingo dydžio grupės', 'Motyvuojanti ir pozityvi atmosfera', 'Idealiai tinka socialiai motyvuotiems sportui'],
  },
  {
    title: 'Sportas poroje',
    image: fromUploads('IMG_0469-scaled.jpg'),
    description:
      'Labai populiarus pasirinkimas! Dviguba motyvacija ir bendras tikslas stiprina kūną bei santykį.',
    features: ['Planai pritaikyti dviem žmonėms', 'Bendro progreso sekimas', 'Treniruotės, kurios stiprina ryšį'],
  },
  {
    title: 'Paauglių grupinės treniruotės – Varėnoje',
    image: fromUploads('paaugliu-grupine.jpg'),
    description:
      'Saugi, smagi ir lavinanti aplinka jauniems sportininkams. Stiprėk, gerink laikyseną, pasitikėjimą ir fizinį pasirengimą!',
    features: ['Amžiui pritaikyti pratimai', 'Dėmesys laikysenai ir fiziniam pasirengimui', 'Palaikanti ir draugiška bendruomenė'],
  },
  {
    title: 'Senjorų treniruotės – sporto salėje ir baseine',
    image: fromUploads('senjoru5.jpg'),
    description:
      'Švelnios, bet veiksmingos treniruotės geresnei savijautai, lankstumui ir gyvenimo džiaugsmui. Judėjimas tinka visiems!',
    features: ['Mažo poveikio pratimai salėje ir baseine', 'Gerina lankstumą ir balansą', 'Pritaikoma individualioms galimybėms'],
  },
];

const servicesEn = [
  {
    title: 'Assessment training + body analysis + plan setup',
    image: fromUploads('testavimas4.jpg'),
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
    image: fromUploads('IMG_0458-scaled.jpg'),
    description: 'Boost energy and well-being with short, effective sessions during the workday.',
    features: ['Schedule aligned with your team', 'Short but efficient sessions', 'Supports productivity and team culture'],
  },
  {
    title: 'Personal training — Vilnius and Varėna',
    image: fromUploads('paaugliu2.jpg'),
    description: 'Individual attention, a clear plan, and real results with accountability.',
    features: ['100% focus on you', 'Clear training structure', 'Motivation and responsibility'],
  },
  {
    title: 'Online coaching',
    image: fromUploads('Planu_darymas3.jpg'),
    description: 'Train anywhere with a plan, feedback and accountability that keeps you on track.',
    features: ['Personal remote plan', 'Regular support and feedback', 'Adjustments based on progress'],
  },
  {
    title: 'Training at your home',
    image: fromUploads('grupine8.jpg'),
    description: 'Convenient and safe training adapted to your space, goals, and capabilities.',
    features: ['Adapted to your space/equipment', 'Schedule that fits you', 'Personal attention and safety'],
  },
  {
    title: 'Group training — Varėna and Vilnius',
    image: fromUploads('grupine1.jpg'),
    description: 'High-energy sessions with community support and a great atmosphere.',
    features: ['Different group sizes', 'Positive motivating atmosphere', 'Great if you like social training'],
  },
  {
    title: 'Partner training (2 people)',
    image: fromUploads('IMG_0469-scaled.jpg'),
    description: 'A popular choice: shared goals and double motivation build consistency.',
    features: ['Plans for two', 'Shared progress tracking', 'Sessions that build habits'],
  },
  {
    title: 'Teen group training — Varėna',
    image: fromUploads('paaugliu-grupine.jpg'),
    description: 'A safe and fun environment: strength, posture, confidence, and athletic basics.',
    features: ['Age-appropriate exercises', 'Focus on posture and fundamentals', 'Supportive community'],
  },
  {
    title: 'Senior training — gym and pool',
    image: fromUploads('senjoru5.jpg'),
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

const partnerLogos = [
  { name: 'Vilnius Outlet', logo: fromUploads('logo-light.svg') },
  { name: 'VSC', logo: fromUploads('image.png') },
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
  const [isDesktop, setIsDesktop] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);

  const cartPath = activeLocale === 'lt' ? '/lt/krepselis' : '/en/cart';

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

    // Show a popup instead of redirecting.
    setToastOpen(true);
  };

  const [testimonialsRef, testimonials] = useKeenSlider({
    loop: true,
    mode: 'snap',
    renderMode: 'performance',
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
  });

  const [servicesRef, servicesSlider] = useKeenSlider({
    loop: true,
    mode: 'snap',
    renderMode: 'performance',
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
  });

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
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 7000);
        }

        slider.on('created', () => {
          slider.container.addEventListener('mouseover', () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener('mouseout', () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on('dragStarted', clearNextTimeout);
        slider.on('animationEnded', nextTimeout);
        slider.on('updated', nextTimeout);
      },
    ]
  );

  useEffect(() => {
    if (!testimonials) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      testimonials.current?.next();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [testimonials]);

  useEffect(() => {
    if (!servicesSlider) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      servicesSlider.current?.next();
    }, 6000);

    return () => window.clearInterval(interval);
  }, [servicesSlider]);

  useEffect(() => {
    AOS.init({ once: true, duration: 700, easing: 'ease-out-cubic' });
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
              ? 'Asmeninės treniruotės, kurios keičia jūsų kūną ir mąstymą per 30 dienų'
              : 'Personal training that transforms your body and mindset in 30 days'
          }
          ctaLabel={activeLocale === 'lt' ? 'Peržiūrėti planus' : 'View plans'}
        />

        <section id="apie-mane" className="bg-white py-20 text-black">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center" data-aos="fade-up">
              <div>
                <figure className="rounded-2xl overflow-hidden">
                  <img
                    src={fromUploads('IMG_0462-scaled-e1750332801471.jpg')}
                    alt={activeLocale === 'lt' ? 'Apie mane' : 'About me'}
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
                        Labas, aš Pavel — sveikatingumo treneris ir biomechanikos specialistas, jau daugiau nei aštuonerius metus
                        padedantis žmonėms ne tik sustiprėti fiziškai, bet ir atrasti vidinę ramybę bei pasitikėjimą savimi.
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
            <div className="mt-16 grid gap-10 pb-6 xl:grid-cols-2">
              {programsByLocale[activeLocale].map((plan, index) => (
                <article
                  key={plan.title}
                  className="flex flex-col overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.1)] transition duration-500 hover:-translate-y-2"
                  data-aos="fade-up"
                  data-aos-delay={index * 80}
                >
                  <div className="relative h-[320px] sm:h-[360px] shrink-0">
                    <img src={plan.image} alt={plan.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />
                    <div className="relative z-10 flex h-full flex-col justify-between p-8 sm:p-10 text-white">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{plan.subtitle}</p>
                        <h3 className="font-heading text-3xl font-black leading-tight sm:text-4xl">{plan.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm font-semibold">
                        <span className="glass-card rounded-full px-4 py-2 text-white/90">{plan.duration}</span>
                        <span className="glass-card rounded-full px-4 py-2 text-white">{plan.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 gap-8 bg-white p-8 sm:p-10 text-slate-900">
                    <p className="text-lg leading-relaxed text-slate-600">{plan.description}</p>
                    <div className="grid gap-6 md:grid-cols-2">
                      {plan.highlights.map(highlight => (
                        <div
                          key={highlight.title}
                          className="rounded-3xl border border-slate-100 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                        >
                          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{highlight.title}</p>
                          <p className="mt-3 text-sm text-slate-600">{highlight.detail}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        {activeLocale === 'lt' ? 'Į paketą įeina' : "What's included"}
                      </p>
                      <ul className="space-y-3">
                        {plan.extras.map(extra => (
                          <li key={extra} className="flex items-start gap-3 text-sm text-slate-600">
                            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full glass-green-surface text-xs font-bold text-slate-900">
                              &bull;
                            </span>
                            <span>{extra}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => onBuyProgram(plan)}
                        className="inline-flex items-center gap-2 rounded-full glass-green-surface px-7 py-3 text-base font-semibold text-black transition hover:bg-slate-900 hover:text-white"
                      >
                        {activeLocale === 'lt' ? 'Pirkti' : 'Buy'}
                        <span className="inline-block text-xl">&rarr;</span>
                      </button>
                      <span className="text-xs uppercase tracking-widest text-slate-400">
                        {activeLocale === 'lt' ? 'Nemokama konsultacija prieš startą' : 'Free consultation before you start'}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sekmes" className="relative overflow-hidden py-28 text-white">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <img src={successImage} alt="" className="h-full w-full object-cover" loading="lazy" />
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
                {transformations.map((item, index) => {
                  const storyNumber = index + 1;
                  const photos = [
                    { key: 'before', ...item.before },
                    { key: 'after', ...item.after },
                  ];

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
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                                {activeLocale === 'lt' ? 'Programa' : 'Program'}
                              </dt>
                              <dd className="mt-2 text-base font-medium text-white">{item.program}</dd>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                                {activeLocale === 'lt' ? 'Tikslas' : 'Goal'}
                              </dt>
                              <dd className="mt-2 text-base font-medium text-white">{item.goal}</dd>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                                {activeLocale === 'lt' ? 'Rezultatai' : 'Results'}
                              </dt>
                              <dd className="mt-2 text-base font-semibold text-white">{item.result}</dd>
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
                              const altSuffix = activeLocale === 'lt' ? (photo.key === 'before' ? 'foto prieš' : 'foto po') : photoLabel.toLowerCase();

                              return (
                            <figure
                              key={photo.key}
                                className="relative flex-1 overflow-hidden rounded-3xl border border-white/15"
                            >
                              <img
                                src={photo.image}
                                alt={`${item.name} ${altSuffix}`}
                                  className="h-64 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] md:h-72 lg:h-[420px]"
                                loading="lazy"
                              />
                              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                                <span>{photoLabel}</span>
                                <span className="text-sm tracking-normal">{photo.weight}</span>
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
              <div ref={servicesRef} className="keen-slider">
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
          className="relative overflow-hidden py-36 sm:py-48 lg:py-80 bg-cover"
          style={{ backgroundImage: `url(${fromUploads('IMG_0469-scaled.jpg')})`, backgroundPosition: 'center 83%', minHeight: 'clamp(520px, 135vw, 920px)' }}
        >
          {/* subtle dark overlay so text stays readable; increased slightly for better contrast */}
          <div className="absolute inset-0 -z-10 bg-black/70" aria-hidden="true" />
          <div className="relative z-10">
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
                    <span className="flex h-10 w-10 items-center justify-center rounded-full glass-green-surface text-black font-semibold">01</span>
                    <span>{activeLocale === 'lt' ? 'Pasirinkite kupono vertę ir gavėją' : 'Choose the voucher amount and recipient'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full glass-green-surface text-black font-semibold">02</span>
                    <span>{activeLocale === 'lt' ? 'Sudarysime personalizuotą planą ir tvarkaraštį' : 'We create a personalized plan and schedule'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full glass-green-surface text-black font-semibold">03</span>
                    <span>{activeLocale === 'lt' ? 'Stebėsime pažangą ir suteiksime grįžtamąjį ryšį' : 'We track progress and give feedback'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-4 text-sm sm:flex-row">
                <a
                  href={activeLocale === 'lt' ? '/lt/dovanu-kuponas' : '/en/gift-card'}
                  className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 font-semibold text-black transition duration-200 hover:-translate-y-0.5"
                >
                  {activeLocale === 'lt' ? 'Pirkti dovanų kuponą' : 'Buy a gift voucher'}
                </a>
                <a
                  href="#programos"
                  className="inline-flex items-center justify-center rounded-full border border-white px-6 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:text-accent"
                >
                  {activeLocale === 'lt' ? 'Peržiūrėti planus' : 'View plans'}
                </a>
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
                {stories.map((story, index) => (
                  <div key={story.name} className="keen-slider__slide py-12 px-4">
                    <article
                      className="flex flex-col h-full rounded-[32px] border border-slate-200 bg-white/90 p-8"
                    >
                      <div>
                        <div className="flex items-center gap-4">
                          <img
                            src={story.avatar}
                            alt={story.name}
                            className="h-14 w-14 rounded-full object-cover"
                            loading="lazy"
                          />
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
                              className="h-4 w-4"
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
                      <span className="flex h-8 w-8 items-center justify-center rounded-full glass-green-surface text-black">+</span>

                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6" data-aos="fade-up" data-aos-delay="100">
              <h3 className="font-heading text-4xl font-black uppercase text-black">
                {activeLocale === 'lt' ? 'Negaliu jums padėti, jei siekiate:' : "I'm not a fit if you:"}
              </h3>
              <ul className="grid gap-3 text-base text-black">
                {notHelpListByLocale[activeLocale].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">-</span>

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
                        <span className="flex h-8 w-8 items-center justify-center rounded-full glass-green-surface text-black">+</span>
                      <span>{activeLocale === 'lt' ? 'Asmeninis įvertinimas ir aiškus startas.' : 'A clear starting point and assessment.'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full glass-green-surface text-black">+</span>
                      <span>{activeLocale === 'lt' ? 'Pritaikytos mitybos bei treniruočių kryptys.' : 'Nutrition and training direction tailored to you.'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full glass-green-surface text-black">+</span>
                      <span>{activeLocale === 'lt' ? 'Atsakymai į visus klausimus apie treniruočių procesą.' : 'Answers to all your questions about the process.'}</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 space-y-4">
                  <h3 className="font-heading text-4xl font-black uppercase">{activeLocale === 'lt' ? 'Mane rasite:' : 'You can find me at:'}</h3>
                  {partnerLogos.map(partner => (
                    <div
                      key={partner.name}
                      className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm"
                    >
                      <img
                        src={partner.logo}
                        alt={activeLocale === 'lt' ? `${partner.name} logotipas` : `${partner.name} logo`}
                        className="h-12 w-auto"
                        loading="lazy"
                      />
                      <div className="ml-auto flex items-center gap-3 text-right">
                        <span className="text-lg font-semibold text-black">{partner.name}</span>
                        <span className="text-2xl text-black" aria-hidden="true">
                          &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <form
                className="order-1 lg:order-2 space-y-5 rounded-[32px] bg-white p-8 text-black shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
                onSubmit={event => {
                  event.preventDefault();
                  alert(
                    activeLocale === 'lt'
                      ? 'Ačiū! Jūsų žinutė gauta. Susisieksiu kuo greičiau.'
                      : 'Thanks! Your message was received. I will contact you soon.'
                  );
                  event.currentTarget.reset();
                }}
              >
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
                    required
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
                <label className="flex items-start gap-3 text-sm text-black">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border border-slate-400 bg-white text-accent focus:ring-accent"
                    required
                  />
                  <span>{activeLocale === 'lt' ? 'Sutinku su privatumo politika' : 'I agree to the privacy policy'}</span>
                </label>
                <button
                  type="submit"
                  className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-black"
                >
                  {activeLocale === 'lt' ? 'Siųsti užklausą' : 'Send message'}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-accent py-32 text-center">
          <h2 className="font-heading text-6xl font-black uppercase tracking-tight text-black">Kaliadziuk</h2>
        </section>
      </main>

      <footer className="border-t border-black bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-black md:flex-row md:items-center md:justify-between">
          <p>Kaliadziuk &copy; 2025. Visos teises saugomos.</p>
          <a href="#" className="text-sm font-medium text-black transition hover:text-accent">
            {activeLocale === 'lt' ? 'Privatumo politika' : 'Privacy policy'}
          </a>
        </div>
      </footer>

      <CartToast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        title={activeLocale === 'lt' ? 'Pridėta į krepšelį' : 'Added to cart'}
        actionLabel={activeLocale === 'lt' ? 'Atidaryti krepšelį' : 'Open cart'}
        actionTo={cartPath}
      />
    </div>
  );
}

export default App;
