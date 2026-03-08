import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import Seo from '../components/Seo.jsx';
import { addItem, loadCart, saveCart } from '../state/cart';
import { getProductImageUrl, fromUploads } from '../lib/productImages';
import { sendEvent } from '../lib/tracking';

const PRODUCT_ID = '11111111-1111-1111-1111-111111111111';
const PRICE_CENTS = 19900;

const gabrieleAvatar = '/uploads/atsiliepimai/_thumbs/IMG_8426.jpeg?v=20260227-2';
const gabrieleAvatarFallback = '/uploads/atsiliepimai/_thumbs/IMG_8426.jpeg?v=20260227-2';

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
    avatar: '/uploads/atsiliepimai/_thumbs/Picture1 (1).jpg',
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
    avatar: gabrieleAvatar,
    avatarFallback: gabrieleAvatarFallback,
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
    avatar: '/uploads/atsiliepimai/_thumbs/Picture1 (1).jpg',
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
    avatar: gabrieleAvatar,
    avatarFallback: gabrieleAvatarFallback,
    quote:
      '“I never thought I could enjoy the gym – until I started training with Pavel. Training with him is never boring! All exercises are selected individually, taking into account my goals and challenges, so every workout is meaningful and purposeful. After sessions I always feel stronger, firmer and more confident. Pavel is one of the best trainers in Lithuania, and I am very grateful for the opportunity to train under the supervision of such a high-level professional.”',
  },
];

const storiesByLocale = {
  lt: storiesLt,
  en: storiesEn,
};

const handleAvatarImageError = (event) => {
  const fallbackSrc = event.currentTarget.dataset.fallbackSrc;
  if (!fallbackSrc) return;

  const resolvedFallback = new URL(fallbackSrc, window.location.origin).href;
  if (event.currentTarget.src !== resolvedFallback) {
    event.currentTarget.src = fallbackSrc;
  }
};

