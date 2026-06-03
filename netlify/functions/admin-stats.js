/**
 * admin-stats.js — Sales statistics from Stripe
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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Fetch all paid checkout sessions (last 100)
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.line_items'],
    });

    const paidSessions = sessions.data.filter(
      (s) => s.payment_status === 'paid'
    );

    // All-time totals
    const totalRevenue = paidSessions.reduce(
      (sum, s) => sum + (s.amount_total || 0),
      0
    );
    const totalOrders = paidSessions.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // This month
    const thisMonthSessions = paidSessions.filter(
      (s) => s.created * 1000 >= startOfMonth.getTime()
    );
    const thisMonthRevenue = thisMonthSessions.reduce(
      (sum, s) => sum + (s.amount_total || 0),
      0
    );

    // Last month
    const lastMonthSessions = paidSessions.filter(
      (s) =>
        s.created * 1000 >= startOfLastMonth.getTime() &&
        s.created * 1000 <= endOfLastMonth.getTime()
    );
    const lastMonthRevenue = lastMonthSessions.reduce(
      (sum, s) => sum + (s.amount_total || 0),
      0
    );

    // Revenue by month (last 6 months)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const label = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const revenue = paidSessions
        .filter(
          (s) =>
            s.created * 1000 >= monthStart.getTime() &&
            s.created * 1000 <= monthEnd.getTime()
        )
        .reduce((sum, s) => sum + (s.amount_total || 0), 0);
      revenueByMonth.push({ label, revenue, display: `$${(revenue / 100).toFixed(2)}` });
    }

    // Best-selling products (aggregate line items)
    const productSales = {};
    for (const session of paidSessions) {
      const lineItems = session.line_items?.data || [];
      for (const item of lineItems) {
        const name = item.description || 'Unknown';
        if (!productSales[name]) {
          productSales[name] = { name, revenue: 0, quantity: 0 };
        }
        productSales[name].revenue += item.amount_total || 0;
        productSales[name].quantity += item.quantity || 1;
      }
    }

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({
        ...p,
        revenueDisplay: `$${(p.revenue / 100).toFixed(2)}`,
      }));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        totalRevenue,
        totalRevenueDisplay: `$${(totalRevenue / 100).toFixed(2)}`,
        totalOrders,
        avgOrderValue,
        avgOrderValueDisplay: `$${(avgOrderValue / 100).toFixed(2)}`,
        thisMonthRevenue,
        thisMonthRevenueDisplay: `$${(thisMonthRevenue / 100).toFixed(2)}`,
        lastMonthRevenue,
        lastMonthRevenueDisplay: `$${(lastMonthRevenue / 100).toFixed(2)}`,
        revenueByMonth,
        bestSellers,
      }),
    };
  } catch (err) {
    console.error('admin-stats error:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
