"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WhatsAppPage() {
  const [number, setNumber] = useState("");
  const [channel, setChannel] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "settings", "whatsapp"));

      if (!snap.exists()) return;

      const data = snap.data();
      setNumber(data.number || "");
      setChannel(data.channel || "");
      setMessage(data.message || "");
    }

    load();
  }, []);

  async function save() {
    setSaving(true);

    await setDoc(doc(db, "settings", "whatsapp"), {
      number,
      channel,
      message,
    });

    setSaving(false);
    alert("Saved");
  }

  return (
    <main className="min-h-screen bg-[#07090e] p-4 text-white">
      <div className="mx-auto max-w-md">

        <Link href="/super-admin" className="font-bold text-red-500">
          ← Back
        </Link>

        <h1 className="mt-4 text-4xl font-black">
          WhatsApp
        </h1>

        <div className="mt-6 space-y-4">

          <input
            value={number}
            onChange={(e)=>setNumber(e.target.value)}
            placeholder="WhatsApp Number"
            className="w-full rounded-xl bg-[#141821] p-4 outline-none"
          />

          <input
            value={channel}
            onChange={(e)=>setChannel(e.target.value)}
            placeholder="WhatsApp Channel Link"
            className="w-full rounded-xl bg-[#141821] p-4 outline-none"
          />

          <textarea
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            placeholder="Default WhatsApp Message"
            rows={5}
            className="w-full rounded-xl bg-[#141821] p-4 outline-none resize-none"
          />

          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-xl bg-red-600 p-4 font-bold"
          >
            {saving ? "Saving..." : "Save"}
          </button>

        </div>

      </div>
    </main>
  );
}
