"use client";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ChangePasswordPage() {
  async function resetPassword() {
    const email = auth.currentUser?.email;

    if (!email) {
      alert("Please login first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (e: any) {
      alert(e.message);
    }
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

          <h1 className="text-2xl font-extrabold">Change Password</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#171d26] p-5">
          <p className="mb-5 text-sm text-gray-400">
            We'll send a password reset link to your registered email.
          </p>

          <button
            onClick={resetPassword}
            className="w-full rounded-xl bg-red-500 py-4 font-bold"
          >
            Send Reset Email
          </button>
        </div>
      </div>
    </main>
    </AuthGuard>
  );
}
