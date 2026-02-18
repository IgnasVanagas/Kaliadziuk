import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { addItem, loadCart, saveCart } from '../state/cart';
import { formatEurFromCents } from '../lib/money';
import CartToast from '../components/CartToast';
import { getProductImageUrl } from '../lib/productImages';

function asMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
}

function asString(value) {
  return typeof value === 'string' ? value : '';
}

function asFeatures(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
}

function asSortOrder(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

export default function Plans() {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const [toastOpen, setToastOpen] = useState(false);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from('products_active_localized')
        .select('*')
        .eq('locale', locale)
        .order('created_at', { ascending: true });
      if (!alive) return;
      if (error) setErr(error.message);
      const sorted = (data || []).slice().sort((a, b) => {
        const aMeta = asMetadata(a?.metadata);
        const bMeta = asMetadata(b?.metadata);
        const byOrder = asSortOrder(aMeta.sort_order) - asSortOrder(bMeta.sort_order);
        if (byOrder !== 0) return byOrder;
        return String(a?.created_at || '').localeCompare(String(b?.created_at || ''));
      });
      setRows(sorted);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [locale]);

  const cartPath = locale === 'lt' ? '/lt/krepselis' : '/en/cart';

  if (loading) {
    return <main className="mx-auto max-w-5xl px-6 py-16">{t('common.loading')}</main>;
  }

  if (err) {
    return <main className="mx-auto max-w-5xl px-6 py-16">{t('common.error')}: {err}</main>;
  }

  const onAdd = (p) => {
    const cart = loadCart();
    const next = addItem(cart, {
      kind: 'product',
      productId: p.product_id,
      name: p.name,
      imageUrl: getProductImageUrl(p.product_id),
      unitPriceCents: p.price_cents,
      qty: 1,
    });
    saveCart(next);
    setToastOpen(true);
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl font-extrabold">{t('plans.title')}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(p => (
          <div key={p.product_id} className="rounded-2xl border border-black/10 p-5 space-y-3">
            {(() => {
              const meta = asMetadata(p.metadata);
              const subtitle = asString(meta.subtitle);
              const tag = asString(meta.tag);
              const duration = asString(meta.duration);
              const result = asString(meta.result);
              const features = asFeatures(meta.features);

              return (
                <>
                  {tag ? (
                    <div className="inline-flex rounded-full border border-black/20 px-3 py-1 text-xs font-semibold tracking-wide">
                      {tag}
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-heading text-xl font-extrabold">{p.name}</h2>
                      {subtitle ? <p className="text-black/70 text-sm mt-1">{subtitle}</p> : null}
                      {duration ? <p className="text-black/70 text-sm mt-1">{duration}</p> : null}
                      {p.description ? <p className="text-black/70 text-sm mt-2">{p.description}</p> : null}
                    </div>
                    <div className="font-heading text-lg font-extrabold">{formatEurFromCents(p.price_cents)}</div>
                  </div>

                  {features.length ? (
                    <ul className="space-y-1 text-sm text-black/80 list-disc pl-5">
                      {features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  ) : null}

                  {result ? <p className="text-sm font-medium text-black/90">{result}</p> : null}
                </>
              );
            })()}
            <button
              type="button"
              onClick={() => onAdd(p)}
              className="inline-flex items-center justify-center rounded-full glass-green-surface px-5 py-2 text-base font-extrabold text-black"
            >
              {t('plans.addToCart')}
            </button>
          </div>
        ))}
      </div>

      <CartToast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        title={locale === 'lt' ? 'Pridėta į krepšelį' : 'Added to cart'}
        actionLabel={locale === 'lt' ? 'Atidaryti krepšelį' : 'Open cart'}
        actionTo={cartPath}
      />
    </main>
  );
}
