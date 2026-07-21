"use client";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <AuthGuard>
    <main className="min-h-screen bg-[#0f1117] px-5 py-8 text-white">
      <div className="mx-auto max-w-md">

        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171d26] text-xl"
          >
            ←
          </button>

          <h1 className="text-3xl font-extrabold">Settings</h1>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
          Account
        </p>

        <div className="rounded-2xl border border-white/10 bg-[#171d26] p-3">
          <Link href="/settings/profile" className="flex justify-between rounded-xl bg-[#0f1117] px-4 py-4 transition active:scale-[0.98] active:bg-[#1b2230]">
            <span>Profile Information</span><span>→</span>
          </Link>

          <Link href="/settings/change-password" className="mt-3 flex justify-between rounded-xl bg-[#0f1117] px-4 py-4">
            <span>Change Password</span><span>→</span>
          </Link>
        </div>

        <p className="mt-6 mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
          Legal
        </p>

        <div className="rounded-2xl border border-white/10 bg-[#171d26] p-3">
          <Link href="/privacy-policy" className="flex justify-between rounded-xl bg-[#0f1117] px-4 py-4 transition active:scale-[0.98] active:bg-[#1b2230]">
            <span>Privacy Policy</span><span>→</span>
          </Link>

          <Link href="/terms-and-conditions" className="mt-3 flex justify-between rounded-xl bg-[#0f1117] px-4 py-4">
            <span>Terms & Conditions</span><span>→</span>
          </Link>

          <Link href="/refund-policy" className="mt-3 flex justify-between rounded-xl bg-[#0f1117] px-4 py-4">
            <span>Refund Policy</span><span>→</span>
          </Link>
        </div>

        <p className="mt-6 mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
          About
        </p>

        <div className="rounded-2xl border border-white/10 bg-[#171d26] p-3">
          <Link href="/developer" className="flex justify-between rounded-xl bg-[#0f1117] px-4 py-4 transition active:scale-[0.98] active:bg-[#1b2230]">
            <span>Developer</span><span>→</span>
          </Link>

          <div className="mt-3 rounded-xl bg-[#0f1117] px-4 py-4 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Version</span>
              <span>v1.0.0</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Build</span>
              <span>100</span>
            </div>
          </div>
        </div>

      </div>
    </main>
    </AuthGuard>
  );
}
