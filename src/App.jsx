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
  <section id="hero" className="relative min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)] overflow-hidden bg-black text-white">
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
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-xl font-extrabold text-black shadow-lg transition-transform duration-150 hover:-translate-y-1 sm:px-8 sm:py-4 sm:text-2xl"
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
            className="inline-flex flex-col items-center justify-center space-y-2 rounded-3xl border border-white/10 bg-white/10 px-5 py-5 backdrop-blur-sm sm:min-w-[220px] sm:px-6 text-center"
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
    description: 'Intensyvi programa skirta nereikalingo papildomo svorio metimui ir kūno stiprinimui',
    price: '100€',
    image: fromUploads('IMG_0481-scaled.jpg'),
    features: ['Personalizuotas mitybos planas', 'Kasdienė treniruočių rutina', 'Pažangos stebėjimas'],
  },
  {
    title: 'Raumenų auginimo',
    description: 'Dinamiška programa, orientuota į jėgos ir galios didinimą per tikslines treniruotes',
    price: '100€',
    image: fromUploads('IMG_0443-scaled.jpg'),
    features: ['Pritaikyta jėgos treniruotė', 'Didelės energijos reikalaujančios treniruotės', 'Pažangos stebėjimas'],
  },
  {
    title: 'Namų treniruotė',
    description: 'Lanksti mokymo programa, skirta tiems, kurie nori treniruotis namuose',
    price: '100€',
    image: fromUploads('IMG_0462-scaled-e1750332801471.jpg'),
    features: ['Namų treniruočių planai', 'Minimalios įrangos poreikis', 'Vaizdo įrašai'],
  },
  {
    title: 'Mobilumo lavinimo',
    description: 'Specializuota programa skirta lankstumui ir mobilumui gerinti',
    price: '100€',
    image: fromUploads('IMG_0441-modified-scaled-e1750335226133.jpg'),
    features: ['Tempimo pratimai', 'Funkciniai pratimai', 'Laikysenos korekcija'],
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
    title: 'Asmeninės treniruotės',
    image: fromUploads('IMG_0451-scaled.jpg'),
    description:
      'Individualios treniruotės, pritaikytos tavo tikslams (norintiems išmokti sportuoti, numesti ar priaugti svorio, padidinti raumenų masę).',
    features: ['Individualus planas', 'Technikos korekcija realiu laiku', 'Nuolatinis motyvacinis palaikymas'],
  },
  {
    title: 'Treniruočių programos',
    image: fromUploads('IMG_0458-scaled.jpg'),
    description:
      'Individualiai sudaroma programa, atsižvelgiant į tavo tikslus, patirtį, laiką ir turimą inventorių. Kiekviename pratime pateikiamos raumenų darbo schemos ir paaiškinami variantai.',
    features: ['Prisijungimas prie pratimų bibliotekos', 'Pažangos stebėjimo sistemos', 'Planai pagal turimą inventorių'],
  },
  {
    title: 'Mitybos planas + atsistatymo planas',
    image: fromUploads('IMG_0458-scaled.jpg'),
    description:
      'Individualus planas, įvertinant sveikatos būklę, gyvenimo būdą ir fizinio aktyvumo lygį. Plane rasite kalorijų kiekį, makroelementų paskirstymą, 7 dienų valgiaraštį ir net 28 receptus.',
    features: ['7 dienų valgiaraštis', 'Kalorijų ir makroelementų analizė', 'Atsistatymo rekomendacijos'],
  },
  {
    title: 'Moterims po gimdymo',
    image: fromUploads('IMG_0488-scaled.jpg'),
    description:
      'Treniruotės po gimdymo, siekiant atstatyti kūną ar pasiruošti gimdymui. Programos sudarytos pagal galimas negalavimų rizikas (įvertinamos pilvo sienelės, laikysena ir dubens dugnas).',
    features: ['Dubens dugno stiprinimas', 'Laipsniškas krūvio didinimas', 'Treniruočių grafikai namuose'],
  },
  {
    title: 'Konsultacijos',
    image: fromUploads('IMG_0469-scaled.jpg'),
    description: 'Asmenines konsultacijos internetu ar gyvai. Aptariami tikslai, sporto strategija ir plano sudarymo galimybes.',
    features: ['Tikslų analizė', 'Prioritetų nustatymas', 'Aiškus veiksmų planas'],
  },
  {
    title: 'Nuotolinės treniruotės',
    image: fromUploads('IMG_0451-scaled.jpg'),
    description:
      'Treniruotės nuotoliniu būdu su profesionalia priežiūra ir korekcijomis realiu laiku. Idealios tiems, kurie gyvena užsienyje arba negali reguliariai atvykti į sporto klubą.',
    features: ['Gyvos virtualios sesijos', 'Asmeninė grįžtamoji informacija', 'Patogus laiko pasirinkimas'],
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

  const [transformationsRef, transformationsSlider] = useKeenSlider({
    loop: true,
    mode: 'snap',
    renderMode: 'performance',
    slides: {
      perView: 1,
      spacing: 24,
    },
  });

  useEffect(() => {
    if (!transformationsSlider) return undefined;
    const interval = window.setInterval(() => {
      transformationsSlider.current?.next();
    }, 6000);
    return () => window.clearInterval(interval);
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

  // Use fixed header (works reliably across browsers/containers). We keep
  // the visual scrolled vs default states, and a high z-index so the header
  // stays above other content.
  const headerClass = `fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 backdrop-blur-md backdrop-saturate-150 ${
    scrolled ? 'bg-black/90 text-white border-black' : 'bg-white/50 text-black border-black'
  }`;
  const desktopLinkClass = `transition ${scrolled ? 'text-white hover:text-accent' : 'text-black hover:text-accent'}`;
  const desktopCtaClass = `inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition ${
    scrolled ? 'bg-accent text-black hover:bg-black hover:text-white' : 'bg-black text-white hover:bg-accent hover:text-black'
  }`;
  const mobileMenuBaseClass = scrolled ? 'border border-black bg-black text-white' : 'border border-black bg-white text-black';
  const mobileLinkClass = `transition ${scrolled ? 'text-white hover:text-accent' : 'text-black hover:text-accent'}`;
  const mobileCtaClass = `mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
    scrolled ? 'bg-accent text-black hover:bg-black hover:text-white' : 'bg-black text-white hover:bg-accent hover:text-black'
  }`;
  const mobileToggleClass = `inline-flex items-center justify-center rounded-full border p-2 md:hidden ${
    scrolled ? 'border-white text-white' : 'border-black text-black'
  }`;

  return (
    <div className="relative bg-white text-black">

      <header className={headerClass}>
        <div className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? 'py-4' : 'py-5'
        }`}>
          <a
            href="#hero"
            className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-white' : 'text-black'
            }`}
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
          } ${mobileMenuBaseClass} px-6 py-4 md:hidden backdrop-blur-sm transition-colors duration-300`}
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
            {/* Use a single-row grid that fits the full container width. We set grid-auto-columns to the card width so cards align in one row without causing page overflow. */}
            {/* Programs: stack on phones (single column), switch to one-row flow at large screens */}
            <div className="mt-16 flex flex-col gap-6 pb-6 lg:grid lg:grid-flow-col lg:auto-cols-[minmax(0,1fr)] lg:gap-6">
              {programs.map((item, index) => (
                <article
                  key={item.title}
                  className="relative flex w-full lg:max-w-[360px] flex-col justify-between overflow-hidden rounded-[32px] bg-black text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-2"
                  style={{ minHeight: '520px' }}
                  data-aos="fade-up"
                  data-aos-delay={index * 80}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover z-0"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
                  <div className="relative z-20 flex flex-col h-full justify-between p-8">
                    <div>
                      <h3 className="mb-2 text-3xl font-black leading-tight">{item.title}</h3>
                      <p className="mb-6 text-base text-white/90">{item.description}</p>
                    </div>
                    <div>
                      <ul className="mb-6 flex flex-wrap gap-3 text-sm">
                        {item.features.map(feature => (
                          <li key={feature} className="rounded-full bg-black/60 px-4 py-2 text-white/90 border border-white/20">{feature}</li>
                        ))}
                      </ul>
                      <div className="mb-6 flex items-center justify-between">
                        <span className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/90 px-4 py-2 text-sm font-bold text-black">{item.price}</span>
                        <a
                          href="#kontaktai"
                          className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-black transition hover:bg-black hover:text-accent"
                        >
                          Pirkti
                          <span className="inline-block text-xl">&rarr;</span>
                        </a>
                      </div>
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
                <p className="text-base text-black/70">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                  labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                  nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
                  esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <p className="mt-4 text-base text-black/70">
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                  laborum. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="sekmes" className="relative overflow-hidden bg-black py-28 text-white">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="h-full w-full bg-gradient-to-br from-black via-black to-black/90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center mb-8" data-aos="fade-up">
              <h2 className="text-4xl font-black uppercase text-white">Klientų istorijos</h2>
            </div>
            <div className="relative" data-aos="fade-up">
              <div ref={transformationsRef} className="keen-slider">
                {transformations.map((item, index) => {
                  const storyNumber = index + 1;
                  const photos = [
                    { key: 'before', ...item.before },
                    { key: 'after', ...item.after },
                  ];

                  return (
                    <article
                      key={item.name}
                      className="keen-slider__slide group rounded-[36px] border border-white/12 bg-white/[0.06] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out hover:border-accent/60"
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
                  onClick={() => transformationsSlider?.current?.prev()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-accent hover:text-accent"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  onClick={() => transformationsSlider?.current?.next()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-accent hover:text-accent"
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
                <div className="space-y-4 rounded-3xl border border-white/40 bg-white/10 p-6 text-sm text-white backdrop-blur-sm sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-black font-semibold">01</span>
                    <span>Pasirinkite kupono vertę ir gavėją</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-black font-semibold">02</span>
                    <span>Sudarysime personalizuotą planą ir tvarkaraštį</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-black font-semibold">03</span>
                    <span>Stebėsime pažangą ir suteiksime grįžtamąjį ryšį</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-4 text-sm sm:flex-row">
                <a
                  href="#kontaktai"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-semibold text-black transition duration-200 hover:-translate-y-0.5"
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

        <section id="istorijos" className="bg-black text-white">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="flex flex-col gap-4 text-center" data-aos="fade-up">
              <h2 className="text-4xl font-black uppercase">Klientų atsiliepimai</h2>
            </div>
            <div ref={testimonialsRef} className="keen-slider mt-16 h-auto overflow-visible">
              {stories.map(story => (
                <article
                  key={story.name}
                  className="keen-slider__slide rounded-[32px] border border-white bg-black p-8 h-auto"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={story.avatar}
                      alt={story.name}
                      className="h-14 w-14 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{story.name}</h3>
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
                  <p className="mt-6 text-sm leading-relaxed text-white">{story.quote}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between gap-4 text-sm">
              <button
                type="button"
                onClick={() => testimonials?.current?.prev()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition hover:border-accent hover:text-accent"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => testimonials?.current?.next()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition hover:border-accent hover:text-accent"
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
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black">+</span>

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
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">-</span>

                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="paslaugos" className="bg-black text-white">
          <div className="mx-auto max-w-6xl px-6 py-24">
              <div className="flex flex-col gap-6 text-center" data-aos="fade-up">
              <h2 className="text-4xl font-black uppercase">
                Teikiu įvairias sporto paslaugas, pritaikytas pagal jūsų poreikius ir iškeltus tikslus.
              </h2>
            </div>
            <div className="relative mt-16" data-aos="fade-up">
              <div ref={servicesRef} className="keen-slider">
                {services.map(service => (
                  <article
                    key={service.title}
                    className="keen-slider__slide flex h-full flex-col overflow-hidden rounded-[32px] border border-white/15 bg-black"
                  >
                    <figure className="relative h-56 w-full sm:h-64">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </figure>
                    <div className="flex h-full flex-col justify-between gap-6 p-8">
                      <div>
                        <h3 className="text-2xl font-semibold text-white">{service.title}</h3>
                        <p className="mt-4 text-sm text-white/90">{service.description}</p>
                      </div>
                      <ul className="space-y-2 text-sm text-white/90">
                        {service.features.map(feature => (
                          <li key={feature}>{feature}</li>
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
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition hover:border-accent hover:text-accent"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  onClick={() => servicesSlider?.current?.next()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition hover:border-accent hover:text-accent"
                >
                  &gt;
                </button>
              </div>
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
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black">+</span>
                      <span>Asmeninis įvertinimas ir aiškus startas.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black">+</span>
                      <span>Pritaikytos mitybos bei treniruočių kryptys.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black">+</span>
                      <span>Atsakymai į visus klausimus apie treniruočių procesą.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 space-y-4">
                  <h3 className="text-4xl font-black uppercase">Mane rasite:</h3>
                  {partnerLogos.map(partner => (
                    <div
                      key={partner.name}
                      className="flex items-center justify-between gap-4 rounded-3xl border border-black bg-white px-6 py-4 shadow-sm"
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
                    className="mt-2 w-full rounded-2xl border border-black bg-white px-4 py-3 text-sm text-black placeholder-black focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
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
                    className="mt-2 w-full rounded-2xl border border-black bg-white px-4 py-3 text-sm text-black placeholder-black focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
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
                    className="mt-2 w-full rounded-2xl border border-black bg-white px-4 py-3 text-sm text-black placeholder-black focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
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
                    className="mt-2 w-full rounded-2xl border border-black bg-white px-4 py-3 text-sm text-black placeholder-black focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <label className="flex items-start gap-3 text-sm text-black">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border border-black bg-black text-black focus:ring-accent"
                    required
                  />
                  <span>Sutinku su privatumo politika</span>
                </label>
                <button
                  type="submit"
                  className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-black"
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
