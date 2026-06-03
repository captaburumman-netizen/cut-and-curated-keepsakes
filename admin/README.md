# Cut & Curated Admin Dashboard — Setup Guide

This is your private admin dashboard for managing products, inventory, orders, stats, and analytics. It lives at `/admin` and is protected by Netlify Identity.

---

## a) Enable Netlify Identity & Invite Yourself

1. Go to [app.netlify.com](https://app.netlify.com) and open your site.
2. Click **Site Settings** → **Identity** → **Enable Identity**.
3. Under **Registration**, choose **Invite only** (important — this prevents strangers from signing up).
4. Scroll to **Invite users** and enter your email address. Click **Send invite**.
5. Check your inbox for the invite email and follow the link to set your password.
6. Visit `https://your-site.netlify.app/admin` and sign in with your email + password.

> **Tip:** The dashboard uses the Netlify Identity widget. Your login token is automatically refreshed and sent as a `Bearer` header to all admin functions. No session state is stored in the browser beyond what the widget manages.

---

## b) Environment Variables

Set all of these in **Netlify Dashboard → Site Settings → Environment Variables**.

| Variable | Description | Where to get it |
|---|---|---|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | stripe.com → Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe → Developers → Webhooks → your endpoint |
| `LOW_STOCK_THRESHOLD` | Units below which "Low Stock" warning appears | Set to any integer, e.g. `5` |
| `PLAUSIBLE_API_KEY` | Plausible API key for analytics | plausible.io → Settings → API |
| `PLAUSIBLE_SITE_ID` | Your domain as registered in Plausible | e.g. `yoursite.com` |

`NETLIFY_IDENTITY_URL` is set automatically by Netlify when Identity is enabled. You only need to set it manually if you're running locally with `netlify dev`.

After adding or changing any variable, **re-deploy** your site (push a commit or trigger a deploy manually) for the changes to take effect in your functions.

---

## c) Set Up the Stripe Webhook

The webhook (`stripe-webhook.js`) listens for completed purchases and automatically decrements stock.

1. Go to [stripe.com](https://stripe.com) → **Developers** → **Webhooks** → **Add endpoint**.
2. Set the **Endpoint URL** to:
   ```
   https://your-site.netlify.app/stripe-webhook
   ```
3. Under **Events to listen for**, select:
   - `checkout.session.completed`
4. Click **Add endpoint**.
5. On the endpoint page, click **Reveal signing secret** → copy the `whsec_...` value.
6. In Netlify, add it as `STRIPE_WEBHOOK_SECRET`.

> **Test mode:** Use `stripe listen --forward-to localhost:8888/stripe-webhook` with the Stripe CLI while developing locally. The CLI gives you a local signing secret to use during testing.

---

## d) Connect Plausible Analytics

Plausible is a privacy-friendly analytics tool. The dashboard's Analytics section will show zeros with a notice until you connect it.

1. Sign up at [plausible.io](https://plausible.io) (paid service, ~$9/mo).
2. Add your site's domain (e.g. `yoursite.netlify.app` or your custom domain).
3. Add the Plausible tracking script to your HTML pages (see their setup guide).
4. Go to **plausible.io → your account → Settings → API Keys** → create a new key. Copy it.
5. Your **Site ID** is the domain you registered, e.g. `yoursite.com`.
6. Add both to Netlify env vars:
   - `PLAUSIBLE_API_KEY` = the key you copied
   - `PLAUSIBLE_SITE_ID` = your registered domain

If these vars are missing, the Analytics section gracefully shows zeros and a setup notice — it will never crash.

---

## e) Testing in Stripe Test Mode

**Always test with test mode keys before going live.**

1. In Stripe, make sure you're on the **Test mode** toggle (top right of dashboard).
2. Copy your **test secret key** (`sk_test_...`) and set it as `STRIPE_SECRET_KEY` in Netlify.
3. Use Stripe's [test card numbers](https://stripe.com/docs/testing#cards):
   - `4242 4242 4242 4242` — successful payment
   - `4000 0000 0000 9995` — card declined
   - Any future expiry date, any 3-digit CVC.
4. Make a test purchase on your site. It will appear in your admin Orders section.
5. The webhook will fire (if configured) and decrement stock.
6. **To switch to live:** change `STRIPE_SECRET_KEY` to your live `sk_live_...` key, update the webhook endpoint to use your live Stripe account, and re-deploy.

> **Important:** Never commit your Stripe keys to Git. Always set them via Netlify environment variables only.

---

## File Structure

```
netlify/functions/
  admin-products.js    — Product CRUD (Stripe Products API)
  admin-orders.js      — Recent checkout sessions
  admin-stats.js       — Revenue & sales statistics
  admin-inventory.js   — Stock management
  admin-analytics.js   — Plausible visitor stats
  stripe-webhook.js    — Auto-decrement stock on purchase
  create-checkout.js   — (existing) Stripe checkout session creator

admin/
  index.html           — The entire admin dashboard (single SPA file)
  README.md            — This file
```

---

## Local Development

```bash
npm install
npx netlify dev
```

Then open `http://localhost:8888/admin`. You'll need the Netlify CLI and a `.env` file (or `netlify.toml` env overrides) with your test keys. The Netlify Identity widget works on localhost with your live Identity instance.
