// pages/api/leads.js

import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accountSid = process.env.ACCSID;
  const authToken = process.env.ACCTOKEN;
  const phone = process.env.PHONENUMBER;

  const client = twilio(accountSid, authToken);

  try {
    // Expecting { to: "+1XXXXXXXXXX", body: "Message text" } in the request
    const { to, body } = req.body;

    if (!to || !body) {
      return res.status(400).json({ error: "Missing 'to' or 'body' in request" });
    }

    const message = await client.messages.create({
      body,
      from: phone, // Your Twilio number from env vars
      to,
    });

    return res.status(200).json({ success: true, sid: message.sid });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
