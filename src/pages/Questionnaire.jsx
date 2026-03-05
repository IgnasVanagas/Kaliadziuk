import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthProvider';
import { addItem, loadCart, saveCart } from '../state/cart';

const fromUploads = (file) => `/uploads/${String(file || '').replace(/^\/+/, '')}`;

const heroImage = fromUploads('_optimized/IMG_0443-scaled-1920w.webp');
const accentImage = fromUploads('_optimized/IMG_0469-scaled-2560w.webp');

const RECOMMENDATION_PROGRAM_IDS = {
  weightLoss: '11111111-1111-1111-1111-111111111111',
  muscleGain: '22222222-2222-2222-2222-222222222222',
  homeTraining: '33333333-3333-3333-3333-333333333333',
  mobility: '44444444-4444-4444-4444-444444444444',
  vip: '55555555-5555-5555-5555-555555555555',
  homeTrainingPlus: '66666666-6666-6666-6666-666666666666',
};

const RECOMMENDATION_PRICE_CENTS_BY_ID = {
  [RECOMMENDATION_PROGRAM_IDS.weightLoss]: 19900,
  [RECOMMENDATION_PROGRAM_IDS.muscleGain]: 19900,
  [RECOMMENDATION_PROGRAM_IDS.homeTraining]: 14700,
  [RECOMMENDATION_PROGRAM_IDS.mobility]: 9700,
  [RECOMMENDATION_PROGRAM_IDS.vip]: 49900,
  [RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus]: 29900,
};

