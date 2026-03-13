const fs = require('fs');

const code = fs.readFileSync('src/pages/WeightLossLanding.jsx', 'utf8');


const s_main = code.indexOf('<main className="bg-white text-black">');
// Since node failed to find it, it means there are newlines or spaces. I'll just use a small substring.
const s_hero = s_main + '<main className="bg-white text-black">'.length; 
const s_apiemane = code.indexOf('<section id="apie-mane"');
const s_trust = code.indexOf('IMG_0481-scaled.jpg') - 300; // rough start
// find exact <section before it
const s_trust_sec = code.lastIndexOf('<section className=', s_trust + 300);

const s_transformations = code.indexOf('<section className="mx-auto py-16 md:py-24 bg-slate-50/50">');
const s_faq = code.lastIndexOf('<section className=', code.indexOf('IMG_0488-scaled.jpg'));
const s_testimonials = code.lastIndexOf('<section className=', code.indexOf('testimonialsRef'));
const s_cta = code.lastIndexOf('<section className=', code.indexOf('content.finalCtaTitle'));
const s_footer = code.indexOf('<div className="fixed inset-x-0 bottom-0');

const sections = [
  {name: 'hero', start: s_hero, end: s_transformations},
  {name: 'transformations', start: s_transformations, end: s_trust_sec},
  {name: 'trust', start: s_trust_sec, end: s_apiemane},
  {name: 'apiemane', start: s_apiemane, end: s_faq},
  {name: 'faq', start: s_faq, end: s_testimonials},
  {name: 'testimonials', start: s_testimonials, end: s_cta},
  {name: 'cta', start: s_cta, end: s_footer}
];

// Check for -1
for (let sec of sections) {
  if (sec.start === -1 || sec.start === undefined) {
     console.log('FAILED TO FIND SECTION: ' + sec.name);
     process.exit(1);
  }
}

// Ensure correct boundaries (they must be in order!)
// Current file order: hero, transformations, trust, apiemane, faq, testimonials, cta
for (let i = 0; i < sections.length; i++) {
  let end = (i === sections.length - 1) ? s_footer : sections[i+1].start;
  sections[i].text = code.substring(sections[i].start, end);
}

// User requested order:
// 1. Hero
// 2. Apie mane
// 3. Testimonials (swap with Trust)
// 4. Transformations
// 5. Trust (swap with Testimonials)
// 6. FAQ
// 7. CTA
const getSec = (name) => sections.find(s => s.name === name).text;

let newCode = code.substring(0, sections[0].start) + 
  getSec('hero') +
  getSec('apiemane') +
  getSec('testimonials') +
  getSec('transformations') +
  getSec('trust') +
  getSec('faq') +
  getSec('cta') +
  code.substring(s_footer);


// NOW APPLY REPLACEMENTS:

// 1. the subtitle in contentByLocale
newCode = newCode.replace(
  "subtitle: 'Pamirškite alinančias dietas, kurios nepritaikytos jūsų kasdienybei. Šis planas yra tvarus, nes jis adaptuojamas jūsų realiam gyvenimui, darbo ritmui ir kasdieniams įpročiams.',",
  "subtitle: 'Transformuok savo kūną be kraštutinumų. Asmeninis planas tavo rezultatui.',"
);

// 2. Adjust pills overlay
// Find aboutStatsByLocale if missing, add it.
if (!newCode.includes("aboutStatsByLocale")) {
  newCode = newCode.replace(
    "export default function WeightLossLanding() {",
    `const aboutStatsByLocale = {
  lt: [
    { label: 'Pasikeitę klientai', value: '1000', suffix: '+' },
    { label: 'Metų patirtis', value: '8', suffix: '' },
    { label: 'Klientų pasitenkinimas', value: '98', suffix: '%' },
  ],
  en: [
    { label: 'Changed clients', value: '1000', suffix: '+' },
    { label: 'Years of experience', value: '8', suffix: '' },
    { label: 'Client satisfaction', value: '98', suffix: '%' },
  ]
};

export default function WeightLossLanding() {`
  );
}

newCode = newCode.replace(
  '<div className="pointer-events-none absolute inset-x-0 bottom-4 px-4 sm:bottom-6 sm:px-6">',
  '<div className="pointer-events-none absolute top-4 left-4 sm:top-8 sm:left-8 z-10">'
);
newCode = newCode.replace(
  '<div className="mx-auto w-fit origin-bottom transform-gpu lg:scale-[0.88] xl:scale-[0.94] 2xl:scale-100">\n                      <div className="flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-4">',
  '<div className="flex flex-col gap-3">'
);
newCode = newCode.replace(
  'glass-card inline-flex h-[120px] w-[180px] flex-col items-center justify-center space-y-2 rounded-full px-4 py-4 text-center',
  'bg-white/95 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-2xl p-4 w-40 border border-white transform transition-transform hover:scale-105'
);

newCode = newCode.replace(
  'text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85 sm:text-xs',
  'text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1'
);

newCode = newCode.replace(
  'font-heading text-3xl font-extrabold text-white sm:text-4xl',
  'font-heading text-3xl font-black text-slate-900 leading-none'
);


fs.writeFileSync('src/pages/WeightLossLanding.jsx', newCode);
console.log('Done replacement!');