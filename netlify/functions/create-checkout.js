/**
 * Netlify Serverless Function: create-checkout
 *
 * This function runs securely on Netlify's servers — your secret Stripe key
 * NEVER touches the browser. It receives cart data from the frontend, creates
 * a Stripe Checkout session, and returns the hosted Stripe payment URL.
 *
 * ─────────────────────────────────────────────────────────────────
 * HOW TO ADD YOUR STRIPE KEY (do this in Netlify Dashboard, NOT here):
 *   1. Go to app.netlify.com → your site → Site Settings → Environment Variables
 *   2. Click "Add a variable"
 *   3. Key:   STRIPE_SECRET_KEY
 *   4. Value: sk_live_... (your secret key from stripe.com/dashboard/apikeys)
 *   5. Save — Netlify redeploys automatically
 *
 * For testing, use sk_test_... first. Switch to sk_live_... when ready to go live.
 * ─────────────────────────────────────────────────────────────────
 */

// stripe package is installed via netlify/functions/package.json
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { items, personalizationNote, colorPreference, giftMessage } = JSON.parse(event.body);

    if (!items || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) };
    }

    // Build Stripe line items from cart
    // Each item must have a valid Stripe Price ID (price_xxxx) from your Dashboard
    const lineItems = items.map((item) => ({
      price: item.priceId,   // e.g., "price_1AbCdEfGhIjKlMnO"
      quantity: item.quantity,
    }));

    // ─── Custom fields (max 3 allowed by Stripe) ────────────────────────────
    // These appear as editable boxes on the Stripe Checkout page.
    // The customer fills them in, and you see the answers in your Stripe Dashboard
    // under Payments > [order] > Customer details.
    const customFields = [];

    if (personalizationNote) {
      customFields.push({
        key: 'personalization',
        label: { type: 'custom', custom: 'Personalization Details' },
        type: 'text',
        optional: false,
      });
    }

    if (colorPreference) {
      customFields.push({
        key: 'color_preference',
        label: { type: 'custom', custom: 'Color / Style Preference' },
        type: 'text',
        optional: true,
      });
    }

    if (giftMessage) {
      customFields.push({
        key: 'gift_message',
        label: { type: 'custom', custom: 'Gift Message (optional)' },
        type: 'text',
        optional: true,
      });
    }

    // ─── Shipping options ────────────────────────────────────────────────────
    // Local pickup (free) and standard shipping ($7.95)
    const shippingOptions = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'usd' },
          display_name: 'Local Pickup — Edmond, OK (FREE)',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 1 },
            maximum: { unit: 'business_day', value: 3 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 795, currency: 'usd' },
          display_name: 'Standard Shipping (USPS First Class)',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 8 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 1495, currency: 'usd' },
          display_name: 'Priority Shipping (USPS Priority)',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 2 },
            maximum: { unit: 'business_day', value: 4 },
          },
        },
      },
    ];

    // ─── Create Stripe Checkout session ─────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: shippingOptions,
      custom_fields: customFields.slice(0, 3), // Stripe allows max 3
      allow_promotion_codes: true,
      // After payment, redirect customer to your success page
      success_url: `${process.env.URL || 'http://localhost:8888'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      // If customer cancels, send them back to the cart
      cancel_url: `${process.env.URL || 'http://localhost:8888'}/cart.html`,
      metadata: {
        source: 'cut-and-curated-keepsakes-website',
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Stripe error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Payment setup failed. Please try again.' }),
    };
  }
};
