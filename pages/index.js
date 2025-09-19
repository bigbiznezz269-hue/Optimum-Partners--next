// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    service: "",
    notes: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    let leadId = "";
    try {
      const json = await res.json();
      leadId = json?.leadId || "";
    } catch {}

    const qs = new URLSearchParams({ ...form, leadId }).toString();
    router.push(`/success?${qs}`);
  };

  return (
    <main style={styles.wrap}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.h1}>Request Free Estimate</h1>
        <p style={styles.lede}>
          Fill out the form below and our team will contact you shortly.
        </p>

        <input
          style={styles.input}
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="service"
          placeholder="Service Requested"
          value={form.service}
          onChange={handleChange}
        />
        <textarea
          style={styles.textarea}
          name="notes"
          placeholder="Additional Notes"
          value={form.notes}
          onChange={handleChange}
        />

        <button type="submit" style={styles.btn}>
          Submit
        </button>
      </form>
    </main>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,

    /* CSS-only metal roof background */
    backgroundColor: "#d3d7dc",
    backgroundImage: [
      "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0) 35%)",
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, rgba(255,255,255,0.06) 1px, rgba(255,255,255,0.06) 3px)",
      "repeating-linear-gradient(90deg, #cfd4da 0px, #cfd4da 78px, #b8bec6 78px, #b8bec6 80px, #d9dde2 80px, #d9dde2 86px)"
    ].join(", "),
    backgroundBlendMode: "screen, normal, normal",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "rgba(255, 255, 255, 0.92)",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    padding: 24,
    backdropFilter: "blur(2px)",
  },
  h1: { margin: 0, fontSize: 24, fontWeight: 700 },
  lede: { margin: "8px 0 20px", color: "#555" },
  input: {
    width: "100%",
    marginBottom: 12,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 8,
  },
  textarea: {
    width: "100%",
    minHeight: 80,
    marginBottom: 12,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 8,
  },
  btn: {
    width: "100%",
    padding: 12,
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
};
