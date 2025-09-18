// pages/api/lead.js
// Lead intake + qualification + optional Twilio SMS alert
// Works on Vercel / Next.js (Pages Router)

import { NextApiRequest, NextApiResponse } from "next";

// Lazy import so local dev doesn't require twilio unless used
let twilioClient = null;
function getTwilio() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  // eslint-disable-next-line global-require
  const twilio = require("twilio");
  twilioClient = twilio(sid, token);
  return twilioClient;
}

// ---- CONFIG ----
const SERVICE_WHITELIST = [
  "roof repair",
  "roof replacement",
  "leak repair",
  "inspection",
  "gutters",
  "insurance claim"
];

const TARGET_ZIPS_HINT = [
  // Add more if you like; these are examples covering Miami-Dade, Broward, Sarasota areas
  "331", // Miami-Dade prefixes (e.g., 331xx)
  "330", // Broward/Miami-Dade prefixes (e.g., 330xx)
  "342"  // Sarasota/Manatee prefixes (e.g., 342xx)
];

const MIN_BUDGET = 500;         // $ — adjust for your business
const ASAP_WINDOW_DAYS = 30;    // If timeframe in days <= this, extra points
const MIN_SCORE_FOR_ALERT = 60; // Score threshold to trigger SMS
const MAX_MSG_LEN = 1500;       // Safety

// ---- QUALIFICATION ----
function normalizePhone(phone = "") {
  return (phone || "").replace(/\D+/g, "");
}

function zipLooksLocal(zip = "") {
  const clean = (zip || "").trim();
  if (!clean) return false;
  return TARGET_ZIPS_HINT.some(prefix => clean.startsWith(prefix));
}

function scoreLead(lead) {
  // Basic fields
  const {
    name = "",
    phone = "",
    service = "",
    zip = "",
    roofType = "",
    insurance = "",
    budget,
    timeframeDays,
    address = "",
    notes = "",
    source = ""
  } = lead;

  let score = 0;
  const reasons = [];

  // Phone validity
  const digits = normalizePhone(phone);
  if (digits.length >= 10 && digits.length <= 11) {
    score += 25;
    reasons.push("Valid phone ✅");
  } else {
    reasons.push("Invalid/short phone ❌");
  }

  // Service match
  if (service && SERVICE_WHITELIST.includes(String(service).toLowerCase())) {
    score += 20;
    reasons.push(`Service match (${service}) ✅`);
  } else if (service) {
    score += 5; // still something we do? give small points
    reasons.push(`Service unlisted (${service}) ⚠️`);
  } else {
    reasons.push("No service selected ❌");
  }

  // Geography
  if (zipLooksLocal(String(zip))) {
    score += 15;
    reasons.push(`Local zip (${zip}) ✅`);
  } else if (zip) {
    score += 5;
    reasons.push(`Non-target zip (${zip}) ⚠️`);
  } else {
    reasons.push("Missing zip ❌");
  }

  // Timeframe
  const days = Number(timeframeDays);
  if (!Number.isNaN(days)) {
    if (days <= ASAP_WINDOW_DAYS) {
      score += 15;
      reasons.push(`ASAP timeframe (${days}d) ✅`);
    } else {
      score += 5;
      reasons.push(`Later timeframe (${days}d) ⚠️`);
    }
  } else {
    reasons.push("Unknown timeframe ⚠️");
  }

  // Budget
  const b = Number(budget);
  if (!Number.isNaN(b)) {
    if (b >= MIN_BUDGET) {
      score += 10;
      reasons.push(`Budget OK ($${b}) ✅`);
    } else {
      reasons.push(`Low budget ($${b}) ⚠️`);
    }
  } else {
    reasons.push("No budget given ⚠️");
  }

  // Insurance (some jobs are insurance-driven = higher close rates for many shops)
  if (typeof insurance !== "undefined" && insurance !== null) {
    const yes = String(insurance).toLowerCase() === "yes" || insurance === true;
    if (yes) {
      score += 10;
      reasons.push("Insurance claim ✅");
    } else {
      reasons.push("No insurance claim ⚠️");
    }
  }

  // Small nudge if address present
  if ((address || "").trim()) {
    score += 5;
    reasons.push("Provided address ✅");
  }

  // Tier
  let tier = "C";
  if (score >= 80) tier = "A";
  else if (score >= 60) tier = "B";

  return { score, tier, reasons };
}

function formatAlert(lead, qual) {
  const {
    name = "",
    phone = "",
    service = "",
    zip = "",
    roofType = "",
    insurance = "",
    budget = "",
    timeframeDays = "",
    address = "",
    notes = "",
    source = ""
  } = lead;

  const lines = [
    "🔔 New Lead (Qualified)",
    `Tier: ${qual.tier} | Score: ${qual.score}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Service: ${service}`,
    `Zip: ${zip}`,
    roofType ? `Roof: ${roofType}` : null,
    insurance !== "" ? `Insurance: ${insurance}` : null,
    budget !== "" ? `Budget: $${budget}` : null,
    timeframeDays !== "" ? `Timeframe: ${timeframeDays} days` : null,
    address ? `Address: ${address}` : null,
    source ? `Source: ${source}` : null,
    notes ? `Notes: ${notes}` : null,
    "",
    `Reasons: ${qual.reasons.join(" | ")}`
  ].filter(Boolean);

  let msg = lines.join("\n");
  if (msg.length > MAX_MSG_LEN) msg = msg.slice(0, MAX_MSG_LEN - 3) + "...";
  return msg;
}

// ---- HANDLER ----
export default async function handler(req, res) {
  // CORS for simple frontends
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const lead = req.body && typeof req.body === "object" ? req.body : {};

    // Basic sanitization
    lead.phone = normalizePhone(lead.phone);

    const qual = scoreLead(lead);

    // Always return the score to the client
    const payload = {
      ok: true,
      qualification: qual,
      lead
    };

    // Optional Twilio alert
    const twilioFrom = process.env.TWILIO_FROM_NUMBER;
    const alertTo = process.env.ALERT_TO_NUMBER; // your cell
    const notifyAll = String(process.env.NOTIFY_ALL_LEADS || "").toLowerCase() === "true";

    const shouldText = (qual.score >= MIN_SCORE_FOR_ALERT) || notifyAll;

    if (getTwilio() && twilioFrom && alertTo && shouldText) {
      const body = formatAlert(lead, qual);
      try {
        await twilioClient.messages.create({
          from: twilioFrom,
          to: alertTo,
          body
        });
        payload.sms = { sent: true };
      } catch (e) {
        payload.sms = { sent: false, error: "Twilio send failed", detail: e?.message || String(e) };
      }
    } else {
      payload.sms = { sent: false, reason: "Twilio not configured or below threshold" };
    }

    // CORS header for browser calls
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Server error" });
  }
}