const contentByLocale = {
  lt: {
    title: 'Svorio metimo programa',
    subtitle: 'Pamirškite alinančias dietas, kurios nepritaikytos jūsų kasdienybei. Šis planas yra tvarus, nes jis adaptuojamas jūsų realiam gyvenimui, darbo ritmui ir kasdieniams įpročiams.',
    primaryCta: 'Pradėti dabar',
    secondaryCta: 'Užpildyti anketą',
    highlightsTitle: 'Programos akcentai',
    highlights: [
      {
        title: 'Individualus sporto planas',
        detail: 'pagal jūsų poreikius ir pajėgumą',
      },
      {
        title: 'Aiškios mitybos gairės',
        detail: 'be griežtų dietų',
      },
      {
        title: 'Technikos korekcijos',
        detail: 'saugesni ir efektyvesni pratimai',
      },
    ],
    trustTitle: 'Kodėl ši programa veikia',
    trustCards: [
      {
        title: 'Individualus sporto planas',
        text: 'pagal jūsų poreikius ir pajėgumą',
      },
      {
        title: 'Aiškios mitybos gairės',
        text: 'be griežtų dietų',
      },
      {
        title: 'Technikos korekcijos',
        text: 'saugesni ir efektyvesni pratimai',
      },
    ],
    faqTitle: 'Dažniausi klausimai',
    faq: [
      {
        q: 'Ar programa tinka pradedantiesiems?',
        a: 'Taip. Planas sudaromas pagal jūsų dabartinį fizinį pasirengimą ir palaipsniui sunkinamas.',
      },
      {
        q: 'Ar reikia laikytis griežtos dietos?',
        a: 'Ne. Pagrindas yra aiškios mitybos gairės ir realiai pritaikomi įpročiai, kuriuos įmanoma išlaikyti.',
      },
      {
        q: 'Per kiek laiko matosi pokyčiai?',
        a: 'Dauguma klientų pirmus pokyčius pajunta per 2-4 savaites, o ryškesnius rezultatus mato per 8-12 savaičių.',
      },
    ],
    finalCtaTitle: 'Pradėk šiandien',
    finalCtaText: 'Viena aiški sistema, individualus planas ir nuoseklus svorio mažinimas be chaoso.',
    cartLabel: 'Atidaryti krepšelį',
    questionnaireLabel: 'Pirmiausia noriu konsultacijos',
    heroAlt: 'Svorio metimo treniruote',
  },
  en: {
    title: 'Weight Loss Program',
    subtitle: 'Forget exhausting fad diets that don\'t fit your schedule. This weight loss plan is sustainable because it is adapted to your real life, work rhythm, and daily habits.',
    primaryCta: 'Start now',
    secondaryCta: 'Fill in questionnaire',
    highlightsTitle: 'Program highlights',
    highlights: [
      {
        title: 'Individual training plan',
        detail: 'based on your goals and current capacity',
      },
      {
        title: 'Clear nutrition guidelines',
        detail: 'without strict dieting',
      },
      {
        title: 'Technique corrections',
        detail: 'for safer and more effective workouts',
      },
    ],
    trustTitle: 'Why this program works',
    trustCards: [
      {
        title: 'Individual training plan',
        text: 'based on your goals and current capacity',
      },
      {
        title: 'Clear nutrition guidelines',
        text: 'without strict dieting',
      },
      {
        title: 'Technique corrections',
        text: 'for safer and more effective workouts',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Is this suitable for beginners?',
        a: 'Yes. The plan starts at your current level and is progressed step by step.',
      },
      {
        q: 'Do I need a strict diet?',
        a: 'No. The focus is clear nutrition principles and habits you can sustain long term.',
      },
      {
        q: 'How fast will I see results?',
        a: 'Most clients feel first progress in 2-4 weeks and see stronger changes within 8-12 weeks.',
      },
    ],
    finalCtaTitle: 'Start today',
    finalCtaText: 'One clear framework, personalized coaching, and sustainable fat loss without chaos.',
    cartLabel: 'Open cart',
    questionnaireLabel: 'I want consultation first',
    heroAlt: 'Weight loss training session',
  },
};

const transformationsLt = [
  {
    name: 'TADAS NORUŠAITIS',
    program: 'Jėgos ir raumenų auginimo',
    goal: 'Geras fizinis pasiruošimas ir mažesnis riebalinis audinys',
    result: 'Numetė 15 kg',
    period: '9 mėnesius',
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
    result: 'Numetė 14 kg per 2 mėnesius',
    period: '2 mėnesius',
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
  }
];


const transformationsEn = [
  {
    name: 'TADAS NORUŠAITIS',
    program: 'Strength & muscle gain',
    goal: 'Better overall fitness and lower body fat',
    result: 'Gained 15 kg of muscle in 9 months',
    period: '9 months',
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
    result: 'Lost 14 kg of body fat in 2 months',
    period: '2 months',
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
  }
];

const transformationsByLocale = {
  lt: transformationsLt,
  en: transformationsEn,
};

