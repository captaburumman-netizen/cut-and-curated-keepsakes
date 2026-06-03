/**
 * stripe-webhook.js — Handles checkout.session.completed
 * Decrements stock in Stripe product metadata for each purchased item.
 *
 * Set up in Stripe Dashboard:
 *   Endpoint URL: https://YOUR-SITE.netlify.app/stripe-webhook
 *   Events: checkout.session.completed
 *   Copy the "Signing secret" → add as STRIPE_WEBHOOK_SECRET in Netlify env vars
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return { statusCode: 500, body: 'Webhook secret not configured' };
  }

  let stripeEvent;
  try {
    // Use raw body for signature verification (Netlify provides it as string)
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    try {
      // Expand line items to get product IDs
      const fullSession = await stripe.checkout.sessions.retrieve(
        session.id,
        { expand: ['line_items.data.price.product'] }
      );

      const lineItems = fullSession.line_items?.data || [];

      for (const item of lineItems) {
        const product = item.price?.product;
        if (!product || typeof product !== 'object') continue;

        const productId = product.id;
        const currentStock = parseInt(product.metadata?.stock ?? '-1', 10);

        // Only decrement if stock is being tracked (>= 0)
        if (currentStock < 0) continue;

        const qty = item.quantity || 1;
        const newStock = Math.max(0, currentStock - qty);

        await stripe.products.update(productId, {
          metadata: {
            ...product.metadata,
            stock: String(newStock),
          },
        });

        console.log(
          `Stock updated: ${product.name} (${productId}) — ${currentStock} → ${newStock}`
        );
      }
    } catch (err) {
      console.error('Error updating stock:', err.message);
      // Still return 200 so Stripe doesn't retry — log the error instead
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
