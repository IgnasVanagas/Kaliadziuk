import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export default function Legal({ kind }) {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const titleKey = kind === 'privacy' ? 'legal.privacy' : kind === 'terms' ? 'legal.terms' : 'legal.refunds';

  const content = useMemo(() => {
    const company = locale === 'lt'
      ? {
        name: '[Jūsų vardas/įmonė]'
        , email: '[support@jusu-domenas.lt]'
        , address: '[Adresas, miestas, šalis]'
        , website: '[https://jusu-domenas.lt]'
      }
      : {
        name: '[Your name/company]'
        , email: '[support@your-domain.lt]'
        , address: '[Address, city, country]'
        , website: '[https://your-domain.lt]'
      };

    const sectionsLt = {
      privacy: [
        {
          h: '1. Kas mes',
          p: [
            `Duomenų valdytojas: ${company.name}.`,
            `Kontaktai: ${company.email}.`,
            `Svetainė: ${company.website}.`,
            `Adresas: ${company.address}.`,
          ],
        },
        {
          h: '2. Kokius duomenis renkame',
          p: [
            'Pirkimo metu galime rinkti šiuos duomenis: el. paštą, telefono numerį (jei pateikiate), vardą/pavardę (jei pateikiate), pasirinktą kalbą (lt/en), sutikimus (taisyklių ir privatumo politikos priėmimą), rinkodaros sutikimą (jei pažymite).',
            'Mokėjimų kortelės duomenų mes nerenkame ir nesaugome – juos apdoroja Stripe.',
          ],
        },
        {
          h: '3. Kam naudojame duomenis',
          p: [
            'Užsakymams priimti, apdoroti ir vykdyti (pvz., susisiekti dėl paslaugos / plano pristatymo).',
            'Mokėjimų patvirtinimui ir apskaitos tikslams (užsakymo sumos, statusai, laikas).',
            'Dovanų kuponų išdavimui ir panaudojimui (balansas, galiojimas, rezervacijos).',
            'Klientų aptarnavimui ir ginčų / grąžinimų administravimui.',
          ],
        },
        {
          h: '4. Teisinis pagrindas',
          p: [
            'Sutarties vykdymas (užsakymo įvykdymas).',
            'Teisinė prievolė (apskaitos reikalavimai).',
            'Sutikimas (rinkodaros pranešimai, jei pasirenkate).',
            'Teisėtas interesas (sistemos sauga, sukčiavimo prevencija, auditavimas).',
          ],
        },
        {
          h: '5. Kam perduodame duomenis',
          p: [
            'Mokėjimų paslaugų teikėjui Stripe (užsakymo apmokėjimui).',
            'El. pašto siuntimo paslaugų teikėjui (pvz., Resend) – tik laiškų išsiuntimui.',
            'Talpinimo / infrastruktūros teikėjams (Hostinger, Supabase) – sistemos veikimui.',
          ],
        },
        {
          h: '6. Saugojimo laikotarpiai',
          p: [
            'Užsakymo finansiniai duomenys (sumos, statusai, laikas) gali būti saugomi tiek, kiek būtina apskaitai ir teisinių prievolių vykdymui.',
            'Kliento kontaktiniai duomenys saugomi tiek, kiek būtina užsakymui įvykdyti ir klientų aptarnavimui. Gavus prašymą, galime anonimizuoti PII, išlaikant finansinius užsakymo įrašus.',
            'Dovanų kuponų duomenys saugomi iki kupono galiojimo pabaigos ir papildomai tiek, kiek reikia apskaitai / ginčams.',
          ],
        },
        {
          h: '7. Jūsų teisės',
          p: [
            'Turite teisę gauti informaciją apie tvarkomus duomenis, prašyti juos ištaisyti, apriboti tvarkymą ar ištrinti (kai taikytina).',
            'Jei tvarkymas grindžiamas sutikimu (rinkodara), galite bet kada jį atšaukti.',
            `Dėl teisių įgyvendinimo kreipkitės: ${company.email}.`,
          ],
        },
        {
          h: '8. Slapukai',
          p: [
            'Svetainė naudoja techninius slapukus ir lokalų naršyklės saugojimą (pvz., kalbos pasirinkimui ir krepšeliui).',
          ],
        },
      ],
      terms: [
        {
          h: '1. Bendros nuostatos',
          p: [
            `Šios taisyklės reglamentuoja pirkimus per svetainę ${company.website}.`,
            'Pirkėjas, pateikdamas užsakymą, patvirtina, kad susipažino su taisyklėmis ir privatumo politika.',
          ],
        },
        {
          h: '2. Produktai / paslaugos',
          p: [
            'Parduodami treniruočių ir mitybos planai bei (ar) susijusios paslaugos, taip pat dovanų kuponai.',
            'Konkreti apimtis ir sąlygos aprašomos produkto puslapyje arba susitarime su klientu.',
          ],
        },
        {
          h: '3. Kainos ir apmokėjimas',
          p: [
            'Kainos nurodomos EUR. Apmokėjimas vykdomas per Stripe Checkout.',
            'Užsakymas laikomas apmokėtu tik gavus patvirtinimą per Stripe webhook (techninį mokėjimo patvirtinimą).',
          ],
        },
        {
          h: '4. Užsakymo vykdymas',
          p: [
            'Po apmokėjimo susisieksime el. paštu ar telefonu dėl plano/paslaugos pateikimo ar tolimesnių veiksmų.',
          ],
        },
        {
          h: '5. Dovanų kuponai',
          p: [
            'Dovanų kuponas turi balansą ir galioja 12 mėnesių nuo įsigijimo (jei nenurodyta kitaip).',
            'Kuponą galima panaudoti apmokėjimo metu įvedant kodą krepšelyje.',
            'Kuponų kodai saugomi saugiai (hash), todėl pametus kodą gali būti sudėtinga jį atkurti – susisiekite su mumis pateikdami pirkimo duomenis.',
          ],
        },
        {
          h: '6. Atsakomybė',
          p: [
            'Rekomendacijos pateikiamos bendrais tikslais; prieš pradėdami intensyvią sportinę veiklą pasitarkite su sveikatos specialistu, jei turite sveikatos sutrikimų.',
          ],
        },
        {
          h: '7. Kontaktai',
          p: [
            `Klausimams: ${company.email}.`,
          ],
        },
      ],
      refunds: [
        {
          h: '1. Grąžinimo politika',
          p: [
            'Jei įsigijote skaitmeninį planą ar paslaugą, grąžinimo galimybės priklauso nuo to, ar paslauga jau pradėta teikti / planas pateiktas.',
            'Dėl grąžinimų visais atvejais susisiekite el. paštu ir nurodykite užsakymo informaciją.',
          ],
        },
        {
          h: '2. Dovanų kuponai',
          p: [
            'Dovanų kuponų grąžinimas galimas tik jei kuponas nebuvo panaudotas (nei dalinai, nei pilnai), ir jei tai neprieštarauja taikomiems teisės aktams.',
          ],
        },
        {
          h: '3. Kaip pateikti prašymą',
          p: [
            `Parašykite el. paštu: ${company.email}.`,
            'Įtraukite: užsakymo datą, el. paštą, sumą ir priežastį.',
          ],
        },
      ],
    };

    const sectionsEn = {
      privacy: [
        {
          h: '1. Who we are',
          p: [
            `Data controller: ${company.name}.`,
            `Contact: ${company.email}.`,
            `Website: ${company.website}.`,
            `Address: ${company.address}.`,
          ],
        },
        {
          h: '2. What data we collect',
          p: [
            'During checkout we may collect: email, phone (if provided), full name (if provided), locale (lt/en), required consents (terms/privacy acceptance), marketing opt-in (if selected).',
            'We do not collect or store card details – they are processed by Stripe.',
          ],
        },
        {
          h: '3. How we use data',
          p: [
            'To accept, process, and fulfill orders (including contacting you about delivery/fulfillment).',
            'For payment confirmation and accounting (totals, statuses, timestamps).',
            'To issue and redeem gift cards (balance, expiry, reservations).',
            'For customer support and dispute/refund handling.',
          ],
        },
        {
          h: '4. Legal bases',
          p: [
            'Contract performance (fulfilling your order).',
            'Legal obligation (accounting requirements).',
            'Consent (marketing emails, if you opt in).',
            'Legitimate interests (security, fraud prevention, audit logs).',
          ],
        },
        {
          h: '5. Data sharing',
          p: [
            'Stripe (payment processing).',
            'Transactional email provider (e.g., Resend) for sending emails.',
            'Hosting/infrastructure providers (Hostinger, Supabase) to operate the service.',
          ],
        },
        {
          h: '6. Retention',
          p: [
            'Financial order records (totals, status, timestamps) may be retained as required for accounting and legal obligations.',
            'Contact data is retained as needed to fulfill and support orders. On request, we can anonymize personal identifiers while keeping financial records intact.',
            'Gift card data is retained through validity and additionally as needed for accounting/disputes.',
          ],
        },
        {
          h: '7. Your rights',
          p: [
            'You may request access, rectification, restriction, or erasure where applicable.',
            'If processing is based on consent (marketing), you can withdraw it anytime.',
            `To exercise rights, contact: ${company.email}.`,
          ],
        },
        {
          h: '8. Cookies',
          p: [
            'We use technical storage (cookies/localStorage) for essential features such as language selection and cart persistence.',
          ],
        },
      ],
      terms: [
        {
          h: '1. General',
          p: [
            `These terms govern purchases via ${company.website}.`,
            'By placing an order you confirm you have read and accepted the terms and the privacy policy.',
          ],
        },
        {
          h: '2. Products/services',
          p: [
            'We sell training and nutrition plans and related services, and gift cards.',
            'Exact scope is described on the product page or agreed with you directly.',
          ],
        },
        {
          h: '3. Pricing and payment',
          p: [
            'Prices are in EUR. Payments are processed via Stripe Checkout.',
            'An order is treated as paid only after Stripe webhook confirmation (technical payment confirmation).',
          ],
        },
        {
          h: '4. Fulfillment',
          p: [
            'After payment, we will contact you by email/phone regarding delivery and next steps.',
          ],
        },
        {
          h: '5. Gift cards',
          p: [
            'Gift cards have a balance and expire 12 months after purchase (unless stated otherwise).',
            'To redeem, enter the code in the cart during checkout.',
          ],
        },
        {
          h: '6. Liability',
          p: [
            'Content is provided for general informational purposes. If you have medical conditions, consult a professional before starting an intense training program.',
          ],
        },
        {
          h: '7. Contact',
          p: [
            `For questions: ${company.email}.`,
          ],
        },
      ],
      refunds: [
        {
          h: '1. Refund policy',
          p: [
            'Refund eligibility depends on whether the digital plan/service has already been delivered/started.',
            'To request a refund, contact support and include your order details.',
          ],
        },
        {
          h: '2. Gift cards',
          p: [
            'Gift cards can be refunded only if they have not been used (partially or fully), and where permitted by applicable law.',
          ],
        },
        {
          h: '3. How to request',
          p: [
            `Email: ${company.email}.`,
            'Include: order date, email, amount, and reason.',
          ],
        },
      ],
    };

    const sections = locale === 'lt' ? sectionsLt : sectionsEn;
    const key = kind === 'privacy' ? 'privacy' : kind === 'terms' ? 'terms' : 'refunds';
    return sections[key] || [];
  }, [kind, locale]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-6">
      <h1 className="font-heading text-4xl font-extrabold">{t(titleKey)}</h1>

      <div className="rounded-2xl border border-black/10 p-5 space-y-6">
        {content.map((s) => (
          <section key={s.h} className="space-y-2">
            <h2 className="font-heading text-xl font-extrabold">{s.h}</h2>
            <div className="space-y-2 text-black/80">
              {s.p.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