const recommendationProgramsByLocale = {
  lt: {
    [RECOMMENDATION_PROGRAM_IDS.vip]: {
      productId: RECOMMENDATION_PROGRAM_IDS.vip,
      title: 'VIP individualus koučingas',
      subtitle: 'Maksimalus dėmesys (12 savaičių)',
      description: 'Aukščiausios kokybės programa su visiškai individualia priežiūra, kasdieniu bendravimu ir gilia analize.',
      duration: '12 savaičių',
      price: '499€',
      image: fromUploads('IMG_0469-scaled.jpg'),
      result: 'Maksimali transformacija per trumpiausią laiką.',
      extras: [
        'Kasdienė komunikacija ir priežiūra',
        'Neribotos konsultacijos proceso metu',
        'Technikos video analizė realiu laiku',
        'Individuali mitybos strategija',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.weightLoss]: {
      productId: RECOMMENDATION_PROGRAM_IDS.weightLoss,
      title: 'Svorio metimo programa',
      subtitle: '8–12 savaičių',
      description: 'Tvari ir aiški sistema svorio mažinimui be chaoso, su individualiu planu ir mitybos gairėmis.',
      duration: '8–12 savaičių',
      price: '199€',
      image: fromUploads('brokolis.jpg'),
      result: 'Svorio mažinimas vyksta nuosekliai ir saugiai.',
      extras: [
        'Individualus sporto planas',
        'Aiškios mitybos gairės',
        'Savaitinė progreso peržiūra',
        'Startinė konsultacija',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.muscleGain]: {
      productId: RECOMMENDATION_PROGRAM_IDS.muscleGain,
      title: 'Raumenų auginimo programa',
      subtitle: '8–12 savaičių',
      description: 'Progresyvi programa liesos raumenų masės auginimui su aiškia apkrovų ir mitybos struktūra.',
      duration: '8–12 savaičių',
      price: '199€',
      image: fromUploads('paaugliu4.jpg'),
      result: 'Raumenų masė ir jėga auga pagal aiškią metodiką.',
      extras: [
        'Progresijai skirtas planas',
        'Mitybos gairės masei',
        'Technikos korekcijos',
        'Progreso sekimas kas savaitę',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus]: {
      productId: RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus,
      title: 'Namų treniruotės + Asmeninė priežiūra',
      subtitle: '8 savaitės',
      description: 'Namų treniruotės su nuolatine trenerio priežiūra, technikos analize ir nuosekliu palaikymu.',
      duration: '8 savaitės',
      price: '299€',
      image: fromUploads('grupine8.jpg'),
      result: 'Aiškus progresas namų aplinkoje su profesionalo kontrole.',
      extras: [
        'Individualus namų planas',
        'Kasdienis trenerio ryšys',
        'Video technikos analizė',
        'Plano adaptacijos pagal progresą',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.homeTraining]: {
      productId: RECOMMENDATION_PROGRAM_IDS.homeTraining,
      title: 'Namų treniruočių programa',
      subtitle: '6–8 savaitės',
      description: 'Sistema treniruotėms namuose su aiškia struktūra, kad rezultatus pasiektumėte be sporto salės.',
      duration: '6–8 savaitės',
      price: '147€',
      image: fromUploads('grupine6.jpg'),
      result: 'Stiprus kūnas ir aiški namų treniruočių sistema.',
      extras: [
        'Aiški A–Z namų treniruočių sistema',
        'Pratimų video biblioteka',
        'Technikos įvedimas nuo pradžių',
        'Progreso struktūra savaitėms',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.mobility]: {
      productId: RECOMMENDATION_PROGRAM_IDS.mobility,
      title: 'Mobilumo lavinimo programa',
      subtitle: '6–8 savaitės',
      description: 'Kasdienis mobilumo planas, skirtas mažinti įtampą ir gerinti judesio kokybę bei savijautą.',
      duration: '6–8 savaitės',
      price: '97€',
      image: fromUploads('_optimized/testavimas4-960w.webp'),
      result: 'Daugiau laisvės judėti be įtampos ir skausmo.',
      extras: [
        '10–30 min. mobilumo rutina kasdienai',
        'Aiški judesio video seka',
        'Laikysenos ir judesių kontrolės gerinimas',
        'Startinė konsultacija pagal būklę',
      ],
    },
  },
  en: {
    [RECOMMENDATION_PROGRAM_IDS.vip]: {
      productId: RECOMMENDATION_PROGRAM_IDS.vip,
      title: 'VIP individual coaching',
      subtitle: 'Maximum focus (12 weeks)',
      description: 'Premium-level coaching with fully individualized support, daily communication, and deep analysis.',
      duration: '12 weeks',
      price: '499€',
      image: fromUploads('IMG_0469-scaled.jpg'),
      result: 'Maximum transformation in the shortest time.',
      extras: [
        'Daily communication and supervision',
        'Unlimited consultations during the process',
        'Real-time technique video analysis',
        'Individual nutrition strategy',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.weightLoss]: {
      productId: RECOMMENDATION_PROGRAM_IDS.weightLoss,
      title: 'Weight loss program',
      subtitle: '8–12 weeks',
      description: 'A sustainable weight-loss system with clear structure, personalized training, and nutrition guidance.',
      duration: '8–12 weeks',
      price: '199€',
      image: fromUploads('brokolis.jpg'),
      result: 'Weight decreases sustainably and safely.',
      extras: [
        'Personalized training plan',
        'Clear nutrition guidance',
        'Weekly progress review',
        'Initial consultation',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.muscleGain]: {
      productId: RECOMMENDATION_PROGRAM_IDS.muscleGain,
      title: 'Muscle building program',
      subtitle: '8–12 weeks',
      description: 'A progressive program for lean muscle growth with clear training and nutrition structure.',
      duration: '8–12 weeks',
      price: '199€',
      image: fromUploads('paaugliu4.jpg'),
      result: 'Muscle mass and strength increase with a clear method.',
      extras: [
        'Progressive hypertrophy plan',
        'Nutrition guidance for muscle gain',
        'Technique corrections',
        'Weekly progress tracking',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus]: {
      productId: RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus,
      title: 'Home workouts + personal supervision',
      subtitle: '8 weeks',
      description: 'Home training with close coach supervision, technique checks, and ongoing support.',
      duration: '8 weeks',
      price: '299€',
      image: fromUploads('grupine8.jpg'),
      result: 'Structured home progress with professional oversight.',
      extras: [
        'Individual home plan',
        'Daily coach communication',
        'Video technique analysis',
        'Program adjustments by progress',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.homeTraining]: {
      productId: RECOMMENDATION_PROGRAM_IDS.homeTraining,
      title: 'Home workout program',
      subtitle: '6–8 weeks',
      description: 'A practical at-home system for results without a gym, with clear week-by-week structure.',
      duration: '6–8 weeks',
      price: '147€',
      image: fromUploads('grupine6.jpg'),
      result: 'A strong body and a clear home training system.',
      extras: [
        'Clear A–Z home training structure',
        'Exercise video library',
        'Technique onboarding from day one',
        'Weekly progression system',
      ],
    },
    [RECOMMENDATION_PROGRAM_IDS.mobility]: {
      productId: RECOMMENDATION_PROGRAM_IDS.mobility,
      title: 'Mobility development program',
      subtitle: '6–8 weeks',
      description: 'A daily mobility plan to reduce tension and improve movement quality and body awareness.',
      duration: '6–8 weeks',
      price: '97€',
      image: fromUploads('_optimized/testavimas4-960w.webp'),
      result: 'More freedom to move without tension.',
      extras: [
        '10–30 min daily mobility routine',
        'Clear movement video sequence',
        'Posture and control improvements',
        'Initial consultation based on your status',
      ],
    },
  },
};

const copyByLocale = {
  lt: {
    hero: {
      title: 'Asmeninio plano anketa',
      subtitle: 'Keli klausimai padeda tiksliai suprasti tavo situaciją ir sukurti personalizuotą, saugų planą.',
      time: '4 etapai, 3-5 min.'
    },
    stages: [
      {
        id: 'stage-1',
        label: '1 etapas',
        title: 'Vizija ir tikslai',
        kicker: 'Emocinis įtraukimas',
        goalQuestion: 'Koks tavo pagrindinis tikslas šiandien?',
        goals: [
          'Atsikratyti nugaros/sąnarių skausmo ir judėti laisvai',
          'Sumažinti kūno svorį ir sustiprėti',
          'Padidinti raumenų masę ir pagerinti laikyseną',
          'Pasiekti maksimalų fizinį efektyvumą (profesionalus lygis)'
        ],
        motivationQuestion: 'Ar teko anksčiau sportuoti savarankiškai? Kas labiausiai trukdė pasiekti rezultatą?',
        motivationOptions: [
          'Trūko aiškaus plano ar sistemos',
          'Trūko motyvacijos ir palaikymo',
          'Sustabdė traumos ar skausmai',
          'Neteko bandyti',
          'Kita (įrašyti savo variantą)'
        ],
        motivationPlaceholder: 'Trumpai ir konkrečiai...'
      },
      {
        id: 'stage-2',
        label: '2 etapas',
        title: 'Gyvenimo būdo diagnostika',
        kicker: 'Kasdienybės kontekstas',
        workdayQuestion: 'Apibūdink savo darbo dieną:',
        workdayOptions: [
          'Pasyvus sėdimas darbas (prie kompiuterio/vairo)',
          'Lengvas judėjimas (pardavimai, konsultavimas)',
          'Aktyvus fizinis darbas'
        ],
        sleepQuestion: 'Įvertink savo miego kokybę (nuo 1 iki 10):',
        trackerQuestion: 'Ar naudoji pulsometrą ar išmanųjį laikrodį sekimui?',
        trackerOptions: [
          'Taip, nuolat',
          'Turiu, bet naudoju retai',
          'Ne, nenaudoju'
        ],
        environmentQuestion: 'Kokioje aplinkoje labiau norite sportuoti?',
        environmentOptions: [
          'Namuose',
          'Sporto salėje',
          'Mišriai (namai + salė)'
        ]
      },
      {
        id: 'stage-3',
        label: '3 etapas',
        title: 'Biomechanika ir traumos',
        kicker: 'Skausmo identifikavimas',
        discomfortQuestion: 'Pažymėk diskomfortą judesiuose arba sveikatos būkles:',
        discomfortOptions: [
          'Pasilenkiant į priekį (nugaros apačia)',
          'Keliant daiktą virš galvos (pečiai)',
          'Einant ar lipant laiptais (keliai/klubai)',
          'Sukant korpusą į šonus',
          'Turiu plokščiapėdystę',
          'Nejaučiu jokio diskomforto / nusiskundimų'
        ],
        injuryQuestion: 'Ar esi turėjęs (-usi) traumų, kurios vis dar primena apie save?',
        injuryOptions: [
          'Ne',
          'Taip'
        ],
        injuryPlaceholder: 'Pvz., "Kelio trauma prieš 2 metus"',
      },
      {
        id: 'stage-4',
        label: '4 etapas',
        title: 'Baziniai duomenys',
        kicker: 'Rizikos įvertinimas',
        metricsTitle: 'Tavo fiziniai rodikliai:',
        ageLabel: 'Amžius',
        weightLabel: 'Svoris (kg)',
        heightLabel: 'Ūgis (cm)',
        familyQuestion: 'Ar tavo artimoje giminėje yra buvę širdies susirgimų atvejų?',
        familyOptions: [
          'Ne',
          'Taip (tėvai/seneliai)'
        ],
        genderQuestion: 'Kokia tavo lytis?',
        genderOptions: [
          'Vyras',
          'Moteris'
        ],
        stressQuestion: 'Kaip įvertintum savo streso lygį?',
        stressOptions: [
          'Streso lygis žemas',
          'Vidutinis streso lygis',
          'Aukštas streso lygis'
        ],
        budgetQuestion: 'Kiek lėšų planuojate skirti rezultatui pasiekti?',
        budgetOptions: [
          'Iki 120 €',
          '120–180 €',
          '180–240 €',
          '320+ €'
        ]
      }
    ],
    summary: {
      title: 'Kaip norite, kad su jumis susisiekčiau?',
      body: 'Galite palikti el. paštą, telefono numerį arba abu. Tai reikalinga individualaus plano aptarimui.',
      button: 'Išsaugoti ir tęsti',
      recommendationTitle: 'Pagal jūsų atsakymus labiausiai tinka:',
      recommendationBody: 'Ši programa parinkta pagal tikslą, biudžetą, treniruočių aplinką ir sveikatos kontekstą.'
    },
    navigation: {
      next: 'Toliau',
      back: 'Atgal'
    },
    labels: {
      selected: 'Pasirinkta',
      sleep: 'Miego kokybė',
      sleepScale: {
        low: 'Prasta',
        high: 'Puiki'
      },
      steps: 'Etapai',
      completed: 'Užsipildymas',
      result: 'Rezultatas'
    }
  },
  en: {
    hero: {
      title: 'Personal plan questionnaire',
      subtitle: 'A few focused questions help us understand your situation and craft a safe, effective plan.',
      time: '4 stages, 3-5 min.'
    },
    stages: [
      {
        id: 'stage-1',
        label: 'Stage 1',
        title: 'Vision and goals',
        kicker: 'Emotional engagement',
        goalQuestion: 'What is your primary goal today?',
        goals: [
          'Get rid of back/joint pain and move freely',
          'Lose body weight and get stronger',
          'Increase muscle mass and improve posture',
          'Reach maximum physical performance (professional level)'
        ],
        motivationQuestion: 'Have you tried training on your own before? What blocked your results the most?',
        motivationOptions: [
          'Lack of clear plan or system',
          'Lack of motivation and support',
          'Injuries or pain stopped me',
          'No visible results in a short time',
          'Other (please specify)...'
        ],
        motivationPlaceholder: 'Short and specific...'
      },
      {
        id: 'stage-2',
        label: 'Stage 2',
        title: 'Lifestyle diagnosis',
        kicker: 'Daily context',
        workdayQuestion: 'Describe your workday:',
        workdayOptions: [
          'Sedentary desk/driver work',
          'Light movement (sales, consulting)',
          'Active physical work'
        ],
        sleepQuestion: 'Rate your sleep quality (1 to 10):',
        trackerQuestion: 'Do you use a heart-rate monitor or smart watch?',
        trackerOptions: [
          'Yes, regularly',
          'I have one, but rarely use it',
          'No, I do not use one'
        ],
        environmentQuestion: 'Which training environment do you prefer?',
        environmentOptions: [
          'At home',
          'Gym',
          'Mixed (home + gym)'
        ]
      },
      {
        id: 'stage-3',
        label: 'Stage 3',
        title: 'Biomechanics and injuries',
        kicker: 'Pain identification',
        discomfortQuestion: 'Select discomfort during movements or conditions:',
        discomfortOptions: [
          'Forward bending (lower back)',
          'Lifting an object overhead (shoulders)',
          'Walking or climbing stairs (knees/hips)',
          'Rotating the torso to the sides',
          'I have flat feet',
          'No discomfort / no complaints'
        ],
        injuryQuestion: 'Have you had injuries that still affect you?',
        injuryOptions: [
          'No',
          'Yes'
        ],
        injuryPlaceholder: 'E.g., "Knee injury 2 years ago"'
      },
      {
        id: 'stage-4',
        label: 'Stage 4',
        title: 'Basic data',
        kicker: 'Risk awareness',
        metricsTitle: 'Your physical metrics:',
        ageLabel: 'Age',
        weightLabel: 'Weight (kg)',
        heightLabel: 'Height (cm)',
        familyQuestion: 'Has anyone in your close family had heart conditions?',
        familyOptions: [
          'No',
          'Yes (parents/grandparents)'
        ],
        genderQuestion: 'What is your gender?',
        genderOptions: [
          'Male',
          'Female'
        ],
        stressQuestion: 'How would you rate your stress level?',
        stressOptions: [
          'Low stress level',
          'Medium stress level',
          'High stress level'
        ],
        budgetQuestion: 'How much are you ready to invest to reach your result?',
        budgetOptions: [
          'Up to €120',
          '€120–€180',
          '€180–€240',
          '€320+'
        ]
      }
    ],
    summary: {
      title: 'How should I contact you?',
      body: 'You can leave your email, phone number, or both. This is needed to discuss your individual plan.',
      button: 'Save and continue',
      recommendationTitle: 'Based on your answers, the best fit is:',
      recommendationBody: 'This recommendation is weighted by your goal, budget, preferred environment, and health context.'
    },
    navigation: {
      next: 'Next',
      back: 'Back'
    },
    labels: {
      selected: 'Selected',
      sleep: 'Sleep quality',
      sleepScale: {
        low: 'Poor',
        high: 'Great'
      },
      steps: 'Stages',
      completed: 'Completion',
      result: 'Result'
    }
  }
};

const ToggleButton = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`w-full text-pretty rounded-2xl border px-5 py-4 text-left text-base font-medium transition-all duration-200 no-underline ${
      active
        ? 'border-black bg-black text-white shadow-xl scale-[1.02]'
        : 'border-black/10 bg-white hover:border-black/40 hover:bg-zinc-50'
    }`}
  >
    <div className="relative flex w-full items-center justify-start">
      <span className="pr-8">{label}</span>
      {active && (
        <svg className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 shrink-0 text-[#DCF41E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  </button>
);

const RangeSlider = ({ value, min, max, step, onChange, background }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  // Scale from 1.0 up to 1.8 depending on value
  const scale = 1 + (percentage / 100) * 0.8; 

  return (
    <div className="relative mt-8 mb-6">
       <div 
          className="absolute -top-10 -translate-x-1/2 flex items-center justify-center pointer-events-none"
          style={{ 
            left: `calc(${percentage}% + ${(8 - percentage * 0.16)}px)` 
          }}
       >
         <span 
            className="font-black text-slate-900 transition-transform duration-100 ease-out text-2xl"
            style={{ transform: `scale(${scale})` }}
         >
           {Math.round(value)}
         </span>
       </div>

       <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
         onChange={onChange}
         className="questionnaire-range h-4 w-full cursor-pointer appearance-none rounded-full"
          style={{ background }}
       />
    </div>
  );
};

export default function Questionnaire() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { step } = useParams();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);
  const content = copyByLocale[locale];

  const [goal, setGoal] = useState('');
  const [motivation, setMotivation] = useState('');
  const [budget, setBudget] = useState('');
  const [budgetSliderValue, setBudgetSliderValue] = useState(0);
  const [workday, setWorkday] = useState('');
  const [sleep, setSleep] = useState(7);
  const [tracker, setTracker] = useState('');
  const [trainingEnvironment, setTrainingEnvironment] = useState('');
  const [discomforts, setDiscomforts] = useState([]);
  const [injury, setInjury] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [family, setFamily] = useState('');
  const [stress, setStress] = useState(5);
  const [gender, setGender] = useState('');
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProgressHydrated, setIsProgressHydrated] = useState(false);
  const [errorPopup, setErrorPopup] = useState(null); // { title: string, message: string }

  const budgetOptions = content.stages[3]?.budgetOptions || [];
  const maxBudgetIndex = Math.max(budgetOptions.length - 1, 0);
  const clampedBudgetSliderValue = Math.min(Math.max(budgetSliderValue, 0), maxBudgetIndex);
  const normalizedBudgetIndex = Math.min(Math.max(Math.round(clampedBudgetSliderValue), 0), maxBudgetIndex);
  const budgetProgress = maxBudgetIndex > 0
    ? (clampedBudgetSliderValue / maxBudgetIndex) * 100
    : 0;

  const handleBudgetChange = (event) => {
    const nextRawValue = Number(event.target.value);
    if (Number.isNaN(nextRawValue)) return;

    setBudgetSliderValue(nextRawValue);

    const nextIndex = Math.min(Math.max(Math.round(nextRawValue), 0), maxBudgetIndex);
    const nextBudget = budgetOptions[nextIndex];
    if (nextBudget && nextBudget !== budget) setBudget(nextBudget);
  };

  const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
  const hasSelection = (value) => hasText(value);

  const getMissingFields = (stageScope = 'all') => {
    const missing = [];

    const checkStage1 = stageScope === 'all' || stageScope === 0;
    const checkStage2 = stageScope === 'all' || stageScope === 1;
    const checkStage3 = stageScope === 'all' || stageScope === 2;
    const checkStage4 = stageScope === 'all' || stageScope === 3;

    if (checkStage1) {
      if (!hasSelection(goal)) missing.push(locale === 'lt' ? 'Tikslas' : 'Goal');
      if (!hasSelection(motivation)) missing.push(locale === 'lt' ? 'Motyvacija' : 'Motivation');
    }

    if (checkStage2) {
      if (!hasSelection(workday)) missing.push(locale === 'lt' ? 'Darbo pobūdis' : 'Workday');
      if (content.stages[1].trackerOptions && !hasSelection(tracker)) missing.push(locale === 'lt' ? 'Pulsometras' : 'Tracker');
      if (!hasSelection(trainingEnvironment)) missing.push(locale === 'lt' ? 'Treniruočių aplinka' : 'Training environment');
    }

    if (checkStage3) {
      if (!Array.isArray(discomforts) || discomforts.length === 0) missing.push(locale === 'lt' ? 'Diskomfortas' : 'Discomforts');
    }

    if (checkStage4) {
      if (!hasSelection(gender)) missing.push(locale === 'lt' ? 'Lytis' : 'Gender');
      if (!hasSelection(age)) missing.push(locale === 'lt' ? 'Amžius' : 'Age');
      if (!hasSelection(weight)) missing.push(locale === 'lt' ? 'Svoris' : 'Weight');
      if (!hasSelection(height)) missing.push(locale === 'lt' ? 'Ūgis' : 'Height');
      if (!hasSelection(family)) missing.push(locale === 'lt' ? 'Širdies ligos' : 'Family history');
      if (!hasSelection(budget)) missing.push(locale === 'lt' ? 'Biudžetas' : 'Budget');
    }

    return missing;
  };

  // Load progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem('questionnaire_progress');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.goal) setGoal(p.goal);
        if (p.motivation) setMotivation(p.motivation);
        if (p.budget) {
          setBudget(p.budget);
          const savedBudgetIndex = budgetOptions.indexOf(p.budget);
          if (savedBudgetIndex >= 0) setBudgetSliderValue(savedBudgetIndex);
        }
        if (p.workday) setWorkday(p.workday);
        if (p.sleep) setSleep(p.sleep);
        if (p.tracker) setTracker(p.tracker);
        if (p.trainingEnvironment) setTrainingEnvironment(p.trainingEnvironment);
        if (p.discomforts) setDiscomforts(p.discomforts);
        if (p.injury) setInjury(p.injury);
        if (p.age) setAge(p.age);
        if (p.weight) setWeight(p.weight);
        if (p.height) setHeight(p.height);
        if (p.family) setFamily(p.family);
        if (p.stress) setStress(p.stress);
        if (p.gender) setGender(p.gender);
        if (p.email) setEmail(p.email);
        if (p.phone) setPhone(p.phone);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsProgressHydrated(true);
    }
  }, []);

  // Save progress with debounce to prevent slider lag
  useEffect(() => {
    if (!isProgressHydrated) return;

    const timer = setTimeout(() => {
      const payload = { goal, motivation, budget, workday, sleep, tracker, trainingEnvironment, discomforts, injury, age, weight, height, family, stress, gender, email, phone };
      localStorage.setItem('questionnaire_progress', JSON.stringify(payload));
    }, 1000);

    return () => clearTimeout(timer);
  }, [goal, motivation, budget, workday, sleep, tracker, trainingEnvironment, discomforts, injury, age, weight, height, family, stress, gender, email, phone, isProgressHydrated]);

  useEffect(() => {
    if (!isProgressHydrated) return;
    if (!budgetOptions.length) return;
    if (!budget) {
      setBudget(budgetOptions[0]);
      setBudgetSliderValue(0);
      return;
    }
    if (!budgetOptions.includes(budget)) {
      const fallbackBudgetIndex = budgetOptions.length - 1;
      setBudget(budgetOptions[fallbackBudgetIndex]);
      setBudgetSliderValue(fallbackBudgetIndex);
    }
  }, [budget, budgetOptions, isProgressHydrated]);

  const handleSubmit = async () => {
    // Validate required fields
    const missing = getMissingFields('all');

    if (missing.length > 0) {
      setErrorPopup({
        title: locale === 'lt' ? 'Trūksta duomenų' : 'Missing Information',
        message: (locale === 'lt' ? 'Prašome užpildyti privalomus laukus:\n' : 'Please fill in required fields:\n') + missing.join(', ')
      });
      return;
    }

    if (!user && !email && !phone) {
      setErrorPopup({
        title: locale === 'lt' ? 'Trūksta kontaktų' : 'Missing Contacts',
        message: locale === 'lt' ? 'Prašome įvesti el. paštą arba telefono numerį.' : 'Please enter either email or phone number.',
        onClose: () => {
          const el = document.getElementById('q-email-input');
          if (el) el.focus();
        }
      });
      return;
    }

    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setErrorPopup({
        title: locale === 'lt' ? 'Klaida' : 'Error',
        message: locale === 'lt' ? 'Neteisingas el. pašto formatas.' : 'Invalid email format.',
        onClose: () => {
          const el = document.getElementById('q-email-input');
          if (el) el.focus();
        }
      });
      return;
    }

    // Validate Phone Format
    // Allow +370xxxxxxxx or 8xxxxxxxx. Also allow international +...
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^(\+370|8)\d{8}$|^\+\d{8,15}$/;
    if (phone && !phoneRegex.test(cleanPhone)) {
      setErrorPopup({
        title: locale === 'lt' ? 'Klaida' : 'Error',
        message: locale === 'lt' ? 'Neteisingas telefono numeris. (pvz: +37060000000)' : 'Invalid phone number format.',
        onClose: () => {
          const el = document.getElementById('q-phone-input');
          if (el) el.focus();
        }
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        goal,
        motivation,
        budget,
        workday,
        sleep,
        tracker,
        training_environment: trainingEnvironment,
        discomforts,
        injury,
        age,
        weight,
        height,
        family,
        stress,
        gender,
        recommended_program_id: recommendedProgram?.productId,
        recommended_program_title: recommendedProgram?.title,
        phone,
      };
      const { error } = await supabase.functions.invoke('submit-questionnaire', {
        body: {
          payload,
          email: user?.email || email,
          user_id: user?.id,
          locale
        }
      });
      if (error) throw error;
      
      localStorage.removeItem('questionnaire_progress');
      setShowSuccess(true);
    } catch (e) {
      setErrorPopup({
        title: locale === 'lt' ? 'Klaida' : 'Error',
        message: locale === 'lt' ? 'Nepavyko išsaugoti. Bandykite dar kartą.' : 'Failed to save. Please try again.'
      });
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageFromPath = Number(step);
  const activeStage = Number.isInteger(stageFromPath) && stageFromPath >= 1 && stageFromPath <= 5
    ? stageFromPath - 1
    : 0;

  const totalSignals = 16;
  const filledSignals = [
    goal,
    motivation,
    budget,
    workday,
    tracker,
    trainingEnvironment,
    discomforts.length ? '1' : '',
    injury,
    age,
    weight,
    height,
    family,
    gender,
    stress > 0 ? '1' : '',
    sleep >= 1 ? '1' : ''
  ].filter(Boolean).length;
  const completion = Math.min(100, Math.round((filledSignals / totalSignals) * 100));

  const recommendedProgram = useMemo(() => {
    const programs = recommendationProgramsByLocale[locale] || {};

    const scoreByProgram = {
      [RECOMMENDATION_PROGRAM_IDS.vip]: 0,
      [RECOMMENDATION_PROGRAM_IDS.weightLoss]: 0,
      [RECOMMENDATION_PROGRAM_IDS.muscleGain]: 0,
      [RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus]: 0,
      [RECOMMENDATION_PROGRAM_IDS.homeTraining]: 0,
      [RECOMMENDATION_PROGRAM_IDS.mobility]: 0,
    };

    const addScore = (programId, points) => {
      scoreByProgram[programId] = (scoreByProgram[programId] || 0) + points;
    };

    const goalIdx = content.stages[0].goals.indexOf(goal);
    const budgetIdx = budgetOptions.indexOf(budget);
    const environmentIdx = content.stages[1].environmentOptions.indexOf(trainingEnvironment);
    const noDiscomfortOption = content.stages[2].discomfortOptions[5];
    const hasMeaningfulDiscomfort = discomforts.some((item) => item !== noDiscomfortOption);
    const noInjuryOption = content.stages[2].injuryOptions[0];
    const hasInjury = hasText(injury) && injury !== noInjuryOption;
    const isSedentary = workday === content.stages[1].workdayOptions[0];
    const usesTrackerRegularly = tracker === content.stages[1].trackerOptions[0];

    switch (goalIdx) {
      case 0:
        addScore(RECOMMENDATION_PROGRAM_IDS.mobility, 8);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 4);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, 4);
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, 3);
        break;
      case 1:
        addScore(RECOMMENDATION_PROGRAM_IDS.weightLoss, 10);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, 4);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 3);
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, 3);
        break;
      case 2:
        addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, 10);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, 4);
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, 3);
        break;
      case 3:
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, 11);
        addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, 5);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, 4);
        break;
      default:
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 2);
        break;
    }

    switch (budgetIdx) {
      case 0:
        addScore(RECOMMENDATION_PROGRAM_IDS.mobility, 11);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 4);
        addScore(RECOMMENDATION_PROGRAM_IDS.weightLoss, -2);
        addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, -2);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, -4);
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, -8);
        break;
      case 1:
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 10);
        addScore(RECOMMENDATION_PROGRAM_IDS.mobility, 5);
        addScore(RECOMMENDATION_PROGRAM_IDS.weightLoss, 1);
        addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, 1);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, -2);
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, -6);
        break;
      case 2:
        addScore(RECOMMENDATION_PROGRAM_IDS.weightLoss, 8);
        addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, 8);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 3);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, 2);
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, -3);
        break;
      case 3:
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, 8);
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, 5);
        addScore(RECOMMENDATION_PROGRAM_IDS.weightLoss, 4);
        addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, 4);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 2);
        break;
      default:
        break;
    }

    switch (environmentIdx) {
      case 0:
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 8);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, 7);
        addScore(RECOMMENDATION_PROGRAM_IDS.mobility, 5);
        addScore(RECOMMENDATION_PROGRAM_IDS.weightLoss, -1);
        addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, -1);
        break;
      case 1:
        addScore(RECOMMENDATION_PROGRAM_IDS.weightLoss, 5);
        addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, 5);
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, 4);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, -2);
        break;
      case 2:
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, 6);
        addScore(RECOMMENDATION_PROGRAM_IDS.vip, 5);
        addScore(RECOMMENDATION_PROGRAM_IDS.weightLoss, 3);
        addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, 3);
        addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 2);
        break;
      default:
        break;
    }

    if (hasMeaningfulDiscomfort) {
      addScore(RECOMMENDATION_PROGRAM_IDS.mobility, 5);
      addScore(RECOMMENDATION_PROGRAM_IDS.vip, 2);
      addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 1);
    }

    if (hasInjury) {
      addScore(RECOMMENDATION_PROGRAM_IDS.mobility, 4);
      addScore(RECOMMENDATION_PROGRAM_IDS.vip, 3);
      addScore(RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus, 2);
    }

    if (sleep <= 4 || stress >= 8) {
      addScore(RECOMMENDATION_PROGRAM_IDS.mobility, 3);
      addScore(RECOMMENDATION_PROGRAM_IDS.homeTraining, 2);
    }

    if (usesTrackerRegularly && (goalIdx === 2 || goalIdx === 3)) {
      addScore(RECOMMENDATION_PROGRAM_IDS.muscleGain, 2);
      addScore(RECOMMENDATION_PROGRAM_IDS.vip, 2);
    }

    if (isSedentary && goalIdx === 1) {
      addScore(RECOMMENDATION_PROGRAM_IDS.weightLoss, 2);
      addScore(RECOMMENDATION_PROGRAM_IDS.mobility, 1);
    }

    const tieBreakByGoal = {
      0: [
        RECOMMENDATION_PROGRAM_IDS.mobility,
        RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus,
        RECOMMENDATION_PROGRAM_IDS.homeTraining,
        RECOMMENDATION_PROGRAM_IDS.vip,
        RECOMMENDATION_PROGRAM_IDS.weightLoss,
        RECOMMENDATION_PROGRAM_IDS.muscleGain,
      ],
      1: [
        RECOMMENDATION_PROGRAM_IDS.weightLoss,
        RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus,
        RECOMMENDATION_PROGRAM_IDS.homeTraining,
        RECOMMENDATION_PROGRAM_IDS.vip,
        RECOMMENDATION_PROGRAM_IDS.mobility,
        RECOMMENDATION_PROGRAM_IDS.muscleGain,
      ],
      2: [
        RECOMMENDATION_PROGRAM_IDS.muscleGain,
        RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus,
        RECOMMENDATION_PROGRAM_IDS.vip,
        RECOMMENDATION_PROGRAM_IDS.homeTraining,
        RECOMMENDATION_PROGRAM_IDS.weightLoss,
        RECOMMENDATION_PROGRAM_IDS.mobility,
      ],
      3: [
        RECOMMENDATION_PROGRAM_IDS.vip,
        RECOMMENDATION_PROGRAM_IDS.muscleGain,
        RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus,
        RECOMMENDATION_PROGRAM_IDS.weightLoss,
        RECOMMENDATION_PROGRAM_IDS.homeTraining,
        RECOMMENDATION_PROGRAM_IDS.mobility,
      ],
    };

    const tieBreakOrder = tieBreakByGoal[goalIdx] || [
      RECOMMENDATION_PROGRAM_IDS.weightLoss,
      RECOMMENDATION_PROGRAM_IDS.muscleGain,
      RECOMMENDATION_PROGRAM_IDS.homeTrainingPlus,
      RECOMMENDATION_PROGRAM_IDS.homeTraining,
      RECOMMENDATION_PROGRAM_IDS.mobility,
      RECOMMENDATION_PROGRAM_IDS.vip,
    ];

    let selectedProgramId = tieBreakOrder[0];
    let topScore = Number.NEGATIVE_INFINITY;

    tieBreakOrder.forEach((programId) => {
      const currentScore = scoreByProgram[programId] || 0;
      if (currentScore > topScore) {
        topScore = currentScore;
        selectedProgramId = programId;
      }
    });

    return programs[selectedProgramId] || null;
  }, [
    locale,
    content,
    goal,
    budget,
    workday,
    tracker,
    trainingEnvironment,
    discomforts,
    injury,
    sleep,
    stress,
    budgetOptions,
  ]);

  const handleBuyRecommendedProgram = () => {
    if (!recommendedProgram?.productId) return;

    const unitPriceCents = RECOMMENDATION_PRICE_CENTS_BY_ID[recommendedProgram.productId] || 0;
    const cart = loadCart();
    const next = addItem(cart, {
      kind: 'product',
      productId: recommendedProgram.productId,
      name: recommendedProgram.title,
      imageUrl: recommendedProgram.image,
      unitPriceCents,
      qty: 1,
    });
    saveCart(next);

    try {
      window.dispatchEvent(new Event('cart:open'));
    } catch {
      // ignore
    }
  };

  const toggleDiscomfort = (value) => {
    setDiscomforts((prev) => {
      const exists = prev.includes(value);
      if (exists) return prev.filter((item) => item !== value);
      
      const noDiscomfortOption = content.stages[2].discomfortOptions[5]; // Index 5 is "No discomfort / no complaints"
      
      if (value === noDiscomfortOption) return [value];
      const cleaned = prev.filter((item) => item !== noDiscomfortOption);
      return [...cleaned, value];
    });
  };

  const goToStep = (stepIndex) => {
    const target = Math.min(Math.max(stepIndex + 1, 1), 5);
    navigate(`/${locale}/${locale === 'lt' ? 'anketa' : 'questionnaire'}/${target}`);
  };

  const nextStep = () => {
    // Validate current stage before moving forward.
    if (activeStage >= 0 && activeStage <= 3) {
      const missing = getMissingFields(activeStage);
      if (missing.length > 0) {
        setErrorPopup({
          title: locale === 'lt' ? 'Klaida' : 'Error',
          message: (locale === 'lt' ? 'Prašome užpildyti privalomus laukus:\n' : 'Please fill in required fields:\n') + missing.join(', ')
        });
        return;
      }
    }

    goToStep(activeStage + 1);
  };

  const prevStep = () => {
    goToStep(activeStage - 1);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    const initAos = () => {
      AOS.init({
        once: true,
        duration: mobileQuery.matches ? 560 : 700,
        easing: 'ease-out-cubic',
        offset: mobileQuery.matches ? 60 : 100,
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

  // Re-trigger AOS on step change
  useEffect(() => {
    if (!Number.isInteger(stageFromPath) || stageFromPath < 1 || stageFromPath > 5) {
      navigate(`/${locale}/${locale === 'lt' ? 'anketa' : 'questionnaire'}/1`, { replace: true });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    AOS.refresh();
  }, [activeStage, locale, navigate, stageFromPath]);

  return (
    <main className="relative min-h-screen bg-[#F8F9FA]">
      <Seo locale={locale} />
      
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50vh] w-[50vh] rounded-full bg-gradient-to-br from-[#DCF41E]/20 to-transparent blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-gradient-to-bl from-blue-100/30 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 left-[20%] h-[40vh] w-[60vh] rounded-full bg-gradient-to-t from-gray-200/40 to-transparent blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12 max-w-3xl" data-aos="fade-up">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white px-4 py-1.5 shadow-sm ring-1 ring-black/5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DCF41E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#acc300]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-black/60">{content.hero.time}</span>
          </div>
          
          <h1 className="font-heading text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {content.hero.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:max-w-2xl sm:text-xl">
            {content.hero.subtitle}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:gap-12">
          
          {/* Sidebar */}
          <aside className="relative lg:order-1 order-1" data-aos="fade-right" data-aos-delay="100">
            <div className="sticky top-28 space-y-6">
              
              {/* Progress Card */}
              <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{content.labels.completed}</span>
                  <span className="font-heading text-2xl font-bold text-slate-900">{completion}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#DCF41E] transition-all duration-700 ease-out"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="hidden lg:block overflow-hidden rounded-3xl bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
                {content.stages.map((stage, index) => {
                  const isActive = activeStage === index;
                  const isCompleted = index < activeStage; 
                  
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => goToStep(index)}
                      className={`group flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-200 ${
                        isActive ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                        isActive 
                          ? 'border-transparent bg-[#DCF41E] text-black' 
                          : isCompleted 
                            ? 'border-transparent bg-[#DCF41E] text-black'
                            : 'border-slate-200 bg-white text-slate-400 group-hover:border-slate-300'
                      }`}>
                         {isCompleted ? (
                           <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                         ) : (
                           index + 1
                         )}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{stage.label}</div>
                        <div className={`truncate text-xs font-medium uppercase tracking-wider ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                          {stage.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </aside>

          {/* Form Content */}
          <div className="lg:order-2 order-2 min-h-[50vh]">
            
            {/* Stage 1 */}
            {activeStage === 0 && (
              <section data-aos="fade-up" className="space-y-8">
                
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_2px_40px_rgb(0,0,0,0.06)] ring-1 ring-black/5 sm:p-10">
                  <h2 className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl">{content.stages[0].title}</h2>
                  
                  <div className="mt-8 space-y-8">
                    <div>
                      <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[0].goalQuestion}</label>
                      <div className="grid gap-3 sm:grid-cols-1">
                        {content.stages[0].goals.map((item) => (
                          <ToggleButton
                            key={item}
                            label={item}
                            active={goal === item}
                            onClick={() => setGoal(item)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[0].motivationQuestion}</label>
                      <div className="grid gap-3 sm:grid-cols-1">
                        {content.stages[0].motivationOptions.slice(0, -1).map((item) => (
                          <ToggleButton
                            key={item}
                            label={item}
                            active={motivation === item}
                            onClick={() => setMotivation(item)}
                          />
                        ))}
                        
                        {/* Other Option Logic */}
                        <div className="space-y-3">
                          <ToggleButton
                            label={content.stages[0].motivationOptions[content.stages[0].motivationOptions.length - 1]}
                            active={motivation && !content.stages[0].motivationOptions.slice(0, -1).includes(motivation)}
                            onClick={() => setMotivation(content.stages[0].motivationOptions[content.stages[0].motivationOptions.length - 1])}
                          />
                          
                          {motivation && !content.stages[0].motivationOptions.slice(0, -1).includes(motivation) && (
                            <textarea
                              value={motivation === content.stages[0].motivationOptions[content.stages[0].motivationOptions.length - 1] ? '' : motivation}
                              onChange={(event) => setMotivation(event.target.value)}
                              rows={2}
                              className="w-full rounded-2xl border-0 bg-slate-50 px-6 py-4 text-base text-slate-900 shadow-inner ring-1 ring-black/5 transition focus:bg-white focus:ring-2 focus:ring-black placeholder:text-slate-400 animate-in fade-in zoom-in-95 duration-200"
                              placeholder={content.stages[0].motivationPlaceholder}
                              autoFocus
                            />
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            )}

            {/* Stage 2 */}
            {activeStage === 1 && (
            <section data-aos="fade-up" className="space-y-8">

              <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_2px_40px_rgb(0,0,0,0.06)] ring-1 ring-black/5 sm:p-10">
                <h2 className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl">{content.stages[1].title}</h2>
                
                <div className="mt-8 space-y-10">
                  <div>
                    <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[1].workdayQuestion}</label>
                    <div className="grid gap-3">
                      {content.stages[1].workdayOptions.map((item) => (
                        <ToggleButton
                          key={item}
                          label={item}
                          active={workday === item}
                          onClick={() => setWorkday(item)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[1].environmentQuestion}</label>
                    <div className="grid gap-3 md:grid-cols-3">
                      {content.stages[1].environmentOptions.map((item) => (
                        <ToggleButton
                          key={item}
                          label={item}
                          active={trainingEnvironment === item}
                          onClick={() => setTrainingEnvironment(item)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-10 md:grid-cols-2">
                    <div>
                      <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[1].sleepQuestion}</label>
                      <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-black/5">
                        <RangeSlider
                          min={1}
                          max={10}
                          step={0.1}
                          value={sleep}
                          onChange={(event) => setSleep(Number(event.target.value))}
                          background={`linear-gradient(to right, #DCF41E 0%, #DCF41E ${((sleep - 1) / 9) * 100}%, #e2e8f0 ${((sleep - 1) / 9) * 100}%, #e2e8f0 100%)`}
                        />
                        <div className="mt-2 flex justify-between text-sm font-bold text-slate-400">
                           <span>1 ({content.labels.sleepScale.low})</span>
                           <span>10 ({content.labels.sleepScale.high})</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[1].trackerQuestion}</label>
                      <div className="space-y-3">
                        {content.stages[1].trackerOptions.map((item) => (
                           <ToggleButton
                             key={item}
                             label={item}
                             active={tracker === item}
                             onClick={() => setTracker(item)}
                           />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* Stage 3 */}
            {activeStage === 2 && (
            <section data-aos="fade-up" className="space-y-8">

              <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_2px_40px_rgb(0,0,0,0.06)] ring-1 ring-black/5 sm:p-10">
                <h2 className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl">{content.stages[2].title}</h2>
                
                <div className="mt-8 space-y-8">
                  <div>
                     <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[2].discomfortQuestion}</label>
                     <div className="grid gap-3 sm:grid-cols-2">
                      {content.stages[2].discomfortOptions.map((item) => (
                        <ToggleButton
                          key={item}
                          label={item}
                          active={discomforts.includes(item)}
                          onClick={() => toggleDiscomfort(item)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                     <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[2].injuryQuestion}</label>
                     <div className="space-y-4">
                       <div className="flex gap-3">
                         {content.stages[2].injuryOptions.map((option, idx) => {
                           const isNo = idx === 0; // "Ne."
                           const isSelected = isNo 
                             ? injury === option
                             : injury !== content.stages[2].injuryOptions[0]; // Active if not "Ne." (so empty or text)
                           
                           return (
                             <ToggleButton
                               key={option}
                               label={option}
                               active={isSelected}
                               onClick={() => {
                                 if (isNo) {
                                   setInjury(option);
                                 } else {
                                   if (injury === content.stages[2].injuryOptions[0]) {
                                      setInjury(''); // Clear "Ne." to allow typing
                                   }
                                   // If already typing/empty, do nothing, just keep focus/state
                                 }
                               }}
                             />
                           );
                         })}
                       </div>
                       
                       {injury !== content.stages[2].injuryOptions[0] && (
                         <input
                            value={injury}
                            onChange={(event) => setInjury(event.target.value)}
                            className="w-full rounded-2xl border-0 bg-slate-50 px-6 py-4 text-base text-slate-900 shadow-inner ring-1 ring-black/5 transition focus:bg-white focus:ring-2 focus:ring-black placeholder:text-slate-400 animate-in fade-in zoom-in-95 duration-200"
                            placeholder={content.stages[2].injuryPlaceholder}
                            autoFocus={injury === ''}
                          />
                       )}
                     </div>
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* Stage 4 */}
            {activeStage === 3 && (
            <section data-aos="fade-up" className="space-y-8">
              

              <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_2px_40px_rgb(0,0,0,0.06)] ring-1 ring-black/5 sm:p-10">
                {/* Decorative blob in stage 4 */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-[#DCF41E]/30 to-transparent blur-3xl" />
                
                <h2 className="relative font-heading text-3xl font-bold text-slate-900 sm:text-4xl">{content.stages[3].title}</h2>

                <div className="relative mt-8 grid gap-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[3].genderQuestion}</label>
                      <div className="grid gap-3 max-w-xs">
                        {content.stages[3].genderOptions.map((item) => (
                           <ToggleButton
                              key={item}
                              label={item}
                              active={gender === item}
                              onClick={() => setGender(item)}
                            />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-slate-800">{content.stages[3].metricsTitle}</label>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {[{v: age, s: setAge, l: content.stages[3].ageLabel}, {v: weight, s: setWeight, l: content.stages[3].weightLabel}, {v: height, s: setHeight, l: content.stages[3].heightLabel}].map((f, i) => (
                           <div key={i} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-black">
                             <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{f.l}</span>
                             <input 
                               value={f.v} 
                               onChange={e => f.s(e.target.value)} 
                               inputMode="numeric" 
                               placeholder="-" 
                               className="mt-1 block w-full bg-transparent text-xl font-bold text-slate-900 outline-none placeholder:text-slate-300"
                             />
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[3].stressQuestion}</label>
                      <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-black/5 max-w-md">
                        <RangeSlider
                          min={1}
                          max={10}
                          step={0.1}
                          value={stress}
                          onChange={(e) => setStress(Number(e.target.value))}
                          background={`linear-gradient(to right, #DCF41E 0%, #DCF41E ${((stress - 1) / 9) * 100}%, #e2e8f0 ${((stress - 1) / 9) * 100}%, #e2e8f0 100%)`}
                        />
                        <div className="mt-2 flex justify-between text-sm font-bold text-slate-400">
                           <span>1 (Žemas)</span>
                           <span>10 (Aukštas)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[3].familyQuestion}</label>
                      <div className="grid gap-3">
                         {content.stages[3].familyOptions.map((item) => (
                            <ToggleButton
                              key={item}
                              label={item}
                              active={family === item}
                              onClick={() => setFamily(item)}
                            />
                         ))}
                      </div>
                    </div>

                  </div>

                  <div className="md:col-span-2">
                    <div>
                      <label className="mb-4 block text-lg font-bold text-slate-800">{content.stages[3].budgetQuestion}</label>
                      <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-black/5">
                        <div className="mb-4 flex justify-center">
                          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 ring-1 ring-black/10">
                            {budgetOptions[normalizedBudgetIndex] || budgetOptions[0]}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={maxBudgetIndex}
                          step={0.01}
                          value={clampedBudgetSliderValue}
                          onChange={handleBudgetChange}
                          className="questionnaire-range h-4 w-full cursor-pointer appearance-none rounded-full"
                          style={{
                            background: `linear-gradient(to right, #DCF41E 0%, #DCF41E ${budgetProgress}%, #e2e8f0 ${budgetProgress}%, #e2e8f0 100%)`
                          }}
                        />
                        <div className="mt-3 flex justify-between text-xs font-bold text-slate-400">
                          <span>{budgetOptions[0]}</span>
                          <span>{budgetOptions[budgetOptions.length - 1]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* Stage 5: Contact / Summary */}
            {activeStage === 4 && (
            <section data-aos="fade-up" className="space-y-8">
              {showSuccess && recommendedProgram && (
                <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5 sm:p-8">
                  <div className="mb-6 text-center">
                    <h3 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">{content.summary.recommendationTitle}</h3>
                    <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">{content.summary.recommendationBody}</p>
                  </div>

                  <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="grid gap-0 lg:grid-cols-[340px_1fr]">
                      <div className="relative h-64 overflow-hidden lg:h-full">
                        <img
                          src={recommendedProgram.image}
                          alt={recommendedProgram.title}
                          className="h-full w-full object-cover brightness-110 saturate-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <span className="inline-block rounded-full bg-[#DCF41E] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                            {recommendedProgram.duration}
                          </span>
                          <h4 className="mt-2 font-heading text-xl font-black leading-tight sm:text-2xl">{recommendedProgram.title}</h4>
                          {recommendedProgram.subtitle &&
                            recommendedProgram.subtitle !== recommendedProgram.duration &&
                            recommendedProgram.subtitle !== recommendedProgram.title && (
                              <p className="mt-1 text-sm text-white/85">{recommendedProgram.subtitle}</p>
                            )}
                        </div>
                      </div>

                      <div className="flex flex-col p-6 sm:p-8">
                        <p className="text-sm leading-relaxed text-slate-600">{recommendedProgram.description}</p>

                        <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-black/5">
                          <h5 className="text-xs font-bold uppercase tracking-widest text-black">
                            {locale === 'lt' ? 'Į programą įeina' : 'Included'}
                          </h5>
                          <ul className="mt-4 space-y-3">
                            {recommendedProgram.extras.map((extra) => (
                              <li key={extra} className="flex items-start gap-3 text-sm text-slate-700">
                                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DCF41E] text-black">
                                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                </span>
                                <span className="font-medium">{extra}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-6 flex flex-wrap items-end gap-4 border-t border-slate-100 pt-6">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{content.labels.result}</p>
                            <p className="mt-2 text-base font-semibold text-slate-900 sm:text-lg">{recommendedProgram.result}</p>
                          </div>
                          <div className="ml-auto w-full text-right sm:w-auto sm:shrink-0">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{locale === 'lt' ? 'Kaina' : 'Price'}</p>
                            <p className="font-heading text-3xl font-black text-slate-900">{recommendedProgram.price}</p>
                            <button
                              type="button"
                              onClick={handleBuyRecommendedProgram}
                              className="mt-3 inline-flex items-center justify-center rounded-full bg-[#DCF41E] px-6 py-3 text-sm font-bold text-black transition hover:brightness-95 hover:shadow-lg"
                            >
                              {locale === 'lt' ? 'Pirkti dabar' : 'Buy now'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              )}

              <div className="rounded-[2.5rem] bg-white px-8 py-14 text-center text-slate-900 shadow-2xl">
                <h3 className="font-heading text-3xl font-bold sm:text-4xl">{content.summary.title}</h3>
                <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 sm:text-xl">
                  {content.summary.body}
                </p>
                
                <div className="mx-auto mt-8 max-w-md space-y-4">
                  <div>
                    <label htmlFor="q-email-input" className="mb-2 block text-left text-sm font-bold text-slate-700">
                      {locale === 'lt' ? 'El. paštas' : 'Email'}
                    </label>
                    <input 
                      id="q-email-input"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border-2 border-slate-200 px-6 py-3 text-lg outline-none focus:border-[#DCF41E] focus:ring-1 focus:ring-[#DCF41E]" 
                    />
                  </div>

                  <div className="relative flex items-center justify-center">
                     <span className="bg-white px-3 text-sm text-slate-400 font-medium">
                       {locale === 'lt' ? 'arba / ir' : 'or / and'}
                     </span>
                     <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-slate-100"></div>
                  </div>

                  <div>
                    <label htmlFor="q-phone-input" className="mb-2 block text-left text-sm font-bold text-slate-700">
                      {locale === 'lt' ? 'Telefono numeris' : 'Phone Number'}
                    </label>
                    <input 
                      id="q-phone-input"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+370 600 00000"
                      className="w-full rounded-2xl border-2 border-slate-200 px-6 py-3 text-lg outline-none focus:border-[#DCF41E] focus:ring-1 focus:ring-[#DCF41E]" 
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || showSuccess}
                    className="inline-flex transform items-center justify-center rounded-full bg-[#DCF41E] px-10 py-4 text-lg font-bold text-black transition hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(220,244,30,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? (locale === 'lt' ? 'Saugoma...' : 'Saving...')
                      : showSuccess
                        ? (locale === 'lt' ? 'Išsaugota' : 'Saved')
                        : content.summary.button}
                  </button>
                  {showSuccess && (
                    <p className="mt-3 text-sm font-medium text-slate-600">
                      {locale === 'lt'
                        ? 'Anketa išsaugota. Žemiau pateikiama labiausiai jums tinkanti programa.'
                        : 'Questionnaire saved. The program best matching your answers is shown below.'}
                    </p>
                  )}
                </div>
              </div>
            </section>
            )}

          </div>

          {/* Navigation Buttons for Wizard */}
          <div className="col-span-full mt-8 flex items-center justify-between lg:order-3 order-3">
            {activeStage > 0 ? (
              <button onClick={prevStep} className="font-bold text-slate-500 hover:text-black px-0 py-3 transition-colors">
                {content.navigation.back}
              </button>
            ) : <div />}
            {activeStage < 4 && (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 rounded-full bg-[#DCF41E] px-8 py-4 font-bold text-black shadow-lg transition hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(220,244,30,0.6)]"
              >
                <span>{activeStage === 3 ? (locale === 'lt' ? 'Gauti rezultatus' : 'Get results') : content.navigation.next}</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Error / Validation Popup */}
      {errorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 relative scale-100 animate-in zoom-in-95 duration-200 border-l-4 border-red-500">
            <button 
              onClick={() => {
                const callback = errorPopup.onClose;
                setErrorPopup(null);
                if (callback) callback();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900">
                {errorPopup.title}
              </h3>
              
              <p className="text-gray-600 whitespace-pre-line">
                {errorPopup.message}
              </p>
              
              <button
                onClick={() => {
                  const callback = errorPopup.onClose;
                  setErrorPopup(null);
                  if (callback) callback();
                }}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all transform active:scale-95"
              >
                {locale === 'lt' ? 'Supratau' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
