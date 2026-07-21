"use client";

import { Suspense, useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { useSearchParams } from "next/navigation";

function PaymentContent() {
  const searchParams = useSearchParams();
  const [seconds, setSeconds] = useState(300);

  const game = searchParams.get("game") || "Game Top-up";
  const packageName =
    searchParams.get("package") || "Selected Package";
  const amount = Number(searchParams.get("amount") || 78);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(
    2,
    "0",
  );


  return (
    <AuthGuard>
      <main className="min-h-screen bg-black px-2 py-2 text-white">
        <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-red-500/30 bg-[#111111]">
          <div className="flex items-center justify-between bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-5 py-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/aatmahub-banner.png"
                alt="AatmaHub"
                className="h-8 w-14 rounded-md object-cover"
              />
              <span className="text-lg font-bold">
                Payable Amount
              </span>
            </div>

            <span className="text-lg font-bold">
              ₹{amount.toFixed(2)}
            </span>
          </div>

          <section className="px-6 py-6">
            <div className="flex gap-4">
              <div className="text-3xl">▦</div>

              <div>
                <h2 className="text-lg font-bold">
                  Scan QR Code to Pay
                </h2>
                <p className="mt-1 text-gray-400">
                  Open UPI app and scan
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <img
                src="/images/upi.jpg"
                alt="Payment QR"
                className="h-56 w-56 object-cover"
              />
            </div>

            <p className="mt-4 text-center text-base">
              Checking payment status...{" "}
              <span className="text-blue-500">
                {minutes}:{remainingSeconds}
              </span>
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#181818] p-5">
              <h3 className="text-lg font-bold">
                Payment Instructions
              </h3>

              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                <li>• Scan the QR code using any UPI app.</li>
                <li>• Pay the exact amount shown above.</li>
                <li>• Do not refresh or close this page.</li>
                <li>
                  • Your order will be verified after payment.
                </li>
              </ul>
            </div>

          </section>
        </div>
      </main>
    </AuthGuard>
  );
}


export default function PaymentPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <PaymentContent />
    </Suspense>
  );
}
