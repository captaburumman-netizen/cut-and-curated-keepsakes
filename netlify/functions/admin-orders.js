/**
 * admin-orders.js — Fetch recent Stripe Checkout Sessions
 * Method: GET
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

async function verifyAdmin(event) {
  const auth = event.headers.authorization || event.headers.Authorization || '';
  if (!auth.startsWith('Bearer ')) throw new Error('Unauthorized');
  const token = auth.slice(7);
  const identityUrl =
    process.env.NETLIFY_IDENTITY_URL ||
    (process.env.URL + '/.netlify/identity');
  const res = await fetch(`${identityUrl}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    await verifyAdmin(event);
  } catch (e) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const sessions = await stripe.checkout.sessions.list({
      limit: 50,
      expand: ['data.line_items', 'data.customer'],
    });

    const orders = sessions.data.map((session) => {
      const lineItems = (session.line_items?.data || []).map((item) => ({
        name: item.description,
        quantity: item.quantity,
        amount: item.amount_total,
        display: `$${((item.amount_total || 0) / 100).toFixed(2)}`,
      }));

      const personalization = {};
      if (session.custom_fields && session.custom_fields.length > 0) {
        for (const field of session.custom_fields) {
          personalization[field.key] =
            field.text?.value || field.dropdown?.value || field.numeric?.value || '';
        }
      }

      const customer =
        typeof session.customer === 'object' && session.customer !== null
          ? session.customer
          : null;

      return {
        id: session.id,
        shortId: session.id.slice(-8).toUpperCase(),
        customerName:
          session.customer_details?.name ||
          customer?.name ||
          'Guest',
        customerEmail:
          session.customer_details?.email ||
          customer?.email ||
          '',
        items: lineItems,
        total: session.amount_total,
        totalDisplay: `$${((session.amount_total || 0) / 100).toFixed(2)}`,
        date: new Date(session.created * 1000).toISOString(),
        dateDisplay: new Date(session.created * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: session.payment_status,
        shippingAddress: session.shipping_details?.address || null,
        personalization,
        metadata: session.metadata || {},
      };
    });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ orders }),
    };
  } catch (err) {
    console.error('admin-orders error:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
