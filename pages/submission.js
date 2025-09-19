// pages/submission.js
import { useState } from "react";

const shell = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  backgroundImage: "url(/metal-roof.jpg)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const card = {
  width: "100%",
  maxWidth: 720,
  background: "rgba(255,255,255,0.96)",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  padding: 24,
};

const grid = { display: "grid", gap: 12, marginTop: 12 };

export default function Submission() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      window.location.href = "/success";
    } catch (error) {
      setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={shell}>
      <main style={card}>
        <h1 style={{ margin: 0 }}>Request a Free Estimate</h1>
        <p style={{ marginTop: 8 }}>
          Tell us a bit about your project and we’ll reach out shortly.
        </p>

        <form onSubmit={onSubmit} style={grid}>
          <input name="name" placeholder="Full name" value={form.name} onChange={onChange} required />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} required />
          <input name="email" type="email" placeholder="Email (optional)" value={form.email} onChange={onChange} />
          <input name="address" placeholder="Property address" value={form.address} onChange={onChange} required />
          <textarea
            name="message"
            placeholder="Brief description (roof type, issues, timeline)"
            value={form.message}
            onChange={onChange}
            rows={4}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Inquiry"}
          </button>
          {err && <p style={{ color: "red" }}>{err}</p>}
        </form>
      </main>
    </div>
  );
}