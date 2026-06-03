/**
 * admin-analytics.js — Plausible Analytics stats
 * Method: GET
 */

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

  const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY;
  const PLAUSIBLE_SITE_ID = process.env.PLAUSIBLE_SITE_ID;

  // Return placeholder data if not configured
  if (!PLAUSIBLE_API_KEY || !PLAUSIBLE_SITE_ID) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        configured: false,
        message: 'Plausible not configured. Set PLAUSIBLE_API_KEY and PLAUSIBLE_SITE_ID env vars.',
        visitorsToday: 0,
        visitorsThisWeek: 0,
        visitorsThisMonth: 0,
        topPages: [],
      }),
    };
  }

  try {
    const baseUrl = 'https://plausible.io/api/v1/stats';
    const headers = { Authorization: `Bearer ${PLAUSIBLE_API_KEY}` };

    const [todayRes, weekRes, monthRes, pagesRes] = await Promise.all([
      fetch(
        `${baseUrl}/aggregate?site_id=${PLAUSIBLE_SITE_ID}&period=day&metrics=visitors`,
        { headers }
      ),
      fetch(
        `${baseUrl}/aggregate?site_id=${PLAUSIBLE_SITE_ID}&period=7d&metrics=visitors`,
        { headers }
      ),
      fetch(
        `${baseUrl}/aggregate?site_id=${PLAUSIBLE_SITE_ID}&period=month&metrics=visitors`,
        { headers }
      ),
      fetch(
        `${baseUrl}/breakdown?site_id=${PLAUSIBLE_SITE_ID}&period=month&property=event:page&metrics=visitors&limit=10`,
        { headers }
      ),
    ]);

    if (!todayRes.ok || !weekRes.ok || !monthRes.ok) {
      const errText = await todayRes.text();
      throw new Error(`Plausible API error: ${errText}`);
    }

    const [todayData, weekData, monthData, pagesData] = await Promise.all([
      todayRes.json(),
      weekRes.json(),
      monthRes.json(),
      pagesRes.json(),
    ]);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        configured: true,
        visitorsToday: todayData.results?.visitors?.value || 0,
        visitorsThisWeek: weekData.results?.visitors?.value || 0,
        visitorsThisMonth: monthData.results?.visitors?.value || 0,
        topPages: (pagesData.results || []).map((p) => ({
          page: p.page,
          visitors: p.visitors,
        })),
      }),
    };
  } catch (err) {
    console.error('admin-analytics error:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message, configured: true }),
    };
  }
};
