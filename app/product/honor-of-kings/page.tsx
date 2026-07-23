"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type PackageItem = {
  name: string;
  price: number;
};

const defaultPackages: PackageItem[] = [
  { name: "16 Tokens", price: 18.35 },
  { name: "80 Tokens", price: 89.81 },
  { name: "240 Tokens", price: 271.36 },
  { name: "400 Tokens", price: 452.91 },
  { name: "560 Tokens", price: 634.46 },
  { name: "830 Tokens", price: 906.78 },
  { name: "1245 Tokens", price: 1360.66 },
  { name: "2508 Tokens", price: 2722.28 },
  { name: "4180 Tokens", price: 4537.77 },
  { name: "8360 Tokens", price: 9076.51 },
];

export default function HonorOfKingsPage() {
  const [packages, setPackages] =
    useState<PackageItem[]>(defaultPackages);
  const [selected, setSelected] =
    useState<PackageItem | null>(null);
  const [playerId, setPlayerId] = useState("");

  useEffect(() => {
    async function loadPackages() {
      try {
        const snapshot = await getDoc(
          doc(db, "products", "honor-of-kings")
        );

        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const savedPackages = data?.categories?.Tokens;

        if (Array.isArray(savedPackages)) {
          setPackages(
            savedPackages.map((item) => ({
              name: String(item.name ?? ""),
              price: Number(item.price ?? 0),
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load HOK packages:", error);
      }
    }

    loadPackages();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price);

  const canBuy =
    playerId.trim().length > 0 &&
    selected !== null;

  const handleBuyNow = () => {
    if (!canBuy || !selected) return;

    sessionStorage.setItem(
      "checkoutOrder",
      JSON.stringify({
        game: "Honor of Kings",
        provider: "honor-of-kings",
        userid: playerId.trim(),
        
        package: selected.name,
        price: selected.price,
      })
    );

    window.location.href = "/checkout";
  };

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-md pb-10">
        <a
          href="/"
          className="m-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold active:scale-95"
        >
          ← Back
        </a>

        <div className="relative overflow-hidden rounded-b-3xl">
          <Image
            src="/images/honor-of-kings/hokbanner.jpg"
            alt="Honor of Kings"
            width={1200}
            height={500}
            priority
            className="h-56 w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          <div className="absolute bottom-5 left-5">
            <h1 className="text-3xl font-extrabold">Honor of Kings</h1>
            <p className="font-medium text-red-400">
              Fast and Secure Token Top-Up
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-4">
            <h2 className="mb-4 font-bold">Enter Account Details</h2>

            <input
              value={playerId}
              onChange={(event) => setPlayerId(event.target.value)}
              placeholder="Player ID"
              inputMode="numeric"
              className="mb-3 w-full rounded-xl border border-red-500/30 bg-[#0d0d0d] px-4 py-3 outline-none focus:border-red-500"
            />

            </div>

            <h2 className="mb-4 mt-8 text-sm font-semibold">
              Select Package
            </h2>
          <div className="grid grid-cols-2 gap-3">
            {packages.map((pkg) => {
              const isSelected = selected?.name === pkg.name;

              return (
                <button
                  key={pkg.name}
                  type="button"
                  onClick={() => setSelected(pkg)}
                  className={`overflow-hidden rounded-2xl border px-2 py-2 text-left transition active:scale-[0.98] ${
                    isSelected
                      ? "border-red-500 bg-[#241313] ring-1 ring-red-500/40"
                      : "border-[#2d2d2d] bg-[#171717]"
                  }`}
                >
                  <h3 className="px-1 text-sm font-bold">{pkg.name}</h3>

                  <div className="mt-1 flex items-end justify-between">
                    <img
                      src="/images/honor-of-kings/hoktokens.png"
                      alt={pkg.name}
                      className="h-20 w-20 object-contain drop-shadow-lg"
                    />

                    <span className="pb-1 text-sm font-extrabold text-red-500">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-[#151515] p-4">
            <h3 className="text-sm font-semibold">Order Summary</h3>

            <p className="mt-3 text-sm text-gray-400">
              Game: <span className="text-white">Honor of Kings</span>
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Package:{" "}
              <span className="text-white">
                {selected?.name ?? "Not Selected"}
              </span>
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Price:{" "}
              <span className="font-semibold text-red-400">
                {selected ? formatPrice(selected.price) : "--"}
              </span>
            </p>
          </div>

          <button
            type="button"
            disabled={!canBuy}
            onClick={handleBuyNow}
            className={`mt-6 w-full rounded-xl py-4 font-bold transition active:scale-[0.98] ${
              canBuy
                ? "bg-red-600 hover:bg-red-700"
                : "cursor-not-allowed bg-gray-700 text-gray-400 opacity-60"
            }`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </main>
  );
}
