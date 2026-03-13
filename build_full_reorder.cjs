const fs = require('fs');

const code = fs.readFileSync('src/pages/WeightLossLanding.jsx', 'utf8');

// I will just use string indexOf with simpler keywords.
const s_main = code.indexOf('<main className="bg-white text-black">');
const s_hero = code.indexOf('<section className="relative overflow-hidden bg-white text-slate-900">');
const s_apiemane = code.indexOf('<section id="apie-mane"');
const s_trust = code.indexOf('<section className="relative overflow-hidden py-16 md:py-24">\n          <div className="absolute inset-0">\n            <picture>\n              <source type="image/avif" srcSet={[320, 480, 640');
const s_transformations = code.indexOf('<section className="mx-auto py-16 md:py-24 bg-slate-50/50">');
const s_faq = code.indexOf('<section className="relative overflow-hidden py-16 md:py-24">\n          <div className="absolute inset-0">\n             <img src={fromUploads(\'IMG_0488');
const s_testimonials = code.indexOf('<section className="mx-auto py-16 md:py-20">\n          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">\n            <div className="flex flex-col gap-3 text-center mb-12"');
const s_cta = code.indexOf('<section className="px-6 py-16 md:py-24">\n          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem]');
const s_footer = code.indexOf('<div className="fixed inset-x-0 bottom-0');

const sections = [
  {name: 'hero', start: s_hero, end: s_transformations},
  {name: 'transformations', start: s_transformations, end: s_trust},
  {name: 'trust', start: s_trust, end: s_apiemane},
  {name: 'apiemane', start: s_apiemane, end: s_faq},
  {name: 'faq', start: s_faq, end: s_testimonials},
  {name: 'testimonials', start: s_testimonials, end: s_cta},
  {name: 'cta', start: s_cta, end: s_footer}
];

// Check for -1
for (let sec of sections) {
  if (sec.start === -1) {
     console.log('FAILED TO FIND SECTION: ' + sec.name);
     process.exit(1);
  }
  sec.text = code.substring(sec.start, sec.end);
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

let newCode = code.substring(0, s_hero) + 
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

// 2. Add aboutStatsByLocale before export
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

// 3. Re-inject pills into Apie mane figure
newCode = newCode.replace(
  '<figure className="relative overflow-hidden rounded-2xl">',
  '<figure className="relative overflow-hidden rounded-2xl">'
);
// It already has stats inside from the git tree! Wait! Let me check this!
// If it ALREADY has stats, I just need to move them to top left!
newCode = newCode.replace(
  '<div className="pointer-events-none absolute inset-x-0 bottom-4 px-4 sm:bottom-6 sm:px-6">',
  '<div className="pointer-events-none absolute top-4 left-4 sm:top-8 sm:left-8 z-10 flex flex-col gap-3">'
);
newCode = newCode.replace(
  '<div className="mx-auto w-fit origin-bottom transform-gpu lg:scale-[0.88] xl:scale-[0.94] 2xl:scale-100">\n                      <div className="flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-4">',
  '<div className="flex flex-col gap-3">'
);

// 4. Make hero image wider, text larger, CTA updated and white bg
const oldHero = `<section className="relative overflow-hidden bg-white text-slate-900">

          <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
            <div className="flex flex-col md:flex-row md:items-center md:gap-12">
              <div className="max-w-xl space-y-8 md:flex-1">
                <div className="space-y-4">
                  <h1 className="font-heading text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">{content.title}</h1>
                  <p className="max-w-2xl text-base text-black/80 sm:text-lg font-medium">{content.subtitle}</p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center mt-8">
                  <button
                    type="button"
                    onClick={onStartNow}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#DCF41E] px-8 py-4 text-xl font-extrabold text-black shadow-[0_0_25px_rgba(220,244,30,0.4)] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] sm:px-10 sm:py-5 sm:text-2xl"
                  >
                    {content.primaryCta}
                  </button>
                </div>
              </div>

              {/* Before / After transformation */}
              <div className="mt-10 md:mt-0 md:flex-[1.2] flex items-center justify-center">`;

const newHero = `<section className="relative overflow-hidden bg-white text-slate-900">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-28">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="lg:flex-[1] max-w-xl mx-auto lg:mx-0 text-center lg:text-left space-y-8">
                <div className="space-y-4">
                  <h1 className="font-heading text-4xl font-black uppercase leading-tight sm:text-5xl md:text-6xl">{content.title}</h1>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">{content.subtitle}</p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row items-center lg:justify-start justify-center mt-8">
                  <button
                    type="button"
                    onClick={onStartNow}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#DCF41E] shadow-[0_0_20px_rgba(220,244,30,0.3)] px-10 py-5 text-xl font-black uppercase tracking-wide text-black transition-all hover:-translate-y-1 hover:scale-105"
                  >
                    {content.primaryCta}
                  </button>
                </div>
              </div>

              {/* Before / After transformation */}
              <div className="mt-10 md:mt-0 lg:flex-[1.4] w-full flex items-center justify-center">`;

newCode = newCode.replace(oldHero, newHero);


fs.writeFileSync('src/pages/WeightLossLanding.jsx', newCode);
console.log('Done replacement!');
