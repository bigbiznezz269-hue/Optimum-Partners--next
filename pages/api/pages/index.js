export default function Home() {
  return (
    <main style={{padding: 40, fontFamily: "system-ui"}}>
      <h1>Optimum Partners</h1>
      <p>Enter your info below for a free roofing consultation.</p>

      <form action="/api/leads" method="POST" style={{display: "grid", gap: 12, maxWidth: 400}}>
        <input name="name" placeholder="Full Name" required />
        <input name="phone" placeholder="Phone Number" required />
        <input name="zip" placeholder="ZIP Code" required />
        <button type="submit">Submit Lead</button>
      </form>
    </main>
  );
}