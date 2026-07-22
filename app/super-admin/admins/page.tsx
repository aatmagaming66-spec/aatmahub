"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Admin = {
  id: string;
  email: string;
  active: boolean;
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadAdmins() {
    try {
      const snapshot = await getDocs(collection(db, "admins"));

      setAdmins(
        snapshot.docs.map((item) => ({
          id: item.id,
          email: item.data().email || item.id,
          active: item.data().active !== false,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function addAdmin() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) return;

    setSaving(true);

    await setDoc(doc(db, "admins", cleanEmail), {
      email: cleanEmail,
      active: true,
    });

    setEmail("");
    await loadAdmins();
    setSaving(false);
  }

  async function removeAdmin(id: string) {
    const confirmed = confirm("Remove this admin?");
    if (!confirmed) return;

    await deleteDoc(doc(db, "admins", id));
    await loadAdmins();
  }

  async function toggleAdmin(admin: Admin) {
    await setDoc(
      doc(db, "admins", admin.id),
      {
        email: admin.email,
        active: !admin.active,
      },
      { merge: true }
    );

    await loadAdmins();
  }

  return (
    <main className="min-h-screen bg-[#07090e] px-4 pb-28 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/super-admin" className="font-bold text-red-500">
          ← Back
        </Link>

        <h1 className="mt-4 text-4xl font-black">Admins</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Manage Super Admin access.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#11141c] p-4">
          <label className="text-sm font-bold text-zinc-300">
            Admin Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#181c25] p-4 outline-none focus:border-red-500"
          />

          <button
            type="button"
            onClick={addAdmin}
            disabled={saving || !email.trim()}
            className="mt-3 w-full rounded-xl bg-red-600 p-4 font-bold active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Admin"}
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-white/10 p-8 text-center text-zinc-500">
              Loading admins...
            </div>
          ) : admins.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
              No admins found
            </div>
          ) : (
            admins.map((admin) => (
              <div
                key={admin.id}
                className="rounded-2xl border border-white/10 bg-[#11141c] p-4"
              >
                <p className="truncate font-bold">{admin.email}</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleAdmin(admin)}
                    className={`rounded-xl p-3 font-bold ${
                      admin.active
                        ? "bg-green-500/10 text-green-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {admin.active ? "Active" : "Disabled"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeAdmin(admin.id)}
                    className="rounded-xl bg-red-500/10 p-3 font-bold text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
