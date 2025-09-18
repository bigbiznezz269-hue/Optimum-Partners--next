
    // pages/api/leads.js
// Next.js API route: validates + qualifies lead, then (optionally) texts you via Twilio.
// Works even if Twilio env vars are missing (it will just skip SMS and return ok).

const crypto = require("crypto");

function enableCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

function digitsOnly(s = "") {
  return (s + "").replace(/\D/g, "");
}

function isValidUSPhone(phone) {
  const d = digitsOnly(phone);
  if (d.length === 11 && d.startsWith("1")) return true;
  return d.length === 10;
}

function normalizeUSPhone(phone) {
  const d = digitsOnly(phone);
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  if (d.length === 10) return `+1${d}`;
  return null;
}

function isValidZip(zip) {
  if (!zip) return true; // optional
  return /^\d{5}$/.test(String(zip));
}

function qualifiesLead({ phone, zip, service }) {
  // Configurable via env (comma-separated)
  const zipPrefixesEnv = process.env.QUALIFY_ZIP_PREFIXES || ""; // e.g. "330,331,333,342"
  const allowedPrefixes = zipPrefixesEnv
    .split(",")
    .map((z) => z.trim())
    .filter(Boolean);

  const allowedServicesEnv =
    process.env.QUALIFY_SERVICES ||
    "roofing,drywall,flooring,windows,doors,gutters,inspection,estimate";
  const allowedServices = allowedServicesEnv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const minScore = Number(process.env.QUALIFY_MIN_SCORE || 2);

  let score = 0;
  const reasons = [];

  // Rule 1: Valid US phone
  if (isValidUSPhone(phone)) {
    score += 1;
  } else {
    reasons.push("Invalid phone");
  }

  // Rule 2: ZIP prefix match (optional)
  if (isValidZip(zip)) {
    if (zip && allowedPrefixes.length > 0) {
      const match = allowedPrefixes.some((p) => String(zip).startsWith(p));
      if (match) score += 1;
      else reasons.push("ZIP outside target area");
    } else {
      // No filter configured or no zip supplied — neutral
      score += 1;
    }
  } else {
    reasons.push("Invalid ZIP format");
  }

  // Rule 3: Service type (optional)
  if (!service) {
    // No service given — neutral (still allow if other rules pass)
    score += 0;
  } else {
    const svc = String(service).toLowerCase().trim();
    if (allowedServices.includes(svc)) score += 1;
    else reasons.push("Service not in focus list");
  }

  const qualified = score >= minScore;
  return { qualified, score, reasons };
}

function hasTwilioEnv() {
  return (
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_FROM &&
    !!process.env.TWILIO_TO
  );
}

async function sendTwilioSms({ body }) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, TWILIO_TO } =
    process.env;

  const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return twilio.messages.create({
    from: TWILIO_FROM,
    to: TWILIO_TO,
    body,
  });
}

export default async function handler(req, res) {
  try {
    if (enableCors(req, res)) return;

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const id =
      crypto.randomUUID?.() ||
      Math.random().toString(36).slice(2) + Date.now().toString(36);

    const {
      name = "",
      phone = "",
      email = "",
      service = "",
      zip = "",
      source = "",
      message = "",
    } = req.body || {};

    // Basic requireds
    if (!name || !phone) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields (name, phone)" });
    }

    if (!isValidZip(zip)) {
      return res.status(400).json({ ok: false, error: "Invalid zip format" });
    }

    const normalizedPhone = normalizeUSPhone(phone);
    const { qualified, score, reasons } = qualifiesLead({
      phone,
      zip,
      service,
    });

    // Build a compact text summary
    const summaryLines = [
      `New Lead ${qualified ? "(QUALIFIED)" : "(REVIEW)"} #${id}`,
      `Name: ${name}`,
      `Phone: ${normalizedPhone || phone}`,
      email ? `Email: ${email}` : null,
      service ? `Service: ${service}` : null,
      zip ? `ZIP: ${zip}` : null,
      source ? `Source: ${source}` : null,
      message ? `Msg: ${String(message).slice(0, 240)}` : null,
      `Score: ${score}` + (reasons.length ? ` | Reasons: ${reasons.join(", ")}` : ""),
    ]
      .filter(Boolean)
      .join("\n");

    // Only text qualified leads
    let sms = null;
    if (qualified && hasTwilioEnv()) {
      try {
        sms = await sendTwilioSms({ body: summaryLines });
      } catch (e) {
        console.error("Twilio SMS failed:", e?.message || e);
      }
    }

    // Respond to caller
    return res.status(200).json({
      ok: true,
      id,
      qualified,
      score,
      reasons,
      normalizedPhone,
      sms: sms ? { sid: sms.sid, status: sms.status } : null,
      notice: hasTwilioEnv()
        ? undefined
        : "Twilio env vars not set — skipped SMS.",
    });
  } catch (err) {
    console.error("Lead API error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}