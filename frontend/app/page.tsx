"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    // Call our FastAPI backend when the page loads
    fetch("http://localhost:8000/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("cannot reach backend"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Onboarding Co-Pilot
      </h1>
      <p className="text-gray-500 mb-2">Backend status:</p>
      <span
        className={`text-lg font-semibold ${status === "ok" ? "text-green-500" : "text-red-500"}`}
      >
        {status}
      </span>
    </main>
  );
}
