// pages/api/leads.js

import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, phone, service } = req.body;

    // --- Basic Lead Qualification Example ---
    let qualified = false;
    let reason = "";

    if (phone && phone.length >= 10) {
      qualified = true;
    } else {
      reason = "Invalid phone number.";
    }

    // Twilio setup (make sure your ENV variables are set in Vercel)
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    if (qualified) {
      await client.messages.create({
        body: `New Lead: ${name} | ${phone} | Service: ${service}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.TARGET_PHONE_NUMBER, // the number you want to receive texts at
      });
    }

    return res.status(200).json({
      success: true,
      qualified,
      reason: qualified ? "Lead qualified and sent!" : reason,
    });
  } catch (error) {
    console.error("Error in leads API:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}