export default function WeightLossLanding() {
  const location = useLocation();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);
  const content = contentByLocale[locale];

  const questionnairePath = locale === 'lt' ? '/lt/anketa' : '/en/questionnaire';
  const cartPath = locale === 'lt' ? '/lt/krepselis' : '/en/cart';
  const productName = locale === 'lt' ? 'Svorio metimo programa' : 'Weight Loss Program';
  const heroImage = getProductImageUrl(PRODUCT_ID) || fromUploads('brokolis.jpg');



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
      breakpoints: {
        '(min-width: 768px)': {
          slides: {
            perView: 1,
            spacing: 24,
          },
        },
      },
    },
    [
      slider => {
        let timeout;
        let isInteracting = false;

        const clearNextTimeout = () => clearTimeout(timeout);
        const nextTimeout = () => {
          clearTimeout(timeout);
          if (isInteracting) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 7000);
        };

        slider.on('created', () => {
          const container = slider.container;

          const onPointerDown = () => { isInteracting = true; clearNextTimeout(); };
          const onPointerUp = () => { isInteracting = false; nextTimeout(); };
          const onMouseEnter = () => { isInteracting = true; clearNextTimeout(); };
          const onMouseLeave = () => { isInteracting = false; nextTimeout(); };

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

        slider.on('dragStarted', () => { isInteracting = true; clearNextTimeout(); });
        slider.on('animationEnded', () => { isInteracting = false; nextTimeout(); });
        slider.on('updated', nextTimeout);
      },
    ]
  );



  useEffect(() => {
    sendEvent('view_item', {
      currency: 'EUR',
      value: PRICE_CENTS / 100,
      items: [
        {
          item_id: PRODUCT_ID,
          item_name: productName,
          price: PRICE_CENTS / 100,
          quantity: 1,
        },
      ],
    });
  }, [productName]);

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

  const onStartNow = () => {
    const cart = loadCart();
    const next = addItem(cart, {
      kind: 'product',
      productId: PRODUCT_ID,
      name: productName,
      imageUrl: heroImage,
      unitPriceCents: PRICE_CENTS,
      qty: 1,
    });
    saveCart(next);

    sendEvent('add_to_cart', {
      currency: 'EUR',
      value: PRICE_CENTS / 100,
      items: [
        {
          item_id: PRODUCT_ID,
          item_name: productName,
          price: PRICE_CENTS / 100,
          quantity: 1,
        },
      ],
    });

    try {
      window.dispatchEvent(new Event('cart:open'));
    } catch {
      // ignore
    }
  };

  return (
    <>
      <Seo locale={locale} />
      <main className="bg-white text-black">
        <section className="relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0">
            <picture>
              <source type="image/avif" srcSet={[320, 480, 640, 768, 960, 1024, 1280, 1440, 1600].map(w => `${fromUploads(`_optimized/brokolis-${w}w.avif`)} ${w}w`).join(', ')} sizes="100vw" />
              <source type="image/webp" srcSet={[320, 480, 640, 768, 960, 1024, 1280, 1440, 1600].map(w => `${fromUploads(`_optimized/brokolis-${w}w.webp`)} ${w}w`).join(', ')} sizes="100vw" />
              <img src={heroImage} alt={content.heroAlt} className="h-full w-full object-cover opacity-70" loading="eager" fetchPriority="high" />
            </picture>
            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(0,0,0,0.85)_10%,rgba(0,0,0,0.45)_45%,rgba(220,244,30,0.28)_100%)]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
            <div className="max-w-3xl space-y-8">
              <div className="space-y-4">
                <h1 className="font-heading text-4xl font-black leading-tight sm:text-5xl md:text-6xl">{content.title}</h1>
                <p className="max-w-2xl text-base text-white/70 sm:text-lg">{content.subtitle}</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={onStartNow}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full glass-green-surface px-8 py-3 text-lg font-extrabold text-black transition hover:-translate-y-0.5"
                >
                  {content.primaryCta}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="apie-mane" className="bg-white py-20 text-black">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <figure className="rounded-2xl overflow-hidden">
                  <img
                    src={fromUploads('_optimized/IMG_0462-scaled-e1750332801471-1347w.webp')}
                    alt={
                      locale === 'lt'
                        ? 'Asmeninis treneris Pavel Kaliadziuk – apie mane'
                        : 'Personal trainer Pavel Kaliadziuk – about me'
                    }
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </figure>
              </div>
              <div>
                <h2 className="font-heading text-4xl font-black uppercase">{locale === 'lt' ? 'Apie mane' : 'About me'}</h2>
                <div className="mt-6 space-y-4 text-base text-black/75">
                  {locale === 'lt' ? (
                    <>
                      <p>
                        Labas, aš Pavel Kaliadziuk — asmeninis treneris Vilniuje, sveikatingumo treneris ir biomechanikos specialistas,
                        jau daugiau nei aštuonerius metus padedantis žmonėms raumenų auginimo, svorio metimo ir judėjimo be skausmo kelyje.
                      </p>
                      <p>
                        <strong className="font-semibold text-black">Skausmas neturi būti tavo sporto norma.</strong> Dauguma žmonių stringa ne
                        dėl motyvacijos stokos, o dėl to, kad treniruojasi per skausmą ir kartoja tas pačias technikos klaidas.
                      </p>
                      <p>
                        <strong className="font-semibold text-black">Mano stiprybė — biomechanika ir judėjimas be skausmo.</strong> Esu asmeninis
                        treneris Vilniuje ir jau daugiau nei 8 metus padedu žmonėms saugiai siekti rezultatų: raumenų auginimo, svorio metimo ir
                        tvirto, funkcionalaus kūno.
                      </p>
                      <p>
                        <strong className="font-semibold text-black">Ką tai reiškia tau praktiškai?</strong> Kartu išmokstame judėti tiksliai,
                        mažiname pečių, nugaros ir kelių perkrovas, o progresą kuriame be bereikalingų traumų ir pasikartojančių skausmų.
                      </p>
                      <p>
                        <strong className="font-semibold text-black">8+ metų patirtis ir sporto universiteto išsilavinimas.</strong> Mano metodika
                        paremta ne spėjimais, o anatomija, biomechanika, praktika su klientais ir nuosekliu planu, pritaikytu tavo kūnui.
                      </p>
                      <p>
                        Esu praėjęs kelią nuo traumų iki protingo judėjimo, todėl padedu tau išvengti klaidų, kurios kainuoja laiką, sveikatą ir
                        motyvaciją. Mes dirbame taip, kad kūnas stiprėtų, o ne „gesintų gaisrus“ po kiekvienos treniruotės.
                      </p>
                      <p>
                        Jei nori ne tik atrodyti geriau, bet ir jaustis stabiliai kasdienybėje, pradėkime nuo pagrindo — nuo judėjimo be skausmo.
                        Tada raumenų auginimas ir svorio metimas vyksta greičiau, saugiau ir tvariau.
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
                        Through movement, I found stability and realized that when you learn to control your body, overcoming fear and doubt becomes
                        achievable. Today, my mission is to share this experience.
                      </p>
                      <p>
                        I work with clients looking to break through physical barriers and build habits for an active life. I focus on biomechanics,
                        meaning we reduce the risk of injuries and make workouts efficient and sustainable.
                        I provide realistic, clear advice without unnecessary restrictions.
                      </p>
                      <p>
                        <strong className="font-semibold text-black">My experience:</strong> over 8 years in the field and a university degree
                        in sports backing every method I use.
                      </p>
                      <p>
                        <strong className="font-semibold text-black">My goal is simple:</strong> to help you realize that movement brings energy
                        and peace. I strive for each client to discover their true strength and achieve lasting results.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0">
            <picture>
              <source type="image/avif" srcSet={[320, 480, 640, 768, 960, 1024, 1280, 1440, 1600, 1920, 2112].map(w => `${fromUploads(`_optimized/IMG_0481-scaled-${w}w.avif`)} ${w}w`).join(', ')} sizes="100vw" />
              <source type="image/webp" srcSet={[320, 480, 640, 768, 960, 1024, 1280, 1440, 1600, 1920, 2112].map(w => `${fromUploads(`_optimized/IMG_0481-scaled-${w}w.webp`)} ${w}w`).join(', ')} sizes="100vw" />
              <img src={fromUploads('IMG_0481-scaled.jpg')} alt="" className="h-full w-full object-cover" loading="lazy" />
            </picture>
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-black text-center uppercase tracking-tight text-white sm:text-5xl">{content.trustTitle}</h2>
            
            <div className="mx-auto mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {content.trustCards.map((card, idx) => (
                <article key={card.title} className="flex flex-col items-start rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all hover:bg-white/20 hover:-translate-y-1">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCF41E] text-slate-900 font-black font-heading text-2xl">
                    {idx + 1}
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase text-white">{card.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-white/80">{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto py-16 md:py-24 bg-slate-50/50">
          <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col gap-3 text-center mb-16">
              <h2 className="font-heading text-4xl font-black uppercase text-slate-900">
                {locale === 'lt' ? 'Klientų pokyčiai' : 'Client Transformations'}
              </h2>
              <p className="text-base text-slate-600 max-w-2xl mx-auto">
                {locale === 'lt'
                  ? 'Rezultatai, kalbantys patys už save.'
                  : 'Results that speak for themselves.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-8 md:gap-12">
              {['JOLITA VARNAGIRIENĖ', 'ROKAS RUTKAUSKAS', 'MIROSLAV MICHOLČ']
                .map(name => transformationsByLocale[locale].find(t => t.name === name))
                .filter(Boolean)
                .map((item) => (
                  <article key={item.name} className="flex flex-col md:flex-row gap-6 sm:gap-8 rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] items-center">
                    
                    <div className="flex-1 w-full space-y-6 md:pr-4">
                      <h3 className="font-heading text-2xl sm:text-3xl font-black uppercase text-slate-900">{item.name}</h3>
                      
                      <dl className="space-y-4">
                        <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                          <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                            {locale === 'lt' ? 'Tikslas' : 'Goal'}
                          </dt>
                          <dd className="font-medium text-slate-800 leading-relaxed m-0">{item.goal}</dd>
                        </div>

                        <div className="rounded-2xl bg-[linear-gradient(135deg,#ffffff_0%,#edf3bf_100%)] p-5 border border-black/5">
                          <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-2">
                            {locale === 'lt' ? 'Rezultatas' : 'Result'}
                          </dt>
                          <dd className="text-xl font-bold text-slate-900 m-0">{item.result}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex-1 w-full flex gap-3 sm:gap-4 shrink-0 max-w-md mx-auto md:max-w-none">
                      <div className="flex-1 relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 border border-black/5 shadow-inner">
                        <img
                          src={item.before.image}
                          alt={`${locale === 'lt' ? 'Prieš' : 'Before'} ${item.name}`}
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{ objectPosition: item.before.objectPosition || 'center top' }}
                          loading="lazy"
                        />
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                           {item.before.weight}
                        </div>
                        <div className="absolute top-3 left-3 bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-sm">
                           {locale === 'lt' ? 'Prieš' : 'Before'}
                        </div>
                      </div>
                      
                      <div className="flex-1 relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 border border-black/5 shadow-inner group">
                        <img
                          src={item.after.image}
                          alt={`${locale === 'lt' ? 'Po' : 'After'} ${item.name}`}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ objectPosition: item.after.objectPosition || 'center top' }}
                          loading="lazy"
                        />
                        <div className="absolute bottom-3 right-3 bg-[#DCF41E] text-slate-900 text-xs font-black px-3 py-1.5 rounded-full shadow-md">
                           {item.after.weight}
                        </div>
                        <div className="absolute top-3 left-3 bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-sm">
                           {locale === 'lt' ? 'Po' : 'After'}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
            </div>

            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={onStartNow}
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#DCF41E] px-8 text-sm font-bold uppercase tracking-widest text-black transition-all hover:scale-105 hover:bg-white shadow-[0_0_20px_rgba(220,244,30,0.3)]"
              >
                {locale === 'lt' ? 'Pradėti savo istoriją' : 'Start your story'}
              </button>
            </div>
          </div>
        </section>

        

        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0">
             <img src={fromUploads('IMG_0488-scaled.jpg')} alt="" className="h-full w-full object-cover" loading="lazy" />
             <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl font-black uppercase text-white sm:text-5xl">{content.faqTitle}</h2>
          </div>
          <div className="relative mx-auto max-w-3xl px-6 lg:px-8 mt-12 sm:mt-16">
            <div className="flex flex-col gap-6">
              {content.faq.map((item) => (
                <div key={item.q} className="rounded-[1.5rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl text-left p-6 sm:p-8 flex items-start gap-4 sm:gap-6 transition-all hover:bg-white/20 duration-300">
                  <div className="flex-shrink-0 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#DCF41E] text-slate-900 shadow-lg mt-1 sm:mt-0 font-heading text-2xl font-black">
                    ?
                  </div>
                  <div>
                    <h3 className="uppercase font-heading text-xl font-bold text-white mb-3">
                      {item.q}
                    </h3>
                    <div className="text-base leading-relaxed text-white/80">
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        

        <section className="mx-auto py-16 md:py-20">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col gap-3 text-center mb-12" data-aos="fade-up">

              <h2 className="font-heading text-4xl font-black uppercase text-slate-900">
                {locale === 'lt' ? 'Klientų atsiliepimai' : 'Client testimonials'}
              </h2>
              <p className="text-base text-slate-600 max-w-2xl mx-auto">
                {locale === 'lt'
                  ? 'Tikros istorijos iš žmonių, kurie jaučiasi stipresni, sveikesni ir labiau pasitikintys savimi.'
                  : 'Real stories from people who feel stronger, healthier, and more confident.'}
              </p>
            </div>

            <div className="relative">
              <div ref={testimonialsRef} className="keen-slider overflow-visible">
                {storiesByLocale[locale].map((story) => (
                  <div key={story.name} className="keen-slider__slide py-4 px-4">
                    <article className="flex flex-col h-full rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                        {story.avatar ? (
                          <img
                            src={story.avatar}
                            data-fallback-src={story.avatarFallback || ''}
                            onError={handleAvatarImageError}
                            alt={locale === 'lt' ? `Kliento nuotrauka — ${story.name}` : `Client photo — ${story.name}`}
                            className="h-14 w-14 rounded-full object-cover border-2 border-[#DCF41E]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DCF41E] text-xl font-bold text-black uppercase">
                            {story.name.charAt(0)}
                          </div>
                        )}
                        <div className="text-left">
                          <h3 className="font-heading text-lg font-bold text-slate-900">{story.name}</h3>
                          <div className="flex text-[#DCF41E]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <p className="text-sm leading-relaxed text-slate-600 italic">
                          "{story.quote.replace(/^“|”$/g, '')}"
                        </p>
                      </div>
                    </article>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => testimonials?.current?.prev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-slate-100 text-slate-900 hover:bg-[#DCF41E] transition-colors"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                onClick={() => testimonials?.current?.next()}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-slate-100 text-slate-900 hover:bg-[#DCF41E] transition-colors"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,#ffffff_0%,#edf3bf_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="p-8 md:p-16 text-slate-900 flex flex-col items-start sm:items-center sm:text-center">
              <h2 className="font-heading text-4xl font-black uppercase leading-tight sm:text-5xl">{content.finalCtaTitle}</h2>
              <p className="mt-6 max-w-2xl text-lg text-black/70">{content.finalCtaText}</p>
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <button
                  type="button"
                  onClick={onStartNow}
                  className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-[#DCF41E] px-10 py-3 text-lg font-black text-black transition hover:-translate-y-0.5"
                >
                  {content.primaryCta}
                </button>
                <div className="text-4xl font-black text-slate-900">199€</div>
              </div>
              <Link to={questionnairePath} className="mt-8 inline-flex text-sm font-bold uppercase tracking-wider text-black/70 transition-colors hover:text-black underline underline-offset-4">
                {content.questionnaireLabel}
              </Link>
            </div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 p-3 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-black/55">{content.title}</p>
              <p className="text-lg font-black">199€</p>
            </div>
            <button
              type="button"
              onClick={onStartNow}
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full glass-green-surface px-6 py-2 text-sm font-extrabold text-black"
            >
              {content.primaryCta}
            </button>
          </div>
        </div>
        <div className="h-20 md:hidden" aria-hidden="true" />
      </main>
    </>
  );
}
