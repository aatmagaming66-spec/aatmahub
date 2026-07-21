"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login");
      } else {
        setUser(u);
      }
    });
  }, [router]);

  async function logout() {
    await signOut(auth);
    router.replace("/login");
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#0f1117] flex items-center justify-center text-white">
        Loading...
      </main>
    );
  }

  return (
    <AuthGuard>
    <main className="min-h-screen bg-[#0f1117] px-5 py-8 text-white">
      <div className="mx-auto max-w-md">

        <div className="rounded-2xl border border-white/10 bg-[#171d26] p-5 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-3xl font-extrabold">
            {(user.displayName || user.email || "A")[0].toUpperCase()}
          </div>

          <h1 className="mt-4 text-2xl font-extrabold">
            {user.displayName || "AatmaHub User"}
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            {user.email}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#171d26] p-4 text-center">
            <p className="text-2xl font-extrabold">0</p>
            <p className="text-xs text-gray-400">Orders</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171d26] p-4 text-center">
            <p className="text-2xl font-extrabold text-yellow-400">0</p>
            <p className="text-xs text-gray-400">Pending</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171d26] p-4 text-center">
            <p className="text-2xl font-extrabold text-green-400">0</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
        </div>

        <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-[#171d26] p-4">
          <Link href="/orders" className="flex justify-between rounded-xl bg-[#0f1117] px-4 py-4">
            <span>My Orders</span><span>→</span>
          </Link>

          <Link href="/wallet" className="flex justify-between rounded-xl bg-[#0f1117] px-4 py-4">
            <span>Wallet</span><span>→</span>
          </Link>
          <Link
            href="/settings"
            className="flex justify-between rounded-xl bg-[#0f1117] px-4 py-4"
          >
            <span>Settings</span>
            <span>→</span>
          </Link>

          <button
            onClick={logout}
            className="w-full rounded-xl bg-red-500 px-4 py-4 font-bold"
          >
            Logout
          </button>

          <Link
            href="/support"
            className="flex items-center justify-between rounded-xl bg-[#0f1117] px-4 py-4"
          >
            <span>Customer Support</span>
            <span>→</span>
          </Link>
        </div>
        <div className="pb-8 pt-6 text-center">
          <p className="text-xs text-gray-600">AatmaHub v1.0.0</p>
        </div>
</div>
    </main>
    </AuthGuard>
  );
}
