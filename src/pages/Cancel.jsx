import { useTranslation } from 'react-i18next';

export default function Cancel() {
  const { t } = useTranslation();
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-4">
      <h1 className="font-heading text-4xl font-extrabold">{t('cancel.title')}</h1>
      <p className="text-black/70">{t('cancel.body')}</p>
    </main>
  );
}
