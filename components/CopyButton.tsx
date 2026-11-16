"use client";
import { useState } from "react";

export default function CopyButton({ text, label = "Kopiér link" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn ghost sm"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {} }}>
      {done ? "Kopieret" : label}
    </button>
  );
}
