/**
 * admin-products.js — Product CRUD via Stripe Products API
 * Methods: GET (list), POST (create), PUT (update), DELETE (archive)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    return {
      statusCode: 401,
      headers: CORS,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    // ── GET: list all products with their prices ──────────────────────────────
    if (event.httpMethod === 'GET') {
      const products = await stripe.products.list({ limit: 100, active: true });
      const prices = await stripe.prices.list({ limit: 100, active: true });

      const priceMap = {};
      for (const price of prices.data) {
        if (!priceMap[price.product]) priceMap[price.product] = [];
        priceMap[price.product].push(price);
      }

      const result = products.data.map((p) => {
        const productPrices = priceMap[p.id] || [];
        const defaultPrice = productPrices[0] || null;
        return {
          id: p.id,
          name: p.name,
          description: p.description || '',
          images: p.images || [],
          active: p.active,
          metadata: p.metadata || {},
          stock: parseInt(p.metadata?.stock ?? '-1', 10),
          hidden: p.metadata?.hidden === 'true',
          category: p.metadata?.category || '',
          price: defaultPrice
            ? {
                id: defaultPrice.id,
                amount: defaultPrice.unit_amount,
                currency: defaultPrice.currency,
                display: defaultPrice.unit_amount
                  ? `$${(defaultPrice.unit_amount / 100).toFixed(2)}`
                  : 'N/A',
              }
            : null,
        };
      });

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ products: result }),
      };
    }

    // ── POST: create product + price ──────────────────────────────────────────
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, description, price, stock, imageUrl, category } = body;

      if (!name || price === undefined) {
        return {
          statusCode: 400,
          headers: CORS,
          body: JSON.stringify({ error: 'name and price are required' }),
        };
      }

      const product = await stripe.products.create({
        name,
        description: description || '',
        images: imageUrl ? [imageUrl] : [],
        metadata: {
          stock: stock !== undefined ? String(stock) : '0',
          category: category || '',
          hidden: 'false',
        },
      });

      const stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(parseFloat(price) * 100),
        currency: 'usd',
      });

      return {
        statusCode: 201,
        headers: CORS,
        body: JSON.stringify({
          product: { ...product, price: stripePrice },
        }),
      };
    }

    // ── PUT: update product ────────────────────────────────────────────────────
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { id, name, description, price, stock, imageUrl, category, hidden } = body;

      if (!id) {
        return {
          statusCode: 400,
          headers: CORS,
          body: JSON.stringify({ error: 'id is required' }),
        };
      }

      const existing = await stripe.products.retrieve(id);
      const existingMeta = existing.metadata || {};

      const updateParams = {
        metadata: {
          ...existingMeta,
          stock: stock !== undefined ? String(stock) : existingMeta.stock,
          category: category !== undefined ? category : (existingMeta.category || ''),
          hidden: hidden !== undefined ? String(hidden) : (existingMeta.hidden || 'false'),
        },
      };

      if (name) updateParams.name = name;
      if (description !== undefined) updateParams.description = description;
      if (imageUrl) updateParams.images = [imageUrl];

      const updatedProduct = await stripe.products.update(id, updateParams);

      // If price changed, create a new price (Stripe prices are immutable)
      let newPrice = null;
      if (price !== undefined) {
        newPrice = await stripe.prices.create({
          product: id,
          unit_amount: Math.round(parseFloat(price) * 100),
          currency: 'usd',
        });
        // Archive old prices
        const oldPrices = await stripe.prices.list({ product: id, active: true });
        for (const op of oldPrices.data) {
          if (op.id !== newPrice.id) {
            await stripe.prices.update(op.id, { active: false });
          }
        }
      }

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({
          product: { ...updatedProduct, newPrice },
        }),
      };
    }

    // ── DELETE: archive product ───────────────────────────────────────────────
    if (event.httpMethod === 'DELETE') {
      const body = JSON.parse(event.body || '{}');
      const { id } = body;

      if (!id) {
        return {
          statusCode: 400,
          headers: CORS,
          body: JSON.stringify({ error: 'id is required' }),
        };
      }

      const updated = await stripe.products.update(id, { active: false });

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ success: true, product: updated }),
      };
    }

    return {
      statusCode: 405,
      headers: CORS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (err) {
    console.error('admin-products error:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
