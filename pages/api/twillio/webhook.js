// pages/api/twilio/webhook.js

// Let Twilio POST form-encoded data; we'll parse it ourselves.
export const config = { api: { bodyParser: false } };

async function parseForm(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return Object.fromEntries(new URLSearchParams(raw));
}

// Simple rule-based script (add more rules as needed)
const SCRIPT = [
  { test: /hello|hi|hey/i, reply: "Hi! This is Optimum Partners — how can we help with your project today?" },
  { test: /roof|leak|repair/i, reply: "We can schedule a roof inspection. What's your address and preferred time?" },
  { test: /estimate|price|quote/i, reply: "We provide free estimates. Please send your address + scope and we’ll book you in." },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Use POST' });
    return;
  }

  const params = await parseForm(req);
  const body = (params.Body || '').toString();

  const match = SCRIPT.find(r => r.test.test(body));
  const message = match
    ? match.reply
    : "Thanks for messaging Optimum Partners. Please send your address + service needed and we’ll reply ASAP.";

  // Minimal TwiML without twilio SDK
  const twiml =
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
