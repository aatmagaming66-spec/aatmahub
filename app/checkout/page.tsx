"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type CheckoutOrder = {
  game: string;
  smileProduct: string;
  userid: string;
  zoneid: string;
  package: string;
  price: string | number;
  smileProductId: string;
};

export default function CheckoutPage() {
  const [payment] = useState("upi");
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("checkoutOrder");

    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder) as CheckoutOrder);
      } catch (error) {
        console.error("Failed to read checkout order:", error);
      }
    }

    setLoading(false);
  }, []);

  const formatPrice = (price: string | number) => {
    const value = String(price);
    return value.startsWith("₹") ? value : `₹${value}`;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        Loading checkout...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#080808] px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-bold">Checkout</h1>

          <div className="mt-6 rounded-2xl border border-red-500/30 bg-[#151515] p-5 text-center">
            <p className="text-gray-400">
              No package has been selected.
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="mt-5 w-full rounded-xl bg-red-600 py-3 font-semibold"
            >
              Return Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

        <div className="rounded-2xl border border-red-500/30 bg-[#151515] p-5">
          <h2 className="mb-5 text-2xl font-semibold">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Game</span>
              <span className="text-right">{order.game}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Package</span>
              <span className="text-right">{order.package}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Player ID</span>
              <span>{order.userid}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Server ID</span>
              <span>{order.zoneid}</span>
            </div><div className="flex justify-between border-t border-white/10 pt-3 text-xl font-bold">
              <span>Total</span>
              <span className="text-red-500">
                {formatPrice(order.price)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-red-500/30 bg-[#151515] p-5">
          <h2 className="mb-4 text-xl font-semibold">
            Select Payment Method
          </h2>

          <button
            disabled
            className={`flex h-16 w-full items-center justify-between rounded-xl border px-4 py-3 transition ${
              payment === "upi"
                ? "border-red-500/50 bg-[#6b161a]"
                : "cursor-not-allowed border-gray-600 bg-gray-700 opacity-50"
            }`}
          >
            <div className="text-left">
              <span className="text-lg font-bold">UPI</span>
              <p className="text-xs text-gray-400">
                Coming Soon
              </p>
            </div>

            <div className="flex items-center gap-2">
              <img
                src="/images/google pay.jpg"
                className="h-10 w-10 rounded-md object-cover"
                alt="GPay"
              />
              <img
                src="/images/phone pay.jpeg"
                className="h-10 w-10 rounded-md object-cover"
                alt="PhonePe"
              />
              <img
                src="/images/paytm.png"
                className="h-10 w-10 rounded-md object-cover"
                alt="Paytm"
              />
            </div>
          </button>
        </div>

        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-xl bg-gray-700 py-4 text-lg font-semibold text-gray-400"
        >
          Checkout Unavailable — Payment Coming Soon
        </button>
      </div>
    </main>
  );
}
