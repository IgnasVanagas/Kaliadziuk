import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Legal({ kind }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const titleKey = kind === 'privacy' ? 'legal.privacy' : kind === 'terms' ? 'legal.terms' : 'legal.refunds';

  const content = useMemo(() => {
    const company = locale === 'lt'
      ? {
        name: 'Pavel Kaliadziuk'
        , email: 'pavel@kaliadziuk.lt'
        , website: 'kaliadziuk.lt'
      }
      : {
        name: 'Pavel Kaliadziuk'
        , email: 'pavel@kaliadziuk.lt'
        , website: 'kaliadziuk.lt'
      };

    const lastUpdated = new Date().toISOString().split('T')[0];

    const sectionsLt = {
      privacy: [
        {
          h: '1. Privatumo politikos santrauka',
          p: [
            `Ši privatumo politika paaiškina, kaip ${company.name} (toliau – „mes“) tvarko asmens duomenis, kai naudojatės svetaine ${company.website} ir perkate paslaugas/produktus ar dovanų kuponus.`,
            `Paskutinį kartą atnaujinta: ${lastUpdated}.`,
          ],
        },
        {
          h: '2. Duomenų valdytojas ir kontaktai',
          p: [
            `Duomenų valdytojas: ${company.name} (individuali veikla).`,
            `El. paštas užklausoms dėl duomenų apsaugos: ${company.email}.`,
          ],
        },
        {
          h: '3. Kokią informaciją tvarkome',
          p: [
            'Pirkimo/krepšelio metu tvarkome: el. pašto adresą, telefono numerį (jei pateikiate), vardą/pavardę (jei pateikiate), pasirinktą kalbą (lt/en), informaciją apie prekes/paslaugas (krepšelio turinį, kiekį, kainą, nuolaidas), sutikimų būsenas (taisyklių ir privatumo politikos priėmimą) ir rinkodaros sutikimą (jei pažymite).',
            'Apmokėjimo metu kortelės duomenų mes negauname ir nesaugome. Kortelės duomenis apdoroja Stripe (pvz., kortelės numeris, galiojimo data, CVC).',
            'Tvarkome techninius duomenis, reikalingus paslaugos veikimui ir saugumui: IP adresą (gali būti matomas pas mus ir/ar pas paslaugų teikėjus), naršyklės/įrenginio informaciją, mokėjimo įvykio identifikatorius (pvz., Stripe PaymentIntent ID), sistemos žurnalus (auditą) ir klaidų įrašus.',
            'Jei perkate dovanų kuponą, tvarkome: kupono gavėjo vardą (jei pateikiate), kupono sumą, galiojimą ir kupono kodo maišą (hash). Pirkėjo kontaktiniai duomenys (pvz., el. paštas, vardas/pavardė – jei pateikiate) tvarkomi kaip ir visų užsakymų atveju.',
          ],
        },
        {
          h: '4. Iš kur gauname duomenis',
          p: [
            'Duomenis gauname (a) iš jūsų – kai juos pateikiate pirkimo metu ar rašote užklausas, ir (b) iš mūsų sistemų bei paslaugų teikėjų – kai gauname mokėjimo patvirtinimus (pvz., Stripe webhook įvykiai) ir techninius logus.',
          ],
        },
        {
          h: '5. Duomenų tvarkymo tikslai',
          p: [
            'Užsakymų priėmimui, apdorojimui ir įvykdymui (pvz., planų/paslaugų suteikimui, kuponų išdavimui).',
            'Mokėjimų inicijavimui ir patvirtinimui (mokėjimo statusų valdymui, sukčiavimo prevencijai).',
            'Privalomiems pranešimams ir operacinei komunikacijai (pvz., užsakymo patvirtinimo el. laiškams).',
            'Klientų aptarnavimui ir ginčų / grąžinimų administravimui.',
            'Teisiniams reikalavimams ir apskaitai (užsakymų įrašų, sumų, mokėjimo patvirtinimų saugojimui).',
            'Saugai ir sistemos veikimui (prieigos kontrolė, incidentų prevencija, auditavimas).',
          ],
        },
        {
          h: '6. Teisiniai pagrindai',
          p: [
            'Sutarties sudarymas ir vykdymas – užsakymui priimti, apmokėjimui ir paslaugai suteikti.',
            'Teisinė prievolė – apskaitos ir kiti privalomi įrašai pagal taikomus teisės aktus.',
            'Sutikimas – rinkodaros pranešimams, jei pažymite sutikimą; sutikimą galite bet kada atšaukti.',
            'Teisėtas interesas – saugos užtikrinimui, sukčiavimo prevencijai, sistemų patikimumui, įrodymų ir auditų poreikiui.',
          ],
        },
        {
          h: '7. Duomenų gavėjai ir duomenų tvarkytojai',
          p: [
            'Stripe – mokėjimų apdorojimui ir mokėjimo patvirtinimams (pvz., Stripe webhooks). Stripe gali veikti kaip atskiras duomenų valdytojas kai kurių duomenų atžvilgiu, pagal savo privatumo politiką.',
            'El. pašto paslaugų teikėjas (pvz., Resend) – tik operacinių laiškų išsiuntimui (pvz., „užsakymas apmokėtas“).',
            'Infrastruktūros / duomenų bazės paslaugų teikėjas (pvz., Supabase) – užsakymų ir sisteminių duomenų saugojimui bei funkcijų vykdymui.',
            'Paslaugų teikėjams duomenis perduodame tik tiek, kiek būtina konkrečiam tikslui. Su tvarkytojais sudarome duomenų tvarkymo sutartis (DPA), kai to reikalauja BDAR.',
          ],
        },
        {
          h: '8. Duomenų perdavimas už EEE ribų',
          p: [
            'Kai kurie paslaugų teikėjai (pvz., Stripe ar el. pašto paslaugų teikėjas) gali tvarkyti duomenis už Europos ekonominės erdvės (EEE) ribų. Tokiais atvejais perdavimai atliekami taikant BDAR nustatytas apsaugos priemones (pvz., Europos Komisijos patvirtintas standartines sutarčių sąlygas), jei taikytina.',
          ],
        },
        {
          h: '9. Saugojimo laikotarpiai',
          p: [
            'Užsakymų ir mokėjimų įrašus (sumas, statusus, laiką, mokėjimo identifikatorius) saugome tiek, kiek būtina apskaitai ir teisiniams reikalavimams (dažnai iki 10 metų, priklausomai nuo taikomų teisės aktų).',
            'Kontaktinius duomenis (el. paštą, telefoną, vardą/pavardę – jei pateikiate) saugome tiek, kiek būtina užsakymui įvykdyti ir klientų aptarnavimui. Gavę pagrįstą prašymą, galime anonimizuoti asmens identifikatorius, išlaikydami privalomus finansinius įrašus.',
            'Dovanų kuponų duomenis saugome iki kupono galiojimo pabaigos ir papildomai tiek, kiek reikia apskaitai ar ginčų sprendimui.',
            'Techninius žurnalus saugome ribotą laiką, kiek reikia saugai ir trikčių diagnostikai.',
          ],
        },
        {
          h: '10. Duomenų sauga',
          p: [
            'Taikome organizacines ir technines priemones, skirtas apsaugoti duomenis nuo neteisėtos prieigos, praradimo ar atskleidimo (pvz., prieigos kontrolė, slaptažodžiai/raktai, minimalios teisės, auditavimas).',
            'Vis dėlto nė viena interneto sistema negali garantuoti absoliutaus saugumo; jei pastebite galimą incidentą, praneškite mums el. paštu.',
          ],
        },
        {
          h: '11. Jūsų teisės',
          p: [
            'Jūs turite teisę: (a) susipažinti su duomenimis, (b) reikalauti ištaisyti netikslius duomenis, (c) reikalauti ištrinti duomenis (kai taikytina), (d) apriboti tvarkymą, (e) nesutikti su tvarkymu, kai jis grindžiamas teisėtu interesu, (f) gauti duomenis perkeliamumo formatu, kai taikytina.',
            'Jei tvarkymas grindžiamas sutikimu (pvz., rinkodara), sutikimą galite bet kada atšaukti – tai nepaveiks iki atšaukimo atlikto tvarkymo teisėtumo.',
            `Teisių įgyvendinimui kreipkitės: ${company.email}. Į užklausas paprastai atsakome per 1 mėnesį (jei teisės aktai nenumato kitaip).`,
            'Taip pat turite teisę pateikti skundą priežiūros institucijai. Lietuvoje: Valstybinė duomenų apsaugos inspekcija (https://vdai.lrv.lt/).',
          ],
        },
        {
          h: '12. Slapukai ir naršyklės saugykla',
          p: [
            'Naudojame būtiną naršyklės saugyklą (pvz., localStorage ir sessionStorage) funkcionalumui: kalbos pasirinkimui, krepšelio išsaugojimui, mokėjimo sesijos tęstinumui. Tai yra būtina paslaugos suteikimui.',
            'Mokėjimo proceso metu Stripe gali naudoti savo slapukus ar panašias technologijas sukčiavimo prevencijai ir mokėjimų saugai. Tokiems tvarkymams taikomos Stripe taisyklės.',
          ],
        },
        {
          h: '13. Automatinis sprendimų priėmimas',
          p: [
            'Mes nevykdome automatizuoto sprendimų priėmimo, kuris sukeltų jums teisines pasekmes ar panašiai reikšmingai paveiktų, išskyrus atvejus, kai tokie sprendimai reikalingi mokėjimų saugai pas mokėjimo paslaugų teikėją (pvz., Stripe).',
          ],
        },
        {
          h: '14. Politikos pakeitimai',
          p: [
            'Privatumo politiką galime atnaujinti. Atnaujinus, paskelbsime naują versiją šiame puslapyje ir atnaujinsime „Paskutinį kartą atnaujinta“ datą.',
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
            'Kainos nurodomos EUR. Apmokėjimai apdorojami per Stripe.',
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
          h: '1. Privacy policy summary',
          p: [
            `This privacy policy explains how ${company.name} ("we") processes personal data when you use ${company.website} and purchase services/products or gift cards.`,
            `Last updated: ${lastUpdated}.`,
          ],
        },
        {
          h: '2. Data controller and contact',
          p: [
            `Data controller: ${company.name} (individual activity).`,
            `Email for privacy requests: ${company.email}.`,
          ],
        },
        {
          h: '3. What data we process',
          p: [
            'During checkout we process: email address, phone number (if provided), full name (if provided), locale (lt/en), product/service information (cart items, quantities, prices, discounts), consent statuses (terms/privacy acceptance), and marketing opt-in (if selected).',
            'We do not receive or store your card details. Card data is processed by Stripe.',
            'We also process technical data needed for operation and security: IP address (may be visible to us and/or our providers), browser/device information, payment identifiers (e.g., Stripe PaymentIntent ID), audit logs and error logs.',
            'If you purchase a gift card, we process: recipient name/email (if provided), buyer name/email (if provided), gift card amount, expiry, and a hashed gift card code. We do not store the full gift card code long-term in plain text.',
          ],
        },
        {
          h: '4. Data sources',
          p: [
            'We receive data (a) from you when you provide it during checkout or contact us, and (b) from our systems and providers when we receive payment confirmations (e.g., Stripe webhook events) and technical logs.',
          ],
        },
        {
          h: '5. Purposes of processing',
          p: [
            'To accept, process, and fulfill orders (including delivering plans/services and issuing gift cards).',
            'To initiate and confirm payments (including status management and fraud prevention).',
            'To send required transactional communications (e.g., “order paid” emails).',
            'For customer support and dispute/refund handling.',
            'For legal compliance and accounting recordkeeping.',
            'For security and service reliability (access control, incident prevention, audit logs).',
          ],
        },
        {
          h: '6. Legal bases',
          p: [
            'Contract performance for accepting and fulfilling your order.',
            'Legal obligation for accounting and other mandatory records.',
            'Consent for marketing emails if you opt in; you can withdraw consent at any time.',
            'Legitimate interests for security, fraud prevention, reliability, and auditability.',
          ],
        },
        {
          h: '7. Recipients and processors',
          p: [
            'Stripe for payment processing and payment confirmations (e.g., webhooks). Stripe may act as an independent controller for certain processing under its own privacy policy.',
            'Transactional email provider (e.g., Resend) strictly for sending emails required to operate the service.',
            'Infrastructure/database provider (e.g., Supabase) to store orders and operate the service.',
            'We share data with providers only to the extent necessary. Where required, we enter into data processing agreements (DPAs).',
          ],
        },
        {
          h: '8. International transfers (outside the EEA)',
          p: [
            'Some providers (e.g., Stripe or email delivery providers) may process data outside the European Economic Area. Where applicable, transfers rely on GDPR-approved safeguards such as the European Commission’s Standard Contractual Clauses.',
          ],
        },
        {
          h: '9. Retention',
          p: [
            'Order and payment records (totals, statuses, timestamps, payment identifiers) are retained as needed for accounting and legal obligations (often up to 10 years, depending on applicable law).',
            'Contact details are retained as needed to fulfill and support orders. On justified request, we can anonymize personal identifiers while keeping mandatory financial records.',
            'Gift card data is retained through validity and additionally as needed for accounting/disputes.',
            'Technical logs are retained for a limited period for security and troubleshooting.',
          ],
        },
        {
          h: '10. Security',
          p: [
            'We use organizational and technical measures to protect personal data (e.g., access controls, secrets management, least privilege, auditability).',
            'No online system can guarantee absolute security; if you suspect an incident, contact us by email.',
          ],
        },
        {
          h: '11. Your rights',
          p: [
            'You have the right to request access, rectification, erasure (where applicable), restriction, object to processing based on legitimate interests, and data portability where applicable.',
            'If processing is based on consent (marketing), you can withdraw it at any time; this will not affect processing carried out before withdrawal.',
            `To exercise rights, contact: ${company.email}. We typically respond within 1 month unless law allows an extension.`,
            'You also have the right to lodge a complaint with a supervisory authority. In Lithuania: State Data Protection Inspectorate (https://vdai.lrv.lt/).',
          ],
        },
        {
          h: '12. Cookies and browser storage',
          p: [
            'We use essential browser storage (e.g., localStorage and sessionStorage) for core functionality such as language selection, cart persistence, and payment session continuity.',
            'During payment, Stripe may use its own cookies or similar technologies for fraud prevention and payment security under Stripe’s policies.',
          ],
        },
        {
          h: '13. Automated decision-making',
          p: [
            'We do not perform automated decision-making with legal or similarly significant effects, except where such processing is performed by the payment provider for fraud prevention/payment security.',
          ],
        },
        {
          h: '14. Changes to this policy',
          p: [
            'We may update this policy from time to time. The latest version will be published on this page and the “Last updated” date will be changed accordingly.',
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
            'Prices are in EUR. Payments are processed via Stripe.',
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
      <div>
        <button
          type="button"
          onClick={() => {
            try {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate(locale === 'lt' ? '/lt' : '/en', { replace: true });
              }
            } catch {
              navigate(locale === 'lt' ? '/lt' : '/en', { replace: true });
            }
          }}
          className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-accent hover:text-accent"
        >
          <span aria-hidden="true">←</span>
          {locale === 'lt' ? 'Atgal' : 'Back'}
        </button>
      </div>
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
