export default function Home() {
  return (
    <main style={{padding: 40, fontFamily: "system-ui"}}>
      <h1>Optimum Partners</h1>
      <p>Enter your info below for a free roofing consultation.</p>

      <form
        action="/api/leads"
        method="POST"
        style={{display: "grid", gap: 12, maxWidth: 400}}
      >
        <input
          name="name"
          placeholder="Full Name"
          required
          style={{padding: 10, border: "1px solid #ddd", borderRadius: 8}}
        />
        <input
          name="phone"
          placeholder="Phone Number"
          required
          style={{padding: 10, border: "1px solid #ddd", borderRadius: 8}}
        />
        <input
          name="zip"
          placeholder="ZIP Code"
          required
          style={{padding: 10, border: "1px solid #ddd", borderRadius: 8}}
        />
        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #222",
            background: "#222",
            color: "white",
            cursor: "pointer"
          }}
        >
          Submit Lead
        </button>
      </form>
    </main>
  );
}