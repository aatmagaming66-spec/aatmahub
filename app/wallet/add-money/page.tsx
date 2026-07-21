"use client";

import Link from "next/link";
import { useState } from "react";

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const valid = Number(amount) > 0;

  const sendWhatsAppRequest = () => {
    const message = [
      "AatmaHub Wallet Add Money Request",
      "",
      `Amount: ₹${amount}`,
      `Note: ${note.trim() || "None"}`,
      "Payment Method: Manual WhatsApp",
      "Status: Pending",
      "",
      "Please confirm payment instructions.",
    ].join("\n");

    window.open(
      `https://wa.me/918566936666?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <main className="min-h-screen bg-[#0f1117] p-5 text-white">
      <div className="flex items-center gap-4">
        <Link href="/wallet" className="text-2xl">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Money</h1>
          <p className="text-sm text-gray-400">Manual wallet recharge request</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-red-500/20 bg-[#181c24] p-5">
        <label className="mb-3 block text-sm text-gray-400">
          Enter Amount
        </label>

        <div className="flex items-center rounded-xl border border-red-500/20 bg-[#10141b] px-4">
          <span className="text-3xl font-bold text-red-500">₹</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter custom amount"
            className="w-full bg-transparent px-3 py-4 text-2xl font-bold outline-none placeholder:text-gray-600"
          />
        </div>

        <div className="mt-5">
          <label className="mb-3 block text-sm text-gray-400">
            Note <span className="text-gray-600">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={150}
            placeholder="Write any message for the admin"
            className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-[#10141b] p-4 text-sm outline-none focus:border-red-500/50"
          />
        </div>

        <div className="mt-5 rounded-xl bg-[#10141b] p-4">
          <h2 className="font-semibold">Request Summary</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Request Type</span>
              <span>Wallet Recharge</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Amount</span>
              <span className="font-bold text-red-400">
                ₹{amount || "0"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                Pending
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-sm text-gray-300">
            Your request will be sent to AatmaHub support on WhatsApp. The
            admin will confirm payment details and manually update your wallet.
          </p>
        </div>

        <button
          disabled={!valid}
          onClick={sendWhatsAppRequest}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold ${
            valid
              ? "bg-green-600 hover:bg-green-700"
              : "cursor-not-allowed bg-gray-700 text-gray-400"
          }`}
        >
          <img
            src="/images/whatsapp.svg"
            alt=""
            className="h-5 w-5"
          />
          Create Request on WhatsApp
        </button>
      </div>
    </main>
  );
}
