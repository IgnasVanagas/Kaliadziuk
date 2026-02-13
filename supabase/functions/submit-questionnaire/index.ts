import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";

const fieldLabels: Record<string, string> = {
  goal: "Pagrindinis tikslas",
  motivation: "Patirtis / Motyvacija",
  workday: "Darbo pobūdis",
  sleep: "Miego kokybė (1-10)",
  tracker: "Pulsometras",
  discomforts: "Diskomfortas",
  injury: "Traumos",
  gender: "Lytis",
  age: "Amžius",
  weight: "Svoris (kg)",
  height: "Ūgis (cm)",
  family: "Širdies ligų istorija",
  smoking: "Rūkymas",
  stress: "Streso lygis (1-10)"
};

const orderedKeys = [
  'goal', 'motivation',
  'gender', 'age', 'height', 'weight',
  'workday', 'smoking', 'sleep', 'stress', 'tracker',
  'discomforts', 'injury', 'family'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { payload, email, user_id, locale } = await req.json();

    // 1. Save to DB
    const { error: dbError } = await supabase
      .from('questionnaire_submissions')
      .insert({
        payload,
        email,
        user_id: user_id || null,
      });

    if (dbError) {
      console.error('DB Error:', dbError);
      throw dbError;
    }

    // 2. Send Email
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    if (adminEmail) {
      const formattedLocale = locale === 'en' ? 'en' : 'lt';
      
      // Format payload into readable structured HTML
      let rows = '';
      
      // First, iterate nicely ordered keys
      for (const key of orderedKeys) {
        if (payload[key] !== undefined && payload[key] !== '') {
          const label = fieldLabels[key] || key;
          let val = payload[key];
          if (Array.isArray(val)) {
            val = val.join(', ');
          }
          rows += `<li style="margin-bottom: 8px;"><strong>${label}:</strong> <br/><span style="color: #333;">${val}</span></li>`;
        }
      }

      // Then check for any extra keys not in our ordered list (e.g. email if it was in payload, or future fields)
      for (const key of Object.keys(payload)) {
        if (!orderedKeys.includes(key) && key !== 'email') {
           const val = Array.isArray(payload[key]) ? payload[key].join(', ') : payload[key];
           rows += `<li style="margin-bottom: 8px;"><strong>${key}:</strong> <br/><span style="color: #333;">${val}</span></li>`;
        }
      }

      const html = `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h1 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Nauja anketos užklausa</h1>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>El. paštas:</strong> <a href="mailto:${email}">${email || 'Nenurodytas'}</a></p>
            <p style="margin: 5px 0;"><strong>Vartotojo ID:</strong> ${user_id || 'Nėra'}</p>
            <p style="margin: 5px 0;"><strong>Kalba:</strong> ${formattedLocale.toUpperCase()}</p>
          </div>

          <h3>Kliento atsakymai:</h3>
          <ul style="list-style-type: none; padding-left: 0;">${rows}</ul>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; color: #999; font-size: 12px;">
             <p>Neapdoroti duomenys:</p>
             <pre style="background: #eee; padding: 10px; overflow-x: auto;">${JSON.stringify(payload, null, 2)}</pre>
          </div>
        </div>
      `;

      await sendEmail({
        to: adminEmail,
        subject: `Nauja anketa: ${email || 'Nenurodytas'}`,
        html,
        template: 'questionnaire_submission',
        locale: 'lt',
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Submission error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
