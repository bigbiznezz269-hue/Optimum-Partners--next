// pages/index.js
import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({ name: "", phone: "", service: "" });
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const normalizePhone = (raw) => raw.replace(/\D/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, ok: null, msg: "" });

    // Basic client-side checks to reduce failed requests
    const phoneDigits = normalizePhone(form.phone);
    if (!form.name.trim()) {
      return setStatus({ loading: false, ok: false, msg: "Name is required." });
    }
    if (phoneDigits.length < 10) {
      return setStatus({
        loading: false,
        ok: false,
        msg: "Enter a valid 10+ digit phone number.",
      });
    }
    if (!form.service.trim()) {
      return setStatus({
        loading: false,
        ok: false,
        msg: "Please choose a service.",
      });
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: phoneDigits,
          service: form.service.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data?.success !== true) {
        throw new Error(data?.error || data?.reason || "Request failed");
      }

      setStatus({ loading: false, ok: true, msg: "✅ Lead sent successfully!" });
      setForm({ name: "", phone: "", service: "" });
    } catch (err) {
      setStatus({
        loading: false,
        ok: false,
        msg: `❌ ${err.message || "Something went wrong"}`,
      });
    }
  };

  // Simple, touch-friendly styles
  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Optimum Partners — Lead Capture</h1>
        <p style={styles.p}>
          Enter lead info below. Qualified leads are texted to your designated number via Twilio.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Full Name
            <input
              style={styles.input}
              name="name"
              value={form.name}
              onChange={update}
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
          </label>

          <label style={styles.label}>
            Phone
            <input
              style={styles.input}
              name="phone"
              value={form.phone}
              onChange={update}
              placeholder="(305) 555-1234"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </label>

          <label style={styles.label}>
            Service
            <select
              style={styles.input}
              name="service"
              value={form.service}
              onChange={update}
              required
            >
              <option value="">Select a service…</option>
              <option>Roof Replacement</option>
              <option>Roof Repair</option>
              <option>Inspection</option>
              <option>Drywall / Interior</option>
              <option>Flooring</option>
              <option>Other</option>
            </select>
          </label>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: status.loading ? 0.7 : 1,
              pointerEvents: status.loading ? "none" : "auto",
            }}
          >
            {status.loading ? "Sending…" : "Submit Lead"}
          </button>

          {status.msg ? (
            <div
              style={{
                ...styles.alert,
                background: status.ok ? "#e8f5e9" : "#ffebee",
                borderColor: status.ok ? "#a5d6a7" : "#ef9a9a",
              }}
            >
              {status.msg}
            </div>
          ) : null}
        </form>

        <div style={styles.footerNote}>
          <small>
            Make sure your Vercel env vars are set: <code>TWILIO_ACCOUNT_SID</code>,{" "}
            <code>TWILIO_AUTH_TOKEN</code>, <code>TWILIO_PHONE_NUMBER</code>,{" "}
            <code>TARGET_PHONE_NUMBER</code>.
          </small>
        </div>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "#0f172a",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  h1: { margin: 0, marginBottom: 8, fontSize: 22 },
  p: { marginTop: 0, color: "#475569" },
  form: { display: "grid", gap: 12, marginTop: 12 },
  label: { fontSize: 14, color: "#334155", display: "grid", gap: 6 },
  input: {
    height: 44,
    padding: "0 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 16,
  },
  button: {
    height: 48,
    border: "none",
    borderRadius: 12,
    background: "#0ea5e9",
    color: "white",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
  },
  alert: {
    marginTop: 8,
    border: "1px solid",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
  },
  footerNote: { marginTop: 10, color: "#64748b" },
};