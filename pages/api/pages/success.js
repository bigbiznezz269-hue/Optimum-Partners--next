// pages/success.js
export default function Success() {
  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.h1}>✅ Thank You!</h1>
        <p style={styles.p}>
          Your information has been submitted successfully.  
          One of our team members will reach out shortly.
        </p>
        <a href="/" style={styles.button}>Go Back Home</a>
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
    background: "#0f172a",
    padding: "24px",
  },
  card: {
    maxWidth: 480,
    background: "white",
    padding: "32px 24px",
    borderRadius: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  h1: { fontSize: 26, margin: "0 0 16px" },
  p: { fontSize: 16, color: "#475569", marginBottom: 24 },
  button: {
    display: "inline-block",
    padding: "12px 20px",
    borderRadius: 10,
    background: "#0ea5e9",
    color: "white",
    textDecoration: "none",
    fontWeight: 600,
  },
};