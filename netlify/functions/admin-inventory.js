/**
 * admin-inventory.js — Stock management via Stripe product metadata
 * Methods: GET (list with stock), PUT (update stock)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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

  try {
    await verifyAdmin(event);
  } catch (e) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const LOW_STOCK_THRESHOLD = parseInt(
    process.env.LOW_STOCK_THRESHOLD || '5',
    10
  );

  try {
    // ── GET: list all products with stock levels ──────────────────────────────
    if (event.httpMethod === 'GET') {
      const products = await stripe.products.list({ limit: 100, active: true });

      const inventory = products.data.map((p) => {
        const stock = parseInt(p.metadata?.stock ?? '-1', 10);
        let stockStatus = 'ok';
        if (stock === 0) stockStatus = 'out';
        else if (stock > 0 && stock <= LOW_STOCK_THRESHOLD) stockStatus = 'low';
        else if (stock < 0) stockStatus = 'untracked';

        return {
          id: p.id,
          name: p.name,
          images: p.images || [],
          stock,
          stockStatus,
          lowStockThreshold: LOW_STOCK_THRESHOLD,
          metadata: p.metadata || {},
        };
      });

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({
          inventory,
          lowStockThreshold: LOW_STOCK_THRESHOLD,
          lowStockCount: inventory.filter((i) => i.stockStatus === 'low' || i.stockStatus === 'out').length,
        }),
      };
    }

    // ── PUT: update stock level for a product ─────────────────────────────────
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { id, stock } = body;

      if (!id || stock === undefined) {
        return {
          statusCode: 400,
          headers: CORS,
          body: JSON.stringify({ error: 'id and stock are required' }),
        };
      }

      const stockValue = Math.max(0, parseInt(stock, 10));

      const existing = await stripe.products.retrieve(id);
      const updated = await stripe.products.update(id, {
        metadata: {
          ...existing.metadata,
          stock: String(stockValue),
        },
      });

      const newStock = parseInt(updated.metadata?.stock ?? '0', 10);
      let stockStatus = 'ok';
      if (newStock === 0) stockStatus = 'out';
      else if (newStock <= LOW_STOCK_THRESHOLD) stockStatus = 'low';

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({
          success: true,
          id: updated.id,
          name: updated.name,
          stock: newStock,
          stockStatus,
        }),
      };
    }

    return {
      statusCode: 405,
      headers: CORS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (err) {
    console.error('admin-inventory error:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
