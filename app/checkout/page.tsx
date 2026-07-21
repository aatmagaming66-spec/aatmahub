"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [payment, setPayment] = useState("wallet");
  const walletBalance = 0;

  return (
    <main className="min-h-screen bg-[#080808] text-white px-4 py-6">
      <div className="mx-auto max-w-md">

        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="rounded-2xl border border-red-500/30 bg-[#151515] p-5">
          <h2 className="text-2xl font-semibold mb-5">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Game</span><span>Mobile Legends</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Package</span><span>Not Selected</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Player ID</span><span>--</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Server ID</span><span>--</span></div>

            <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-red-500">₹0</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/30 bg-[#151515] p-5 mt-6">
          <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>

          <button
            disabled
            className={`w-full rounded-xl border px-4 py-3 flex items-center items-center justify-between h-16 transition ${
              payment==="upi"
                ? "bg-[#6b161a] border-red-500/50"
                : "bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed"
            }`}
          >
            <div><span className="font-bold text-lg">UPI</span><p className="text-xs text-gray-400">Coming Soon</p></div>

            <div className="flex items-center gap-2"><img src="/images/google pay.jpg" className="h-10 w-10 rounded-md object-cover" alt="GPay" /><img src="/images/phone pay.jpeg" className="h-10 w-10 rounded-md object-cover" alt="PhonePe" /><img src="/images/paytm.png" className="h-10 w-10 rounded-md object-cover" alt="Paytm" /></div></button>

          <button
            onClick={() => setPayment("wallet")}
            className={`w-full rounded-xl border px-4 py-3 mt-3 flex items-center items-center justify-between h-16 transition ${
              payment==="wallet"
                ? "bg-[#6b161a] border-red-500/50"
                : "bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed"
            }`}
          >
            <p className="font-bold text-lg">Wallet</p>

            <span className="text-sm text-gray-300">
              Balance ₹{walletBalance}
            </span>
          </button>
        </div>

        <button onClick={() => window.location.href="/payment"} className="mt-6 w-full rounded-xl bg-red-600 py-4 text-lg font-semibold hover:bg-red-700 transition">Proceed to Checkout</button>

      </div>
    </main>
  );
}
