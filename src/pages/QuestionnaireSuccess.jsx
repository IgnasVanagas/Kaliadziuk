import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { addItem, loadCart, saveCart } from '../state/cart';

const QUESTIONNAIRE_RESULT_KEY = 'questionnaire_recommended_program';

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

export default function QuestionnaireSuccess() {
  const location = useLocation();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);
  const [recommendedProgram, setRecommendedProgram] = useState(() => location.state?.recommendedProgram || null);

  useEffect(() => {
    const fromState = location.state?.recommendedProgram;
    if (fromState) {
      setRecommendedProgram(fromState);
      try {
        sessionStorage.setItem(QUESTIONNAIRE_RESULT_KEY, JSON.stringify(fromState));
      } catch {
        // ignore
      }
      return;
    }

    try {
      const saved = sessionStorage.getItem(QUESTIONNAIRE_RESULT_KEY);
      if (saved) {
        setRecommendedProgram(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [location.state]);

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

  const questionnaireHref = locale === 'en' ? '/en/questionnaire/5' : '/lt/anketa/5';

  if (!recommendedProgram) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5">
          <h1 className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl">
            {locale === 'lt' ? 'Rekomendacijos nerasta' : 'Recommendation not found'}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            {locale === 'lt'
              ? 'Pabandykite dar kartą užpildyti kontaktus anketoje.'
              : 'Please return to the questionnaire and submit your contact details again.'}
          </p>
          <a
            href={questionnaireHref}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#DCF41E] px-8 py-3 text-sm font-bold text-black transition hover:brightness-95"
          >
            {locale === 'lt' ? 'Grįžti į anketą' : 'Back to questionnaire'}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <section className="space-y-8">
        <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl">
              {locale === 'lt' ? 'Pagal jūsų atsakymus labiausiai tinka:' : 'Based on your answers, the best fit is:'}
            </h1>
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
                  <h2 className="mt-2 font-heading text-xl font-black leading-tight sm:text-2xl">{recommendedProgram.title}</h2>
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
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black">
                    {locale === 'lt' ? 'Į programą įeina' : 'Included'}
                  </h3>
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
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {locale === 'lt' ? 'Rezultatas' : 'Result'}
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-900 sm:text-lg">{recommendedProgram.result}</p>
                  </div>
                  <div className="ml-auto w-full text-right sm:w-auto sm:shrink-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {locale === 'lt' ? 'Kaina' : 'Price'}
                    </p>
                    <p className="font-heading text-3xl font-black text-slate-900">{recommendedProgram.price}</p>
                    <button
                      type="button"
                      onClick={handleBuyRecommendedProgram}
                      className="mt-3 inline-flex items-center justify-center rounded-full bg-[#DCF41E] px-6 py-3 text-sm font-bold text-black transition hover:brightness-95 hover:shadow-lg"
                    >
                      {locale === 'lt' ? 'Pradėti dabar' : 'Buy now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
