"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setAllowed(true);
    });
  }, [router]);

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f1117] text-white">
        Checking account...
      </main>
    );
  }

  return <>{children}</>;
}
