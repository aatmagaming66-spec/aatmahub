"use client";

import PasswordInput from "@/components/PasswordInput";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
  }, [router]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const ref = doc(db, "users", credential.user.uid);
      const snap = await getDoc(ref);

      await setDoc(
        ref,
        {
          uid: credential.user.uid,
          name: credential.user.displayName || "",
          email: credential.user.email,
          totalOrders: snap.exists()
            ? Number(snap.data().totalOrders || 0)
            : 0,
          pendingOrders: snap.exists()
            ? Number(snap.data().pendingOrders || 0)
            : 0,
          completedOrders: snap.exists()
            ? Number(snap.data().completedOrders || 0)
            : 0,
          ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
      );

      router.replace("/profile");
    } catch (err: any) {
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("Invalid email or password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1117] px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-extrabold">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-sm text-gray-400">
          Login to continue to AatmaHub
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-[#171d26] p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Enter email"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>

            <PasswordInput
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-red-400"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-500 px-4 py-3 font-bold disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-red-400">
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
