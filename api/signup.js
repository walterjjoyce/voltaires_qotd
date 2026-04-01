const BASEROW_API_TOKEN = process.env.BASEROW_API_TOKEN;
const BASEROW_BASE_URL = process.env.BASEROW_BASE_URL || 'https://api.baserow.io';
const TABLE_ID = process.env.BASEROW_QOTD_CONTACTS_TABLE_ID || '889330';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  if (!BASEROW_API_TOKEN) {
    return json(res, 500, { error: 'Server misconfigured: missing Baserow token' });
  }

  try {
    const { first, last, email } = req.body || {};

    if (!first || !last || !email) {
      return json(res, 400, { error: 'First name, last name, and email are required' });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const firstNorm = String(first).trim();
    const lastNorm = String(last).trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm);
    if (!emailOk) return json(res, 400, { error: 'Please enter a valid email address' });

    const endpoint = `${BASEROW_BASE_URL}/api/database/rows/table/${TABLE_ID}/?user_field_names=true`;
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BASEROW_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        First: firstNorm,
        Last: lastNorm,
        Email: emailNorm
      })
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return json(res, upstream.status, {
        error: data.detail || data.error || 'Signup failed'
      });
    }

    return json(res, 200, { ok: true, id: data.id || null });
  } catch (err) {
    return json(res, 500, { error: err.message || 'Unexpected server error' });
  }
};
