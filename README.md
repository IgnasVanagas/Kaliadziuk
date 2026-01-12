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
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.updated`

## Notes
- Orders are marked **paid only by Stripe webhook**, not by frontend redirect.
- All customer/order/gift-card data is protected by RLS; admin access is gated by `admin_users`.
