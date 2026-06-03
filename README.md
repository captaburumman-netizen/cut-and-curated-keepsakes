# Cut & Curated Keepsakes — Website Guide

A complete static e-commerce website for **Cut & Curated Keepsakes** (@cutandcuratedks).
Built with HTML, CSS, and vanilla JavaScript. Payments via Stripe Checkout. Hosted on Netlify.

---

## Quick Start Checklist

Before you go live, complete these steps in order:

- [ ] Step 1 — Push this folder to a GitHub repo
- [ ] Step 2 — Connect GitHub repo to Netlify
- [ ] Step 3 — Add Stripe keys to Netlify environment variables
- [ ] Step 4 — Add your Stripe Price IDs to `js/products.js`
- [ ] Step 5 — Add your product photos to `images/products/`
- [ ] Step 6 — Update your story and contact email in the HTML
- [ ] Step 7 — Test with Stripe test mode (fake card: 4242 4242 4242 4242)
- [ ] Step 8 — Switch to live Stripe keys when ready to sell

---

## (A) How to Connect This Repo to Netlify

**Step 1 — Create a GitHub repository**
1. Go to [github.com](https://github.com) and sign in (create an account if needed — it's free)
2. Click the green **"New"** button to create a new repository
3. Name it something like `cut-and-curated-keepsakes`
4. Leave it **Public** or **Private** (both work with Netlify)
5. Click **"Create repository"**

**Step 2 — Push your files to GitHub**

Open Terminal (Mac) and run:
```bash
cd /path/to/cut-and-curated-keepsakes   # navigate to this folder
git init
git add .
git commit -m "Initial site build"
git remote add origin https://github.com/YOUR_USERNAME/cut-and-curated-keepsakes.git
git push -u origin main
```

**Step 3 — Connect to Netlify**
1. Go to [app.netlify.com](https://app.netlify.com) and sign up/in (use "Sign up with GitHub" for easiest setup)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select your `cut-and-curated-keepsakes` repository
5. Build settings:
   - **Build command:** *(leave blank)*
   - **Publish directory:** `.` (a single dot)
6. Click **"Deploy site"**

✅ Your site is now live! Netlify gives you a free URL like `amazing-name-123456.netlify.app`.

**Optional: Add a custom domain**
In Netlify → Site Settings → Domain Management → Add custom domain.

---

## (B) How to Add Your Stripe Keys Safely

Your **Stripe secret key** must NEVER go in the code — it lives only in Netlify's environment variables.

**Step 1 — Find your Stripe keys**
1. Go to [stripe.com](https://stripe.com) and log in
2. In the top left, make sure you're in **Test mode** (toggle says "Test")
3. Go to **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** — starts with `pk_test_...` (safe to share publicly — not needed here)
   - **Secret key** — starts with `sk_test_...` ⚠️ **Keep this private**

**Step 2 — Add your secret key to Netlify**
1. Go to [app.netlify.com](https://app.netlify.com) → your site
2. Click **Site Settings** → **Environment Variables**
3. Click **"Add a variable"**
4. Set:
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** your `sk_test_...` key (paste it in)
5. Click **Save**

Netlify will automatically redeploy and the serverless function can now use `process.env.STRIPE_SECRET_KEY`.

**⚠️ Never paste your secret key into any HTML, JS, or CSS file.**

---

## (C) How to Add or Remove a Product

### Adding a New Product

**Step 1 — Create the product in Stripe**
1. Go to [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
2. Click **"+ Add product"**
3. Fill in:
   - **Name:** e.g., "Glitter Letter Charm"
   - **Description:** (optional, but good for your records)
   - **Image:** upload a photo
   - **Price:** enter the price, choose "One time"
4. Click **"Save product"**
5. On the product page, click the price line → copy the **"API ID"** — it looks like `price_1AbCdEfGhIjKlMnO`

**Step 2 — Add the product to your website**
1. Open `js/products.js`
2. Find the last product in the `PRODUCTS` array
3. Copy an existing product block and paste it at the end (before the closing `]`)
4. Fill in:
   - `id` — a unique slug, e.g., `'glitter-letter-charm'`
   - `name` — product name
   - `priceId` — paste the `price_xxxx` from Stripe
   - `price` — in **cents** (e.g., $15.00 = `1500`)
   - `displayPrice` — formatted string (e.g., `'$15.00'`)
   - `category` — choose from: `resin`, `planners`, `pens-bookmarks`, `keychains`, `trays`, `serving-stands`, `gift-baskets`
   - `description`, `image`, `imageAlt`, `processingTime` — fill in
   - `hasPersonalization` — `true` if the customer needs to enter a name/text
   - `personalizationFields` — array of input fields (copy from a similar product)

**Step 3 — Create a product page**
1. Copy `products/initial-keychain.html`
2. Rename it `products/glitter-letter-charm.html`
3. Open it and update:
   - `<title>` and `<meta name="description">`
   - `data-product-id="glitter-letter-charm"` on the `<body>` tag
   - The breadcrumb text

**Step 4 — Add a product photo**
- Save your photo as `images/products/glitter-letter-charm.jpg`
- Recommended size: 800×800px, JPG or WebP
- Make sure it matches the `image` path in products.js

**Step 5 — Deploy**
```bash
git add .
git commit -m "Add glitter letter charm product"
git push
```
Netlify redeploys automatically in about 30 seconds.

### Removing a Product

1. Delete (or comment out) its block in `js/products.js`
2. In Stripe Dashboard → Products → find the product → click **"Archive"** on the price (this prevents it from being purchased)
3. Optionally delete the product's HTML page from `products/`
4. Push to GitHub

### Changing a Price

Stripe doesn't let you edit an existing price — you create a new one:
1. In Stripe, go to the product → click **"Add another price"**
2. Enter the new price → save → copy the new `price_xxxx`
3. Update `priceId` in `js/products.js`
4. Archive the old price in Stripe

---

## (D) Switching from Test Mode to Live

When you're ready to accept real payments:

**Step 1 — Activate your Stripe account**
1. Go to [dashboard.stripe.com/account](https://dashboard.stripe.com/account)
2. Click **"Activate account"** and complete identity verification
3. Add your bank account for payouts

**Step 2 — Get your live secret key**
1. In Stripe Dashboard, click the **"Test mode"** toggle to switch to **Live mode**
2. Go to **Developers** → **API keys**
3. Copy your **Secret key** — it starts with `sk_live_...`

**Step 3 — Update Netlify environment variable**
1. Go to Netlify → Site Settings → Environment Variables
2. Find `STRIPE_SECRET_KEY`
3. Click **Edit** and replace `sk_test_...` with `sk_live_...`
4. Save → Netlify redeploys

**Step 4 — Recreate your products in live mode**
⚠️ Stripe products created in Test mode don't exist in Live mode.
1. Switch your Stripe dashboard to **Live mode**
2. Go to Products → recreate each product
3. Copy the new live `price_xxxx` IDs
4. Update `js/products.js` with the live price IDs
5. Push to GitHub

**Step 5 — Test with a real card**
Make one small real purchase to confirm everything works end to end.

---

## File Structure

```
cut-and-curated-keepsakes/
├── index.html                    # Home page
├── shop.html                     # Shop / product grid
├── cart.html                     # Cart + checkout
├── custom-orders.html            # Custom order quote form
├── about.html                    # About page
├── contact.html                  # Contact + FAQ
├── success.html                  # Post-payment / post-form confirmation
├── 404.html                      # Not found page
│
├── products/                     # Individual product pages
│   ├── birth-stat-plaque.html
│   ├── memorial-piece.html
│   ├── personalized-planner.html
│   ├── glitter-pen-set.html
│   ├── glitter-bookmark.html
│   ├── initial-keychain.html
│   ├── letter-charm.html
│   ├── trinket-tray-pressed-flowers.html
│   ├── tiered-serving-stand.html
│   ├── gift-basket-birthday.html
│   ├── gift-basket-valentines.html
│   └── gift-basket-ramadan.html
│
├── css/
│   └── styles.css                # All styles (design system + components)
│
├── js/
│   ├── products.js               # ⭐ Product catalog + Stripe Price IDs — edit this!
│   ├── cart.js                   # Cart logic (localStorage)
│   ├── main.js                   # Page interactions, product grid rendering
│   └── layout.js                 # Shared nav + footer injection
│
├── images/
│   ├── products/                 # ⭐ Add your product photos here
│   ├── maker-photo.jpg           # ⭐ Replace with your photo
│   ├── about-maker.jpg           # ⭐ Replace with your photo
│   └── placeholder.svg           # Shown while photos load
│
├── netlify/
│   └── functions/
│       ├── create-checkout.js    # Serverless function (Stripe Checkout)
│       └── package.json          # Stripe npm dependency
│
├── netlify.toml                  # Netlify configuration
└── README.md                     # This file
```

---

## Photos You Need to Replace

| File | What to put there | Recommended size |
|------|-------------------|-----------------|
| `images/maker-photo.jpg` | You working in your studio | 800×1000px |
| `images/about-maker.jpg` | A different photo of you | 800×1000px |
| `images/og-image.jpg` | A beautiful product photo for social sharing | 1200×630px |
| `images/products/birth-stat-plaque.jpg` | Birth stat plaque product photo | 800×800px |
| `images/products/memorial-piece.jpg` | Memorial piece photo | 800×800px |
| `images/products/personalized-planner.jpg` | Planner photo | 800×800px |
| `images/products/glitter-pen-set.jpg` | Glitter pens photo | 800×800px |
| `images/products/glitter-bookmark.jpg` | Bookmark photo | 800×800px |
| `images/products/initial-keychain.jpg` | Keychain photo | 800×800px |
| `images/products/letter-charm.jpg` | Letter charm photo | 800×800px |
| `images/products/trinket-tray.jpg` | Trinket tray photo | 800×800px |
| `images/products/tiered-serving-stand.jpg` | Serving stand photo | 800×800px |
| `images/products/gift-basket-birthday.jpg` | Birthday basket photo | 800×800px |
| `images/products/gift-basket-valentines.jpg` | Valentine's basket photo | 800×800px |
| `images/products/gift-basket-ramadan.jpg` | Ramadan basket photo | 800×800px |

**Photo tips:**
- Use consistent, bright natural lighting
- Shoot against a white, cream, or blush background to match the brand
- JPG or WebP format; compress with [squoosh.app](https://squoosh.app) for fast load times

---

## Text to Personalize

Search these placeholders and replace with your real information:

| Placeholder | Replace with |
|-------------|-------------|
| `hello@cutandcuratedks.com` | Your actual email address |
| `[Your Name]` | Your first name (in About page) |
| `[YOUR NAME]` | Your name for the img alt text |
| Replace testimonials | Your real customer reviews |

---

## Instagram Feed

The homepage shows placeholder boxes linking to your Instagram. To embed a real feed:
1. Sign up for [Elfsight](https://elfsight.com) or [Curator.io](https://curator.io) (both have free tiers)
2. Connect your Instagram account
3. Customize the widget style
4. Copy the embed code snippet
5. Paste it inside the `<div class="instagram-grid">` in `index.html`, replacing the placeholder links

---

## Need Help?

- **Netlify docs:** docs.netlify.com
- **Stripe docs:** stripe.com/docs
- **Questions about this site:** reach out to your developer
