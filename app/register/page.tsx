"use client";

import PasswordInput from "@/components/PasswordInput";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
  }, [router]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(credential.user, {
        displayName: name.trim(),
      });

      router.replace("/profile");
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String(err.code)
          : "";

      if (code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (code === "auth/invalid-email") {
        setError("Enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setError("Choose a stronger password.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1117] px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-extrabold">
          Create Account
        </h1>

        <p className="mt-2 text-center text-sm text-gray-400">
          Register to continue with AatmaHub
        </p>

        <form
          onSubmit={handleRegister}
          className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-[#171d26] p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter full name"
              autoComplete="name"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email address"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>

            <PasswordInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create password"
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Confirm Password
            </label>

            <PasswordInput
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-500 px-4 py-3 font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-red-400">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
