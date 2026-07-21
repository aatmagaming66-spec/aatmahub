"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, updateProfile, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ProfileInformationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setName(currentUser?.displayName || "");
      setLoading(false);
    });
  }, []);

  
  async function saveName() {
    if (!auth.currentUser) return;

    const cleanName = name.trim();

    await updateProfile(auth.currentUser, {
      displayName: cleanName,
    });

    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      { name: cleanName },
      { merge: true }
    );

    alert("Profile updated.");
  }


return (
    <AuthGuard>
      <main className="min-h-screen bg-[#0f1117] px-5 py-8 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171d26] text-xl"
          >
            ←
          </Link>
          <h1 className="text-2xl font-extrabold">Profile Information</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#171d26] p-4">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : user ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#0f1117] p-4">
                <p className="text-xs text-gray-500">Display Name</p>
                <input
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  className="mt-2 w-full rounded-lg bg-[#171d26] px-3 py-3 outline-none"
                />
                <button
                  onClick={saveName}
                  className="mt-3 w-full rounded-lg bg-red-500 py-3 font-bold"
                >
                  Save Name
                </button>

                <p className="mt-5 text-xs text-gray-500">Email Address</p>
                <p className="mt-1 break-all text-white">{user.email}</p>
              </div>

              <div className="rounded-xl bg-[#0f1117] p-4">
                <p className="text-xs text-gray-500">Account Status</p>
                <p className="mt-1 text-green-400">Logged In</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No account information found.</p>
          )}
        </div>
      </div>
    </main>
    </AuthGuard>
  );
}
