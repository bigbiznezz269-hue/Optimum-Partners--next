// pages/api/leads.js
export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "Leads API is live" });
  }

  if (req.method === "POST") {
    // Accept form submits (req.body) and query-string tests (req.query)
    const src = req.body && Object.keys(req.body).length ? req.body : req.query;
    const {
      name = "",
      phone = "",
      zip = "",
      __hp = "" // honeypot; real users don't fill this
    } = src || {};

    // Anti-spam: if bot filled the hidden field, silently succeed
    if (__hp) return res.redirect(302, "/success");

    // Basic validation
    const cleanPhone = String(phone).replace(/\D/g, "");
    const zipStr = String(zip).trim();
    const validZip = /^\d{5}(-\d{4})?$/.test(zipStr);
    const valid =
      String(name).trim().length >= 2 &&
      cleanPhone.length >= 10 &&
      validZip;

    // Example qualifier: Miami-Dade + Broward prefixes (33xxx & 330xx/331xx etc.)
    const qualified = valid && /^33\d{3}/.test(zipStr.replace("-", ""));

    // Log for debugging (Vercel → Deployments → View Functions Logs)
    console.log("Lead:", { name, phone: cleanPhone, zip: zipStr, qualified, valid });

    // Try SMS if Twilio is configured
    try {
      const {
        TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN,
        TWILIO_FROM_NUMBER,
        LEAD_NOTIFY_TO
      } = process.env;

      const twilioReady =
        TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER && LEAD_NOTIFY_TO;

      if (twilioReady) {
        // Lazy import so app runs even if package isn’t installed locally
        const twilio = (await import("twilio")).default;
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        const msg = [
          "New Roofing Lead",
          `Name: ${name}`,
          `Phone: ${formatE164(cleanPhone, TWILIO_FROM_NUMBER) || cleanPhone}`,
          `ZIP: ${zipStr}`,
          `Qualified: ${qualified ? "YES" : "NO"}`
        ].join(" | ");

        await client.messages.create({
          body: msg,
          from: TWILIO_FROM_NUMBER,
          to: LEAD_NOTIFY_TO
        });
      }
    } catch (e) {
      console.error("Twilio error:", e?.message || e);
      // Do not block user—still show success page
    }

    // Always show thank-you page to the user
    return res.redirect(302, "/success");
  }

  return res.status(405).json({ error: "Method not allowed" });
}

/**
 * Best-effort E.164 formatting using the country code from the FROM number.
 * If formatting isn’t possible, returns empty string and caller can fall back.
 */
function formatE164(digits, fromNumber) {
  try {
    // Extract country code from FROM (e.g., +1…… → "1")
    const cc = (fromNumber || "").toString().replace(/[^\d]/g, "").slice(0, 1) || "1";
    const local = digits.replace(/[^\d]/g, "");
    if (!local) return "";
    if (local.startsWith(cc)) return `+${local}`;
    if (cc === "1" && local.length === 10) return `+1${local}`;
    return `+${cc}${local}`;
  } catch {
    return "";
  }
}