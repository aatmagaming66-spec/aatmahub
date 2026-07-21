"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";
import Link from "next/link";

const tabs = ["All", "Pending", "Success", "Failed"];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <AuthGuard>
    <main className="min-h-screen bg-[#080a0f] px-4 pb-28 pt-6 text-white">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
              My Activity
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">Orders</h1>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-[#151922] px-4 py-2 text-sm font-semibold text-gray-300"
          >
            Home
          </Link>
        </div>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-red-500/20 bg-gradient-to-br from-[#241016] via-[#151820] to-[#0e1118] p-5 shadow-[0_16px_45px_rgba(255,45,53,0.14)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="mt-2 text-4xl font-extrabold">0</p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8 text-red-400"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 4h14v17l-3-2-4 2-4-2-3 2V4Z" />
                <path d="M8 9h8M8 13h6" />
              </svg>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-3 text-center">
              <p className="text-xs text-gray-400">Pending</p>
              <p className="mt-1 text-lg font-bold text-yellow-400">0</p>
            </div>

            <div className="rounded-2xl border border-green-500/15 bg-green-500/5 p-3 text-center">
              <p className="text-xs text-gray-400">Success</p>
              <p className="mt-1 text-lg font-bold text-green-400">0</p>
            </div>

            <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-3 text-center">
              <p className="text-xs text-gray-400">Failed</p>
              <p className="mt-1 text-lg font-bold text-red-400">0</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-[#12151d] p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-2 py-2.5 text-xs font-bold transition ${
                activeTab === tab
                  ? "bg-red-600 text-white"
                  : "text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-[#12151d] px-5 py-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10 text-red-400"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M5 4h14v17l-3-2-4 2-4-2-3 2V4Z" />
              <path d="M8 9h8M8 13h6" />
            </svg>
          </div>

          <h2 className="mt-5 text-xl font-bold">
            No {activeTab === "All" ? "" : activeTab.toLowerCase()} orders yet
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Your game top-up orders will appear here with payment and delivery status.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-red-600 px-6 py-3 font-bold"
          >
            Browse Games
          </Link>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-[#12151d] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">
            Order Tracking
          </p>

          <h2 className="mt-2 text-xl font-extrabold">
            How your order is processed
          </h2>

          <div className="mt-6 space-y-1">
            {[
              ["1", "Order Placed", "Your order details are received."],
              ["2", "Payment Verified", "Payment is checked and confirmed."],
              ["3", "Top-up Processing", "Your game top-up is being processed."],
              ["4", "Order Completed", "The order is successfully delivered."],
            ].map(([number, title, description], index) => (
              <div key={title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-sm font-extrabold text-red-400">
                    {number}
                  </div>

                  {index < 3 && (
                    <div className="h-10 w-px bg-gradient-to-b from-red-500/50 to-white/10" />
                  )}
                </div>

                <div className="pb-5 pt-1">
                  <p className="font-bold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-gray-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 flex items-center justify-between rounded-[24px] border border-white/10 bg-gradient-to-r from-[#171b25] to-[#11141b] p-5">
          <div>
            <p className="text-lg font-extrabold text-white">Need help?</p>
            <p className="mt-1 text-sm text-gray-400">
              Contact support regarding your order.
            </p>
          </div>

          <Link
            href="/support"
            className="ml-4 shrink-0 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-black transition active:scale-95"
          >
            Support
          </Link>
        </section>
      </div>
    </main>
    </AuthGuard>
  );
}
