# MVP: Plans + Cart + Stripe + Supabase

## Frontend (Vite/React)

Routes are mandatory-prefixed:
- LT: `/lt/*`
- EN: `/en/*`
- `/` redirects to `/lt` if browser language starts with `lt`, else `/en` (persists to `localStorage`).

### Required env
Create `.env` from `.env.example`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_FUNCTIONS_URL` (e.g. `https://<project-ref>.functions.supabase.co`)
- `VITE_STRIPE_PUBLISHABLE_KEY` (for custom on-page checkout)

Run:
- `npm install`
- `npm run dev`

## Hostinger SPA rewrites
This repo includes [public/.htaccess](public/.htaccess) so Hostinger/Apache serves `index.html` for all non-file routes.

## Supabase (DB + RLS)

1) Apply migration: [supabase/migrations/20260105_000000_init_mvp.sql](supabase/migrations/20260105_000000_init_mvp.sql)
2) Create an admin auth user in Supabase Auth (email/password)
3) Insert the user id into `admin_users` table to grant admin access

## Supabase Edge Functions
Functions:
- `validate-gift-card`
- `create-payment-intent`
- `stripe-webhook`

Create function env from [supabase/functions/.env.example](supabase/functions/.env.example).

### Stripe webhooks
Configure Stripe webhook endpoint to Supabase function:
- `POST https://<project-ref>.functions.supabase.co/stripe-webhook`

Enable events (minimum):
- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.updated`

How to enable these events in Stripe (Dashboard):
1) Stripe Dashboard → **Developers** → **Webhooks**
2) Select your webhook endpoint (or **Add endpoint**)
3) Under **Events to send**, click **Select events**
4) Add at least:
	- `checkout.session.completed`
	- `checkout.session.expired`
	- `payment_intent.succeeded`
	- `payment_intent.payment_failed`
	- `charge.refunded`
	- `charge.dispute.created`
	- `charge.dispute.updated`
5) Save

How to verify it's working:
- Stripe Dashboard → Developers → Webhooks → your endpoint → **Recent deliveries**
- You should see `checkout.session.completed` and/or `payment_intent.succeeded` with a **200** response.

Troubleshooting: Stripe shows **"No destinations"**
- This almost always means the event happened in a Stripe **mode/account** that has **no webhook endpoint configured**.
- Stripe has separate webhook endpoints for **Test mode** and **Live mode**.
	- If your site is using `pk_test_...` / `sk_test_...`, you must configure the webhook while **Test mode is ON**.
	- If your site is using `pk_live_...` / `sk_live_...`, you must configure the webhook while **Test mode is OFF**.
- Also make sure you’re looking at the right Stripe account (if you have multiple).

Troubleshooting: 200 responses but nothing happens
- Check the delivery **response body** in Stripe “Recent deliveries”. If it says `missing_order_id`, the webhook is receiving the event but cannot link it to an order.
- Check Supabase Edge Function logs for `stripe-webhook` for lines like `[stripe-webhook] event received` and `[email] resend failed`.

Endpoint URL notes
- The recommended URL is `https://<project-ref>.functions.supabase.co/stripe-webhook`.
- Some Supabase setups also work via `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` (equivalent).
- If you accidentally point Stripe to a different Supabase project-ref, you’ll get **200s** in the wrong project and never see DB rows in the intended project.

### Supabase Edge Function secrets
These secrets must be set in **Supabase** (Edge Functions runtime). Your frontend `.env` is not used by functions.

Option A — Supabase Dashboard:
1) Supabase Dashboard → your project → **Project Settings** → **Edge Functions**
2) Add secrets (names must match exactly):
	- `SUPABASE_URL`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `STRIPE_SECRET_KEY`
	- `STRIPE_WEBHOOK_SECRET`
	- `RESEND_API_KEY`
	- `EMAIL_FROM`
	- `ADMIN_EMAIL` (optional)
	- `GIFT_CARD_PEPPER`
	- `PUBLIC_SITE_URL` / `SITE_NAME` / `EMAIL_LOGO_URL` / `SUPPORT_EMAIL` (optional branding)
3) Redeploy functions (or redeploy the project) so the new secrets are picked up.

Option B — Supabase CLI:
1) Install and login: `supabase login`
2) Link the project (once): `supabase link --project-ref <project-ref>`
3) Set secrets (repeat for each secret):
	- `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
	- `supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
	- `supabase secrets set RESEND_API_KEY=re_...`
	- `supabase secrets set EMAIL_FROM=no-reply@your-domain.lt`
	- `supabase secrets set SUPABASE_URL=https://<project-ref>.supabase.co`
	- `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`
	- `supabase secrets set GIFT_CARD_PEPPER=...`
4) Deploy functions:
	- `supabase functions deploy stripe-webhook`
	- `supabase functions deploy create-checkout-session`

## Notes
- Orders are marked **paid only by Stripe webhook**, not by frontend redirect.
- All customer/order/gift-card data is protected by RLS; admin access is gated by `admin_users`.
