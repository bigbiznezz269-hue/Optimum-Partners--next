// pages/success.js
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
  textAlign: "center",
};

export default function Success() {
  return (
    <div style={shell}>
      <main style={card}>
        <h1 style={{ marginTop: 0 }}>Request Received ✅</h1>
        <p>
          Thanks for contacting us! We’ll reach out shortly to confirm details
          and schedule your free estimate.
        </p>
        <a href="/" style={{ display: "inline-block", marginTop: 16, textDecoration: "underline" }}>
          Go back
        </a>
      </main>
    </div>
  );
}