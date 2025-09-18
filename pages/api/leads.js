// Uses Twilio REST API via fetch (no npm dependency).
// Set env vars in Vercel: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, NOTIFY_TO

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, message: "Leads endpoint ready" });
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { name, phone, address, service, notes } = req.body || {};
    if (!name || !phone || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // normalize phone for E.164 (+1XXXXXXXXXX if US 10 digits)
    const digits = String(phone).replace(/[^\d]/g, "");
    if (digits.length < 10) return res.status(400).json({ error: "Invalid phone" });
    const leadPhone = digits.length === 10 ? `+1${digits}` : `+${digits}`;

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, NOTIFY_TO } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM || !NOTIFY_TO) {
      return res.status(500).json({ error: "Missing Twilio env vars" });
    }

    // Text to YOU with the lead details
    const msgBody =
      `NEW LEAD — Optimum Partners\n` +
      `Name: ${name}\n` +
      `Phone: ${leadPhone}\n` +
      `Address: ${address}\n` +
      `Service: ${service || "n/a"}\n` +
      (notes ? `Notes: ${notes}\n` : "");

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
    const params = new URLSearchParams({
      From: TWILIO_FROM,   // your Twilio number, e.g. +13058903456
      To: process.env.NOTIFY_TO, // your cell, e.g. +13058903456
      Body: msgBody,
    });

    const twilioResp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!twilioResp.ok) {
      const errText = await twilioResp.text();
      return res.status(502).json({ error: "Twilio error", detail: errText.slice(0, 300) });
    }

    // (Optional) auto-reply to the lead – uncomment to enable
    // const params2 = new URLSearchParams({
    //   From: TWILIO_FROM,
    //   To: leadPhone,
    //   Body: `Hi ${name}, thanks for contacting Optimum Partners. We received your request and will follow up shortly.`,
    // });
    // await fetch(`https://api.twilio.com/2010-04-01
