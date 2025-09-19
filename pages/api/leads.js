export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "Leads API is live" });
  }

  if (req.method === "POST") {
    const { name = "", phone = "", zip = "" } = req.body || req.query;

    // Simple qualification: Miami ZIPs start with "33"
    const qualified = zip && String(zip).startsWith("33");

    // Log to Vercel console
    console.log("Lead submitted:", { name, phone, zip, qualified });

    // Redirect to thank-you page
    return res.redirect(302, "/success");
  }

  return res.status(405).json({ error: "Method not allowed" });
}