const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const CORS = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json' };

async function verifyAdmin(event) {
  const auth = (event.headers.authorization || event.headers.Authorization || '');
  if (!auth.startsWith('Bearer ')) throw new Error('Unauthorized');
  const token = auth.slice(7);
  const identityUrl = process.env.NETLIFY_IDENTITY_URL || (process.env.URL + '/.netlify/identity');
  const res = await fetch(`${identityUrl}/user`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  try {
    await verifyAdmin(event);
    const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
    if (!hookUrl) return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, note: 'No build hook configured — deploy triggered via GitHub push' }) };
    const res = await fetch(hookUrl, { method: 'POST' });
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, status: res.status }) };
  } catch(e) {
    const status = e.message === 'Unauthorized' ? 401 : 500;
    return { statusCode: status, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
