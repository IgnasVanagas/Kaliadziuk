import { useEffect, useRef, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';

const fromUploads = file => new URL(`../uploads/${file}`, import.meta.url).href;

const navItems = [
  { label: 'Planai', href: '#programos' },
  { label: 'Paslaugos', href: '#paslaugos' },
  { label: 'Istorijos', href: '#sekmes' },
  { label: 'Kontaktai', href: '#kontaktai' },
];

const heroImageDesktop = fromUploads('IMG_0443-scaled.jpg');
const heroImageMobile = fromUploads('IMG_0441-modified-scaled-e1750335226133.jpg');
const successImage = fromUploads('IMG_0443-scaled.jpg');

const contactImage = fromUploads('IMG_0469-scaled.jpg');

const heroStats = [
  { label: 'Pasikeitę klientai', value: 1000, suffix: '+', delay: 100 },
  { label: 'Metų patirtis', value: 8, suffix: '', delay: 200 },
  { label: 'Klientų pasitenkinimas', value: 98, suffix: '%', delay: 300 },
];

const Hero = ({ stats, backgroundDesktop, backgroundMobile }) => (
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
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]">
          Asmeninės treniruotės, kurios keičia jūsų kūną ir mąstymą per 30 dienų
        </h1>
        <div className="flex w-full justify-center flex-col gap-4 sm:w-auto sm:flex-row">
          <a
            href="#programos"
            className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 text-xl font-extrabold text-black shadow-lg transition-transform duration-150 hover:-translate-y-1 sm:px-8 sm:py-4 sm:text-2xl"
          >
            Peržiūrėti planus
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
            <p className="text-4xl font-extrabold text-accent">
              <AnimatedCounter to={stat.value} suffix={stat.suffix} delay={stat.delay} />
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/85">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const programs = [
  {
    title: 'Svorio metimo',
    subtitle: 'Lengvesnis kūnas ir daugiau energijos',
    description:
      'Aštuonių savaičių kelionė, kuri derina švelniai agresyvią mitybos strategiją, riebalų deginimo treniruotes ir emocinį palaikymą. Kiekvieną savaitę peržiūrime žingsnius, miego higieną ir kraujo žymenis, kad korekcijos būtų tikslios, o motyvacija – stabili.',
    price: '100€',
    duration: '8 savaitės',
    image: fromUploads('IMG_0481-scaled.jpg'),
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
    title: 'Raumenų auginimo',
    subtitle: 'Didesnė jėga ir aiškiai matoma forma',
    description:
      'Programa sukurta žmonėms, kurie nori ne tik priaugti svorio, bet ir jaustis funkcionaliai stiprūs. Dirbame ciklais – nuo nervų sistemos adaptacijos iki progresuojančių apkrovų, kartu prižiūrint hormonų ir baltymų balansą.',
    price: '100€',
    duration: '10 savaičių',
    image: fromUploads('IMG_0443-scaled.jpg'),
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
    title: 'Namų treniruotė',
    subtitle: 'Studijos kokybė tavo svetainėje',
    description:
      'Jei neturi galimybės lankytis sporto klube, visa programa atkeliauja pas tave – nuo dviem hanteliais atliekamų kompleksų iki kūno peso blokų su tempimo ritualais. Vaizdo įrašai ir gyvos korekcijos leidžia jaustis taip, lyg treneris būtų šalia.',
    price: '100€',
    duration: '6 savaitės',
    image: fromUploads('IMG_0462-scaled-e1750332801471.jpg'),
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
    title: 'Mobilumo lavinimo',
    subtitle: 'Lengvas kūnas kasdieniame judesyje',
    description:
      'Skirta žmonėms, kurie nori išmanyti savo kūną, atsikratyti įtampos ir pagerinti laikyseną. Dirbame lėtai, bet tikslingai – deriname fascijų atpalaidavimą, aktyvius tempimus ir funkcinį stabilizavimą.',
    price: '100€',
    duration: '5 savaitės',
    image: fromUploads('IMG_0441-modified-scaled-e1750335226133.jpg'),
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

const stories = [
  {
    name: 'Ingrida Brazytė-Česevičienė',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Pavelas – profesionalus, atidus, nuoširdus treneris ir puikus motyvatorius! Lankausi jau daugiau nei tris mėnesius, ir dar nė viena treniruotė nebuvo tokia pati. Treniruotės pralekia greitai ir nenuobodžiai! Svarbiausia – po kiekvienos treniruotės jaučiu, kad turiu raumenukus, tačiau niekada nebuvo taip, kad dėl stipraus skausmo neišlipčiau iš lovos.”',
  },
  {
    name: 'Dovydas Sem',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Sportuoju pas Pavelą jau antrus metus ir tikrai nesiruošiu sustoti! Drįsčiau teigti, kad treniruotės su juo – geriausias mano pasirinkimas. Jis gali jaunimui padėti susikurti itin tvirtą pagrindą sporte, supažindinti su įvairiais pratimais ir jų veikimo principais bei skatinti sveiką gyvenseną. Su šiuo treneriu niekada nebūna nuobodu – pratimų įvairovė ir nuolatinis bendravimas tiesiog kviečia į salę!”',
  },
  {
    name: 'Artūras Kozlov',
    avatar: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Atsakingas, kvalifikuotas ir savo darbą mylintis treneris. Matosi, kad kiekvienai treniruotei kruopščiai pasiruošia – parenka tinkamą krūvį ir ateina su būtent tau pritaikytu treniruotės planu, o ne „copy-paste“ schema visiems. Pratimai įvairūs ir įdomūs, nėra monotonijos – visada išmoksti kažką naujo. Kas labai svarbu – Pavelas yra be galo dėmesingas: visos treniruotės metu stebi techniką, paaiškina kiekvieno pratimo paskirtį ir naudą. Jokio broko tikrai nepraleis!”',
  },
  {
    name: 'Julia Gatsko',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Pasha stands out with his professionalism and scientific approach – he considers your health and body condition, helping you not only look fit but also feel better. I’ve been training with him for almost a year and see great improvements in both fitness and overall well-being. Highly recommended!”',
  },
  {
    name: 'Justė Perveneckaitė',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Esu sportininkė, kuri anksčiau susidūrė su įvairiais raumenų disbalansais, tačiau trenerio sudaryta individuali programa padėjo juos išspręsti ir sustiprėti. Ypač vertinu jo pagalbą atsistatymo procese bei traumų prevencijoje, kas man labai svarbu siekiant ilgalaikių rezultatų. Treneris itin malonus, dėmesingas ir visada nuoširdžiai atsako į visus rūpimus klausimus.”',
  },
  {
    name: 'Edvard Korovacki',
    avatar: 'https://images.unsplash.com/photo-1544723795-4325379dc450?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Pavel is an outstanding trainer who considers personal needs, motivates, and gives clear feedback. His knowledge covers not only exercises but also nutrition and recovery, helping to achieve real results. Trainings are always full of positive energy, and with him you feel welcome and inspired every time.”',
  },
  {
    name: 'Greta Valasinavičiūtė',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Pavelas – nuostabus treneris, o kiekviena treniruotė pas jį – motyvacijos, energijos ir žinių šaltinis. Su nekantrumu laukiu kiekvienos treniruotės! Profesionalumas garantuotas – rekomenduoju!”',
  },
  {
    name: 'Tadas Kibirkštis',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Pavelas – tikras savo srities profesionalas. Įsigilina į situaciją, atidžiai parenka pratimus pagal būklę ir savijautą, o rezultatas jaučiasi iškart. Jis – žmogus, mylintis savo darbą ir atsiduodantis jam 100 %. Ačiū Jam ir tikrai rekomenduoju kitiems!”',
  },
  {
    name: 'Ūlė Julija Masteikaitė',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Pavelas yra the absolute best 🫶 Susidūrus su nugaros skausmo problema, padėjo ją spręsti bei pasiūlė daug prevencinių pratimų. Viską aiškina suuuuper detaliai - ne tik kaip atlikti pratimą, bet taip pat ir kokie raumenys dirba bei visapusę pratimo naudą. Po treniruotės lieki ne tik pasportavęs, bet ir sužinojęs daug dalykų apie savo kūną, laikyseną, mobilumą.”',
  },
  {
    name: 'Roma Šablinskienė',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
    quote:
      '“Kaip visišką nedraugystę su sportu paversti meile sportui? Lengva – tereikia Pavelo pagalbos! Labai atsargiai, ilgai dairydamasi iš tolo ieškojau, kas man padėtų prisijaukinti šį „žvėrį“. Įvairūs bandymai grupinėse treniruotėse būdavo trumpalaikiai, todėl beveik buvau nurašiusi sportą kaip „ne mano arkliuką“. Tačiau jau po pirmos treniruotės supratau, kad su Pavelu – tobula chemija! Jis tikras profesionalas, nenaudojantis vienos schemos visiems. Respektas!”',
  },
  {
    name: 'Evelina Jurčiukonytė',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
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

const helpList = [
  'Atrodyti ir jaustis geriau',
  'Padidinti pasitikėjimą savimi',
  'Pagerinti savo laikyseną',
  'Tikslingai ir taisyklingai treniruotis',
  'Valgyti sveiką, subalansuotą maistą nebadaujant',
  'Padidinti savo energijos lygį',
];

const notHelpList = [
  'Tikite greitais rezultatais be nuoseklaus darbo',
  'Nenorite įsitraukti į mitybos ir gyvenimo būdo pokyčius',
  'Ieškote „stebuklingų“ papildų ar trumpų kelių',
  'Atsisakote laikytis individualiai sudaryto plano',
  'Neturite laiko bent kelioms treniruotėms per savaitę',
];

const services = [
  {
    title: 'Testavimo treniruotė su kūno analize ir programos sudarymu',
    image: fromUploads('IMG_0481-scaled.jpg'),
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
    image: fromUploads('IMG_0451-scaled.jpg'),
    description:
      'Individualus dėmesys, aiškus planas ir realūs rezultatai. Gauk profesionalų palaikymą kiekviename žingsnyje.',
    features: ['100 % dėmesio vienam klientui', 'Aiškios treniruočių struktūros', 'Motyvacija ir atsakomybė'],
  },
  {
    title: 'Online coaching',
    image: fromUploads('IMG_0469-scaled.jpg'),
    description:
      'Sportuok bet kur – gautas planas, palaikymas ir atskaitomybė padeda išlikti kelyje į tikslą net kelionėje.',
    features: ['Individualus nuotolinis planas', 'Reguliarus palaikymas ir grįžtamasis ryšys', 'Treniruočių korekcijos pagal progresą'],
  },
  {
    title: 'Treniruotės jūsų namuose',
    image: fromUploads('IMG_0488-scaled.jpg'),
    description:
      'Treneris atvyksta pas jus! Patogus ir saugus sportas, pritaikytas jūsų erdvei, tikslams ir galimybėms.',
    features: ['Inventoriaus pritaikymas namų erdvei', 'Treniruočių grafikas pagal jūsų laiką', 'Asmeninis dėmesys ir saugumas'],
  },
  {
    title: 'Grupinės treniruotės – Varėnoje ir Vilniuje',
    image: fromUploads('IMG_0443-scaled.jpg'),
    description:
      'Energija, kuri užkrečia! Sportuokite mažose ar didelėse grupėse, jauskite palaikymą ir bendrumą.',
    features: ['Skirtingo dydžio grupės', 'Motyvuojanti ir pozityvi atmosfera', 'Idealiai tinka socialiai motyvuotiems sportui'],
  },
  {
    title: 'Sportas poroje',
    image: fromUploads('IMG_0481-scaled.jpg'),
    description:
      'Labai populiarus pasirinkimas! Dviguba motyvacija ir bendras tikslas stiprina kūną bei santykį.',
    features: ['Planai pritaikyti dviem žmonėms', 'Bendro progreso sekimas', 'Treniruotės, kurios stiprina ryšį'],
  },
  {
    title: 'Paauglių grupinės treniruotės – Varėnoje',
    image: fromUploads('IMG_0462-scaled-e1750332801471.jpg'),
    description:
      'Saugi, smagi ir lavinanti aplinka jauniems sportininkams. Stiprėk, gerink laikyseną, pasitikėjimą ir fizinį pasirengimą!',
    features: ['Amžiui pritaikyti pratimai', 'Dėmesys laikysenai ir fiziniam pasirengimui', 'Palaikanti ir draugiška bendruomenė'],
  },
  {
    title: 'Senjorų treniruotės – sporto salėje ir baseine',
    image: fromUploads('IMG_0441-modified-scaled-e1750335226133.jpg'),
    description:
      'Švelnios, bet veiksmingos treniruotės geresnei savijautai, lankstumui ir gyvenimo džiaugsmui. Judėjimas tinka visiems!',
    features: ['Mažo poveikio pratimai salėje ir baseine', 'Gerina lankstumą ir balansą', 'Pritaikoma individualioms galimybėms'],
  },
];
const groupServices = [
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

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const serviceCardRefs = useRef([]);
  const [serviceCardHeight, setServiceCardHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  const [testimonialsRef, testimonials] = useKeenSlider({
    loop: true,
    mode: 'snap',
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
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = event => setIsDesktop(event.matches);
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Keep Paslaugos cards uniform height (desktop only) by syncing to the tallest card
  useEffect(() => {
    if (!isDesktop) {
      setServiceCardHeight(0);
      return undefined;
    }

    const measureServiceCards = () => {
      const heights = serviceCardRefs.current.map(node => node?.getBoundingClientRect().height || 0);
      const maxHeight = heights.length ? Math.max(...heights) : 0;
      setServiceCardHeight(prev => (maxHeight && maxHeight !== prev ? maxHeight : prev));
    };

    measureServiceCards();
    window.addEventListener('resize', measureServiceCards);
    return () => window.removeEventListener('resize', measureServiceCards);
  }, [isDesktop]);

  const [transformationsRef, transformationsSlider] = useKeenSlider({
    loop: true,
    mode: 'snap',
    renderMode: 'performance',
    slides: {
      perView: 1,
      spacing: 24,
    },
  });

  // track last index/time to control when to wrap from last -> first
  const transformAutoplayRef = useRef(null);
  const lastTransformIndexRef = useRef(null);
  const lastTransformIndexTimeRef = useRef(0);
  const transformRestartTimeoutRef = useRef(null);

  const startTransformAutoplay = () => {
    if (transformAutoplayRef.current) {
      window.clearInterval(transformAutoplayRef.current);
    }
    transformAutoplayRef.current = window.setInterval(() => {
      transformationsSlider?.current?.next();
    }, 6000);
  };

  const stopTransformAutoplay = () => {
    if (transformAutoplayRef.current) {
      window.clearInterval(transformAutoplayRef.current);
      transformAutoplayRef.current = null;
    }
  };

  const resetTransformAutoplay = () => {
    // restart autoplay timer when user interacts
    stopTransformAutoplay();
    if (transformRestartTimeoutRef.current) {
      window.clearTimeout(transformRestartTimeoutRef.current);
      transformRestartTimeoutRef.current = null;
    }
    // small debounce before restarting so manual nav isn't immediately overridden
    transformRestartTimeoutRef.current = window.setTimeout(() => {
      startTransformAutoplay();
      transformRestartTimeoutRef.current = null;
    }, 6000);
  };

  // Instantly jump to a target index without visible slide transitions.
  // Adds a temporary class to the slider container to disable CSS transitions,
  // performs a non-animated move on the instance, then removes the class.
  const instantJump = (inst, targetIdx) => {
    if (!inst) return;
    const container = inst.container || inst?.root || null;
    try {
      if (container && container.classList) container.classList.add('keen-no-transition');

      // Collect slides and temporarily hide all of them except the target to avoid
      // any intermediate rendering or jitter during the instant jump.
      const slides = container ? Array.from(container.querySelectorAll('.keen-slider__slide')) : [];
      const prev = slides.map(s => ({ el: s, transition: s.style.transition || '', opacity: s.style.opacity || '', pointerEvents: s.style.pointerEvents || '' }));

      slides.forEach(s => {
        s.style.transition = 'none';
        s.style.opacity = '0';
        s.style.pointerEvents = 'none';
      });

      // force reflow
      if (container) void container.offsetHeight;

      if (typeof inst.moveToIdx === 'function') {
        inst.moveToIdx(targetIdx, false);
      } else if (typeof inst.moveTo === 'function') {
        inst.moveTo(targetIdx, false);
      }

      // ensure the target slide is visible immediately
      const targetSlide = slides[targetIdx];
      if (targetSlide) {
        targetSlide.style.opacity = '1';
        targetSlide.style.pointerEvents = 'auto';
      }

      // restore previous inline styles shortly after
      window.setTimeout(() => {
        prev.forEach(p => {
          try {
            p.el.style.transition = p.transition;
            p.el.style.opacity = p.opacity;
            p.el.style.pointerEvents = p.pointerEvents;
          } catch (e) {
            /* ignore */
          }
        });
      }, 60);
    } catch (e) {
      // ignore instance errors
    } finally {
      // remove class on next tick so state stabilizes
      window.setTimeout(() => {
        try {
          if (container && container.classList) container.classList.remove('keen-no-transition');
        } catch (e) {
          /* ignore */
        }
      }, 20);
    }
  };

  useEffect(() => {
    if (!transformationsSlider) return undefined;
    // start autoplay and keep ref so we can reset it on user interaction
    startTransformAutoplay();
    return () => {
      stopTransformAutoplay();
      if (transformRestartTimeoutRef.current) {
        window.clearTimeout(transformRestartTimeoutRef.current);
        transformRestartTimeoutRef.current = null;
      }
    };
  }, [transformationsSlider]);

  // Simplified, truly endless prev/next for transformations (Klientų istorijos)
  const handleTransformPrev = () => {
    const inst = transformationsSlider?.current;
    if (!inst) return;
    const idx = inst.track?.details?.rel ?? 0;
    if (idx === 0) {
      // jump instantly to last slide without animating through intermediate slides
      instantJump(inst, transformations.length - 1);
    } else {
      inst.prev();
    }
    resetTransformAutoplay();
  };

  const handleTransformNext = () => {
    const inst = transformationsSlider?.current;
    if (!inst) return;
    const idx = inst.track?.details?.rel ?? 0;
    if (idx === transformations.length - 1) {
      // jump instantly to first slide without animating through intermediate slides
      instantJump(inst, 0);
    } else {
      inst.next();
    }
    resetTransformAutoplay();
  };

  // When the slider reaches the last slide, after it's been visible for the autoplay interval, jump to first
  useEffect(() => {
    if (!transformationsSlider?.current) return undefined;
    const inst = transformationsSlider.current;
    let intervalId = null;
    const VISIBLE_THRESHOLD = 6000; // ms the last slide must be visible before trigger (match autoplay interval)

    intervalId = window.setInterval(() => {
      try {
        const details = inst.track && inst.track.details;
        if (!details) return;
        const idx = details.rel;

        // update last seen index/time when index changes
        if (lastTransformIndexRef.current !== idx) {
          lastTransformIndexRef.current = idx;
          lastTransformIndexTimeRef.current = Date.now();
          return;
        }

        const isAutoplayActive = !!transformAutoplayRef.current;

        // only trigger when autoplay is active, index is last, and it's been visible for threshold
        if (
          idx === details.slides.length - 1 &&
          isAutoplayActive &&
          Date.now() - lastTransformIndexTimeRef.current >= VISIBLE_THRESHOLD
        ) {
          instantJump(inst, 0);
          lastTransformIndexRef.current = -1;
        }
      } catch (e) {
        // ignore read errors
      }
    }, 200);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [transformationsSlider]);

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    AOS.init({ once: true, duration: 700, easing: 'ease-out-cubic' });
  }, []);

  const headerClass = `fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
    scrolled ? 'translate-y-4' : 'translate-y-0'
  }`;
  const headerSurfaceClass = `flex w-full items-center justify-between px-6 transition-all duration-300 backdrop-saturate-150 ${
    scrolled
      ? 'mx-auto max-w-6xl rounded-full border border-white/30 glass-green py-3 text-black shadow-[0_35px_90px_rgba(0,0,0,0.35)]'
      : 'mx-auto max-w-none border-b border-black/10 bg-white py-5 text-black shadow-[0_12px_45px_rgba(15,23,42,0.08)]'
  }`;
  const desktopLinkClass = 'transition text-black hover:text-slate-900';
  const desktopCtaClass = 'inline-flex items-center justify-center rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-900';
  const mobileMenuBaseClass = `border border-black/15 bg-white/95 text-black backdrop-blur-md rounded-3xl mt-4`;
  const mobileLinkClass = 'transition text-black hover:text-accent';
  const mobileCtaClass = 'mt-6 inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900';
  const mobileToggleClass = 'inline-flex items-center justify-center rounded-full border border-black/40 p-2 text-black md:hidden';

  return (
    <div className="relative bg-white text-black">

      <header className={headerClass}>
        <div className={headerSurfaceClass}>
          <a
            href="#hero"
            className="text-xl font-bold tracking-tight text-black transition-colors duration-300"
          >
            Kaliadziuk
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {navItems.map(item => (
              <a key={item.href} href={item.href} className={desktopLinkClass}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:block">
            <a
              href="#kontaktai"
              className={desktopCtaClass}
            >
              Išbandyti nemokamai
            </a>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(current => !current)}
            className={mobileToggleClass}
          >
            <span className="sr-only">Perjungti meniu</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <nav
          className={`${
            mobileOpen ? 'block' : 'hidden'
          } ${mobileMenuBaseClass} px-6 py-4 md:hidden transition-colors duration-300`}
        >
          <div className="flex flex-col gap-4 text-sm font-medium">
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass}
              >
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="#kontaktai"
            onClick={() => setMobileOpen(false)}
            className={mobileCtaClass}
          >
            Išbandyti nemokamai
          </a>
        </nav>
      </header>
  {/* spacer equal to header height to prevent content jump when header is fixed */}
  <div aria-hidden="true" className="h-16 md:h-20" />

      <main>
        <Hero stats={heroStats} backgroundDesktop={heroImageDesktop} backgroundMobile={heroImageMobile} />

        <section id="programos" className="bg-white py-24 text-black">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl space-y-4 text-center" data-aos="fade-up">
              <h2 className="text-4xl font-black uppercase">Treniruočių ir mitybos planai</h2>
              <p className="text-base text-black/70">
                Pasirinkite programą pagal savo tikslus – kiekviena sudaroma individualiai, atsižvelgiant į jūsų poreikius ir galimybes.
              </p>
            </div>
            <div className="mt-16 grid gap-10 pb-6 xl:grid-cols-2">
              {programs.map((plan, index) => (
                <article
                  key={plan.title}
                  className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.1)] transition duration-500 hover:-translate-y-2"
                  data-aos="fade-up"
                  data-aos-delay={index * 80}
                >
                  <div className="relative h-[320px] sm:h-[360px]">
                    <img src={plan.image} alt={plan.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-black/90" />
                    <div className="relative z-10 flex h-full flex-col justify-between p-8 sm:p-10 text-white">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">{plan.subtitle}</p>
                        <h3 className="text-3xl font-black leading-tight sm:text-4xl">{plan.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm font-semibold">
                        <span className="glass-card rounded-full px-4 py-2 text-white/90">{plan.duration}</span>
                        <span className="glass-card rounded-full px-4 py-2 text-white">{plan.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-8 bg-white p-8 sm:p-10 text-slate-900">
                    <p className="text-lg leading-relaxed text-slate-600">{plan.description}</p>
                    <div className="grid gap-6 md:grid-cols-2">
                      {plan.highlights.map(highlight => (
                        <div
                          key={highlight.title}
                          className="rounded-3xl border border-slate-100 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                        >
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{highlight.title}</p>
                          <p className="mt-3 text-sm text-slate-600">{highlight.detail}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Į paketą įeina</p>
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
                      <a
                        href="#kontaktai"
                        className="inline-flex items-center gap-2 rounded-full glass-green-surface px-7 py-3 text-base font-semibold text-black transition hover:bg-slate-900 hover:text-white"
                      >
                        Pirkti
                        <span className="inline-block text-xl">&rarr;</span>
                      </a>
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Nemokama konsultacija prieš startą</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="apie-mane" className="bg-white py-20 text-black">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center" data-aos="fade-up">
              <div>
                <figure className="rounded-2xl overflow-hidden">
                  <img src={fromUploads('IMG_0462-scaled-e1750332801471.jpg')} alt="Apie mane" className="w-full h-full object-cover" loading="lazy" />
                </figure>
              </div>
              <div>
                <h3 className="text-4xl font-black uppercase">Apie mane</h3>
                <div className="space-y-4 text-base text-black/75">
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
                </div>
              </div>
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
              <h2 className="text-4xl font-black uppercase text-white">Klientų istorijos</h2>
            </div>
            <div className="relative" data-aos="fade-up">
              <div
                ref={transformationsRef}
                className="keen-slider"
                onPointerDown={resetTransformAutoplay}
                onTouchStart={resetTransformAutoplay}
                onWheel={resetTransformAutoplay}
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
                      className="keen-slider__slide glass-card group rounded-[36px] p-8 text-white transition-transform duration-500 ease-out hover:border-accent/60"
                    >
                      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
                        <div className="flex-1 space-y-6">
                          {/* removed: Kliento istorija and Asmeninis planas as requested */}
                          <h3 className="text-3xl font-black tracking-tight text-white">{item.name}</h3>
                          <dl className="space-y-3 text-sm text-white">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Programa</dt>
                              <dd className="mt-2 text-base font-medium text-white">{item.program}</dd>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Tikslas</dt>
                              <dd className="mt-2 text-base font-medium text-white">{item.goal}</dd>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Rezultatai</dt>
                              <dd className="mt-2 text-base font-semibold text-white">{item.result}</dd>
                            </div>
                          </dl>
                        </div>
                          <div className="flex flex-1 flex-row gap-4">
                          {photos.map(photo => (
                            <figure
                              key={photo.key}
                                className="relative flex-1 overflow-hidden rounded-3xl border border-white/15"
                            >
                              <img
                                src={photo.image}
                                alt={`${item.name} ${photo.label.toLowerCase()}`}
                                  className="h-64 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] md:h-72 lg:h-[420px]"
                                loading="lazy"
                              />
                              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                                <span>{photo.label.replace(/Foto\s*/i, '')}</span>
                                <span className="text-sm tracking-normal">{photo.weight}</span>
                              </figcaption>
                            </figure>
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
                  onClick={handleTransformPrev}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-accent hover:text-accent"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  onClick={handleTransformNext}
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
            <div className="flex flex-col gap-3 text-center" data-aos="fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Paslaugos</p>
              <h2 className="text-4xl font-black uppercase text-slate-900">Treniruotės ir sveikatingumo paslaugos</h2>
              <p className="text-base text-slate-600 sm:text-lg">
                Judėjimas, kuris keičia kūną, nuotaiką ir energiją!
              </p>
              <p className="text-base text-slate-600 sm:text-lg">
                Rask tau tinkamiausią būdą sportuoti – individualiai, su pora, grupe ar visa komanda.
              </p>
            </div>
            <div className="relative mt-16" data-aos="fade-up">
              <div ref={servicesRef} className="keen-slider">
                {services.map((service, index) => (
                  <article
                    key={service.title}
                    ref={el => {
                      serviceCardRefs.current[index] = el;
                    }}
                    style={isDesktop && serviceCardHeight ? { minHeight: `${serviceCardHeight}px` } : undefined}
                    className="keen-slider__slide flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_25px_90px_rgba(15,23,42,0.08)]"
                  >
                    <figure className="relative h-56 w-full sm:h-64">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </figure>
                    <div className="flex h-full flex-col justify-between gap-6 p-8 text-slate-700">
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900">{service.title}</h3>
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
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => servicesSlider?.current?.prev()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-400 bg-white text-slate-600 transition hover:border-accent hover:text-accent"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  onClick={() => servicesSlider?.current?.next()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-400 bg-white text-slate-600 transition hover:border-accent hover:text-accent"
                >
                  &gt;
                </button>
              </div>
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
                  <h3 className="text-4xl font-black uppercase">
                    Padovanok geresnę savijautą artimiesiems be papildomo streso.
                  </h3>
                  <p className="text-base text-white/90">
                    Pasirinkite sumą, o likusia dalimi pasirūpinsiu asmeniškai: tikslų aptarimas, individualus planas ir aiškios pirmosios užduotys.
                  </p>
                </div>
                <div className="glass-card space-y-4 rounded-3xl p-6 text-sm text-white sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full glass-green-surface text-black font-semibold">01</span>
                    <span>Pasirinkite kupono vertę ir gavėją</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full glass-green-surface text-black font-semibold">02</span>
                    <span>Sudarysime personalizuotą planą ir tvarkaraštį</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full glass-green-surface text-black font-semibold">03</span>
                    <span>Stebėsime pažangą ir suteiksime grįžtamąjį ryšį</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-4 text-sm sm:flex-row">
                <a
                  href="#kontaktai"
                  className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 font-semibold text-black transition duration-200 hover:-translate-y-0.5"
                >
                  Pirkti dovanų kuponą
                </a>
                <a
                  href="#programos"
                  className="inline-flex items-center justify-center rounded-full border border-white px-6 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:text-accent"
                >
                  Peržiūrėti planus
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="istorijos" className="bg-white text-slate-900">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="flex flex-col gap-3 text-center" data-aos="fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Gyvos patirtys</p>
              <h2 className="text-4xl font-black uppercase text-slate-900">Klientų atsiliepimai</h2>
              <p className="text-base text-slate-600">Tikros istorijos iš žmonių, kurie jaučiasi stipresni, sveikesni ir labiau pasitikintys savimi.</p>
            </div>
            <div ref={testimonialsRef} className="keen-slider mt-16 h-auto overflow-visible">
              {stories.map(story => (
                <article
                  key={story.name}
                  className="keen-slider__slide h-auto rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={story.avatar}
                      alt={story.name}
                      className="h-14 w-14 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{story.name}</h3>
                      <p className="text-xs uppercase tracking-wide text-accent">Programa</p>
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
                    <span className="sr-only">5 iš 5 žvaigždučių</span>
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-slate-600">{story.quote}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between gap-4 text-sm">
              <button
                type="button"
                onClick={() => testimonials?.current?.prev()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-400 bg-white text-slate-600 transition hover:border-accent hover:text-accent"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => testimonials?.current?.next()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-400 bg-white text-slate-600 transition hover:border-accent hover:text-accent"
              >
                &gt;
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2" data-aos="fade-up">
            <div className="space-y-6">
              <h3 className="text-4xl font-black uppercase text-black">Galiu jums padėti, jei siekiate:</h3>
              <ul className="grid gap-3 text-base text-black">
                {helpList.map(item => (
                  <li key={item} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full glass-green-surface text-black">+</span>

                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-4xl font-black uppercase text-black">Negaliu jums padėti, jei siekiate:</h3>
              <ul className="grid gap-3 text-base text-black">
                {notHelpList.map(item => (
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
            alt="Asmeninio trenerio kontaktų fonas"
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
                  <h2 className="text-4xl font-black uppercase">Susisiekite dabar</h2>
                  <p className="text-base text-black">
                    Įveskite savo kontaktus ir per 24 valandas suderinsime individualų susitikimo laiką bei aptarsime jūsų tikslus.
                  </p>
                </div>
                <div className="space-y-4 text-sm text-black">
                  <p className="font-semibold text-black">Ką gausite:</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full glass-green-surface text-black">+</span>
                      <span>Asmeninis įvertinimas ir aiškus startas.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full glass-green-surface text-black">+</span>
                      <span>Pritaikytos mitybos bei treniruočių kryptys.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full glass-green-surface text-black">+</span>
                      <span>Atsakymai į visus klausimus apie treniruočių procesą.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 space-y-4">
                  <h3 className="text-4xl font-black uppercase">Mane rasite:</h3>
                  {partnerLogos.map(partner => (
                    <div
                      key={partner.name}
                      className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm"
                    >
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logotipas`}
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
                  alert('Ačiū! Jūsų žinutė gauta. Susisieksiu kuo greičiau.');
                  event.currentTarget.reset();
                }}
              >
                <div>
                  <label htmlFor="name" className="text-sm font-semibold text-black">
                    Jūsų vardas
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Įrašykite savo vardą"
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-black placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-semibold text-black">
                    Telefonas
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Pageidaujamas kontaktinis numeris"
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-black placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-black">
                    El. paštas *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Susisieksiu su jumis čia"
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-black placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-semibold text-black">
                    Žinutė *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="Aprašykite savo tikslus arba klausimus"
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
                  <span>Sutinku su privatumo politika</span>
                </label>
                <button
                  type="submit"
                  className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-black"
                >
                  Siųsti užklausą
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-accent py-32 text-center">
          <h2 className="text-6xl font-black uppercase tracking-tight text-black">Kaliadziuk</h2>
        </section>
      </main>

      <footer className="border-t border-black bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-black md:flex-row md:items-center md:justify-between">
          <p>Kaliadziuk (c) 2025. Visos teises saugomos.</p>
          <a href="#" className="text-sm font-medium text-black transition hover:text-accent">
            Privatumo politika
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
