"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function GeneralPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [mobileLegendsEnabled, setMobileLegendsEnabled] = useState(true);
  const [magicChessEnabled, setMagicChessEnabled] = useState(true);
  const [mlGiftingEnabled, setMlGiftingEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "settings", "general"));
      if (!snap.exists()) return;

      const data = snap.data();

      setMaintenance(!!data.maintenance);
      setMobileLegendsEnabled(data.mobileLegendsEnabled !== false);
      setMagicChessEnabled(data.magicChessEnabled !== false);
      setMlGiftingEnabled(data.mlGiftingEnabled !== false);
    }

    load();
  }, []);

  async function save() {
    try {
      setSaving(true);

      await setDoc(
        doc(db, "settings", "general"),
        {
          maintenance,
          mobileLegendsEnabled,
          magicChessEnabled,
          mlGiftingEnabled,
        },
        { merge: true }
      );

      alert("Saved");
    } catch (error) {
      console.error(error);
      alert("Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  const games = [
    {
      name: "Mobile Legends",
      enabled: mobileLegendsEnabled,
      setEnabled: setMobileLegendsEnabled,
    },
    {
      name: "Magic Chess",
      enabled: magicChessEnabled,
      setEnabled: setMagicChessEnabled,
    },
    {
      name: "ML Gifting",
      enabled: mlGiftingEnabled,
      setEnabled: setMlGiftingEnabled,
    },
  ];

  return (
    <main className="min-h-screen bg-[#07090e] p-4 text-white">
      <div className="mx-auto max-w-md">
        <Link
          href="/super-admin"
          className="font-bold text-red-500"
        >
          ← Back
        </Link>

        <h1 className="mt-4 text-4xl font-black">General</h1>

        <div className="mt-6 space-y-4">
          <label className="flex items-center justify-between rounded-xl bg-[#141821] p-4">
            <span>Maintenance Mode</span>

            <input
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
            />
          </label>

          <div className="rounded-xl bg-[#141821] p-4">
            <h2 className="font-bold">Game Availability</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Disabled games remain visible as Out of Stock.
            </p>

            <div className="mt-4 space-y-4">
              {games.map((game) => (
                <label
                  key={game.name}
                  className="flex items-center justify-between"
                >
                  <span>{game.name}</span>

                  <input
                    type="checkbox"
                    checked={game.enabled}
                    onChange={(e) => game.setEnabled(e.target.checked)}
                  />
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-xl bg-red-600 p-4 font-bold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </main>
  );
}
