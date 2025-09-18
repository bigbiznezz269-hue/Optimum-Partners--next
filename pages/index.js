import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("Sending…");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setStatus("✅ Got it! We’ll text you shortly.");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("❌ " + err.message);
    }
  }

  return (
    <main style={{maxWidth:520,margin:"24px auto",padding:16,fontFamily:"system-ui,Segoe UI,Roboto,sans-serif"}}>
      <h1 style={{fontSize:28,marginBottom:8}}>Optimum Partners</h1>
      <p style={{color:"#444",m
