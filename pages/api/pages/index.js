import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [service, setService] = useState("");
  const [roofAge, setRoofAge] = useState("");
  const [damage, setDamage] = useState("");
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          service,
          roofAge,
          damage,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setPhone("");
        setAddress("");
        setService("");
        setRoofAge("");
        setDamage("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Request a Free Estimate
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="tel"
            placeholder="Phone (e.g. +1305XXXXXXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Address (Street, City, ZIP)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Service Needed (e.g. Roof Replacement)"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Age of Roof (years)"
            value={roofAge}
            onChange={(e) => setRoofAge(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Damage (e.g. Hurricane, Wind, Leaks)"
            value={damage}
            onChange={(e) => setDamage(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full p-2 rounded bg-black text-white hover:bg-gray-800 transition"
          >
            Request Free Estimate
          </button>
        </form>

        {status === "success" && (
          <p className="mt-4 text-green-600 text-center">
            ✅ Thank you! Your request has been submitted.
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-red-600 text-center">
            ❌ Something went wrong. Please try again.
          </p>
        )}
        {status === "submitting" && (
          <p className="mt-4 text-gray-500 text-center">Submitting...</p>
        )}
      </div>
    </div>
  );
}