const crypto = require('crypto');
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
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ configured: false }) };
    }
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'cut-and-curated';
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ cloudName, apiKey, timestamp, signature, folder, configured: true }) };
  } catch(e) {
    const status = e.message === 'Unauthorized' ? 401 : 500;
    return { statusCode: status, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
