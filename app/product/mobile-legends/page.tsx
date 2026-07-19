"use client";

import Image from "next/image";
import { useState } from "react";

export default function MobileLegendsPage() {
  const [selected, setSelected] = useState<any>(null);

  const packages = [
    {
      name: "86 Diamonds",
      bonus: "78 + 8 Bonus",
      price: "₹129",
      image: "/images/86 diamonds.png",
    },
    {
      name: "172 Diamonds",
      bonus: "156 + 16 Bonus",
      price: "₹270",
      image: "/images/86 diamonds.png",
    },
    {
      name: "257 Diamonds",
      bonus: "234 + 23 Bonus",
      price: "₹380",
      image: "/images/86 diamonds.png",
    },

    {
      name: "706 Diamonds",
      bonus: "625 + 81 Bonus",
      price: "₹1019",
      image: "/images/514 diamonds.png",
    },
    {
      name: "1412 Diamonds",
      bonus: "1250 + 162 Bonus",
      price: "₹1999",
      image: "/images/2195-3688 diamonds.png",
    },
    {
      name: "2195 Diamonds",
      bonus: "1860 + 335 Bonus",
      price: "₹3100",
      image: "/images/2195-3688 diamonds.png",
    },
    {
      name: "3688 Diamonds",
      bonus: "3099 + 589 Bonus",
      price: "₹5100",
      image: "/images/2195-3688 diamonds.png",
    },
    {
      name: "5532 Diamonds",
      bonus: "4640 + 892 Bonus",
      price: "₹7499",
      image: "/images/5532-9288 diamonds.png",
    },
    {
      name: "7720 Diamonds",
      bonus: "6483 + 1237 Bonus",
      price: "₹10499",
      image: "/images/5532-9288 diamonds.png",
    },
    {
      name: "9288 Diamonds",
      bonus: "7740 + 1548 Bonus",
      price: "₹12499",
      image: "/images/5532-9288 diamonds.png",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="max-w-md mx-auto pb-10">

        <a
          href="/"
          className="inline-flex items-center gap-2 m-4 rounded-lg bg-red-600 px-4 py-2 font-semibold"
        >
          ← Back
        </a>

        <div className="relative">

          <Image
            src="/images/moba legends banner.jpg"
            alt="Mobile Legends"
            width={1200}
            height={450}
            priority
            className="w-full h-56 object-cover rounded-b-3xl"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent rounded-b-3xl"></div>

          <div className="absolute bottom-5 left-5">
            <h1 className="text-3xl font-extrabold">
              Mobile Legends
            </h1>

            <p className="text-red-400">
              Fast & Secure Top-Up
            </p>
          </div>

        </div>

        <div className="p-4">
          <input
            placeholder="Player ID"
            className="w-full rounded-xl border border-red-500/30 bg-[#161616] px-4 py-3 mb-3"
          />

          <input
            placeholder="Server ID"
            className="w-full rounded-xl border border-red-500/30 bg-[#161616] px-4 py-3"
          />

          <button className="w-full mt-4 rounded-xl bg-red-600 py-3 font-semibold">
            Verify ID
          </button>

          <div className="grid grid-cols-4 gap-1 mt-6">

            <button className="w-full rounded-2xl border border-red-600 bg-[#171717] px-3 py-1 ">
              <img src="/images/diamonds tabs.png" className="mx-auto h-14 w-full object-contain" alt="" />
              <p className="mt-2 text-[14px] text-center font-semibold">Diamonds</p>
            </button>

            <button className="w-full rounded-2xl border border-red-500/30 bg-[#171717] px-3 py-1 ">
              <img src="/images/bundle tabs.png" className="mx-auto h-14 w-full object-contain" alt="" />
              <p className="mt-2 text-[14px] text-center font-semibold">Special Bundle</p>
            </button>

            <button className="w-full rounded-2xl border border-red-500/30 bg-[#171717] px-3 py-1 ">
              <img src="/images/special tabs.png" className="mx-auto h-14 w-full object-contain" alt="" />
              <p className="mt-2 text-[14px] text-center font-semibold">Double Diamonds</p>
            </button>

            <button className="w-full rounded-2xl border border-red-500/30 bg-[#171717] px-3 py-1 ">
              <img src="/images/passes tabs.png" className="mx-auto h-14 w-full object-contain" alt="" />
              <p className="mt-2 text-[14px] text-center font-semibold">Passes</p>
            </button>

          </div>

          <h2 className="mt-8 mb-4 text-sm font-semibold">
            Select Package
          </h2>

          <div className="grid grid-cols-2 gap-3">

            {packages.map((pkg) => (

              <button
                key={pkg.name}
                onClick={() => setSelected(pkg)}
                className={`rounded-2xl px-2 py-1 border transition ${
                  selected?.name === pkg.name
                    ? "border-red-500 bg-[#241313]"
                    : "border-[#2d2d2d] bg-[#171717]"
                }`}
              >
                <h3 className="text-left font-semibold text-sm">
                  {pkg.name}
                </h3>

                <p className="mt-0 text-left text-sm text-green-400">
                  {pkg.bonus}
                </p>

                <div className="mt-0 flex items-end justify-between">

                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="h-20 w-20 object-contain drop-shadow-lg"
                  />

                  <span className="self-end text-sm font-extrabold text-red-500">
                    {pkg.price}
                  </span>

                </div>

              </button>

            ))}

          </div>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-[#151515] p-4">

            <h3 className="text-sm font-semibold">
              Order Summary
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Selected Tab:
              <span className="text-white"> Diamonds</span>
            </p>

            <p className="text-sm text-gray-400">
              Package:
              <span className="text-white">
                {" "}
                {selected ? selected.name : "Not Selected"}
              </span>
            </p>

            <p className="text-sm text-gray-400">
              Price:
              <span className="text-red-400">
                {" "}
                {selected ? selected.price : "--"}
              </span>
            </p>

          </div>

          <button className="mt-6 w-full rounded-xl bg-red-600 py-4 font-semibold">
            Buy Now
          </button>

        </div>

      </div>

    </main>
  );
}
