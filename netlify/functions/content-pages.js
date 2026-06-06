const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const OWNER = process.env.GITHUB_REPO_OWNER || 'captaburumman-netizen';
const REPO  = process.env.GITHUB_REPO_NAME  || 'cut-and-curated-keepsakes';
const BRANCH = 'main';

async function verifyAdmin(event) {
  const auth = (event.headers.authorization || event.headers.Authorization || '');
  if (!auth.startsWith('Bearer ')) throw new Error('Unauthorized');
  const token = auth.slice(7);
  const identityUrl = process.env.NETLIFY_IDENTITY_URL || (process.env.URL + '/.netlify/identity');
  const res = await fetch(`${identityUrl}/user`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

async function getFile(path) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha };
}

async function putFile(path, content, sha, message) {
  const body = {
    message,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  try {
    await verifyAdmin(event);
    const params = event.queryStringParameters || {};

    if (event.httpMethod === 'GET') {
      const pageId = params.page;
      if (pageId === 'global') {
        const file = await getFile('content/global.json');
        return { statusCode: 200, headers: CORS, body: JSON.stringify(file ? file.content : {}) };
      }
      if (pageId) {
        const file = await getFile(`content/pages/${pageId}.json`);
        return { statusCode: 200, headers: CORS, body: JSON.stringify(file ? file.content : null) };
      }
      // List all pages
      const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/content/pages?ref=${BRANCH}`, {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
      });
      const files = res.ok ? await res.json() : [];
      const pages = await Promise.all(files.filter(f => f.name.endsWith('.json')).map(async f => {
        const file = await getFile(`content/pages/${f.name}`);
        return file ? file.content : null;
      }));
      return { statusCode: 200, headers: CORS, body: JSON.stringify(pages.filter(Boolean)) };
    }

    if (event.httpMethod === 'POST') {
      const { pageId, content } = JSON.parse(event.body);
      const path = pageId === 'global' ? 'content/global.json' : `content/pages/${pageId}.json`;
      const existing = await getFile(path);
      await putFile(path, content, existing ? existing.sha : null, `Update ${pageId} content via admin dashboard`);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (e) {
    const status = e.message === 'Unauthorized' ? 401 : 500;
    return { statusCode: status, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
