"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export default function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [turningOff, setTurningOff] = useState(false);

  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, "settings", "general"),
      (snap) => {
        setMaintenance(!!snap.data()?.maintenance);
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const token = await user.getIdTokenResult(true);
      setIsAdmin(token.claims.admin === true);
    });

    return () => {
      unsubSettings();
      unsubAuth();
    };
  }, []);

  async function turnOffMaintenance() {
    try {
      setTurningOff(true);

      await updateDoc(doc(db, "settings", "general"), {
        maintenance: false,
      });

      router.refresh();
    } catch {
      alert("Could not turn off maintenance.");
    } finally {
      setTurningOff(false);
    }
  }

  const adminRoute = pathname.startsWith("/super-admin");

  if (loading && !adminRoute) return null;

  if (maintenance && !adminRoute) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090e] p-6 text-white">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-4xl font-black text-red-500">
            Under Maintenance
          </h1>

          <p className="mt-4 text-zinc-400">
            We'll be back soon.
          </p>

          {isAdmin && (
            <div className="mt-8 space-y-3 rounded-2xl border border-zinc-800 bg-[#11141c] p-4">
              <p className="font-bold">Admin Controls</p>

              <button
                onClick={turnOffMaintenance}
                disabled={turningOff}
                className="w-full rounded-xl bg-red-600 p-3 font-bold"
              >
                {turningOff
                  ? "Turning Off..."
                  : "Turn Off Maintenance"}
              </button>

              <button
                onClick={() => router.push("/super-admin")}
                className="w-full rounded-xl bg-zinc-800 p-3 font-bold"
              >
                Go to Super Admin
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
