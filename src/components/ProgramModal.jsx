import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fromUploads } from '../lib/productImages';

export function ProgramModal({ program, onClose, onBuy }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!program) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header / Image Area */}
        <div className="relative h-64 sm:h-80 shrink-0">
          <img 
            src={program.image} 
            alt={program.title} 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition hover:bg-black/40"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
            <span className="mb-2 inline-block rounded-full bg-[#DCF41E] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
              {program.subtitle}
            </span>
            <h2 className="font-heading text-2xl font-black uppercase leading-none sm:text-3xl">
              {program.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <div className="space-y-8">
            
            {/* Description */}
            <p className="text-base font-medium leading-relaxed text-slate-600">
              {program.description}
            </p>

            {/* Highlights (Detailed) */}
            {program.highlights && program.highlights.length > 0 && (
              <div className="space-y-6">
                {program.highlights.map((highlight, idx) => (
                  <div key={idx}>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                      {highlight.title}
                    </h4>
                    <p className="text-sm font-semibold text-slate-900">
                      {highlight.detail}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Included Items (Checkmarks) */}
            <div className="space-y-4 rounded-2xl bg-slate-50 p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-4">
                {locale === 'lt' ? 'Į paketą įeina' : 'Included in package'}
              </h4>
              <ul className="space-y-3">
                {program.extras.map((extra, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                     <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DCF41E] text-[#2D4A22]">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="font-medium">{extra}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Result */}
             {program.result && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  {locale === 'lt' ? 'Rezultatas' : 'Result'}
                </h4>
                <p className="text-lg font-bold text-slate-900 leading-tight">
                  {program.result}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer / Action */}
        <div className="border-t border-slate-100 p-6 bg-white shrink-0">
          <div className="flex items-center justify-between gap-4">
             <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-slate-400">{locale === 'lt' ? 'Kaina' : 'Price'}</span>
                <span className="font-heading text-3xl font-black text-slate-900">{program.price}</span>
             </div>
             <button
                type="button"
                onClick={() => onBuy(program)}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#DCF41E] px-6 py-4 text-base font-bold text-black transition hover:brightness-95 hover:shadow-lg active:scale-[0.98]"
              >
                {locale === 'lt' ? 'Pirkti dabar' : 'Buy now'}
              </button>
          </div>
          {program.hasDietician && (
              <div className="mt-3 text-center">
                 <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 border border-slate-200 rounded-full px-2 py-1">
                   {locale === 'lt' ? 'Parengta su dietologu' : 'Approved by dietician'}
                 </span>
              </div>
          )}
        </div>

      </div>
    </div>
  );
}
