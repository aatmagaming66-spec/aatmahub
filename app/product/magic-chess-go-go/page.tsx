 "use client";

import Image from "next/image";
import { useState } from "react";

export default function MobileLegendsPage() {
  const [selected, setSelected] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Diamonds");
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verified, setVerified] = useState(false);

  const diamonds = [
  { name: "55 Diamonds", bonus: "50 + 5 Bonus", price: "₹89", image: "/images/86 diamonds.png" },
  { name: "86 Diamonds", bonus: "78 + 8 Bonus", price: "₹129", image: "/images/86 diamonds.png" },
  { name: "165 Diamonds", bonus: "150 + 15 Bonus", price: "₹259", image: "/images/86 diamonds.png" },
  { name: "172 Diamonds", bonus: "156 + 16 Bonus", price: "₹269", image: "/images/86 diamonds.png" },

  { name: "257 Diamonds", bonus: "234 + 23 Bonus", price: "₹389", image: "/images/514 diamonds.png" },
  { name: "275 Diamonds", bonus: "250 + 25 Bonus", price: "₹429", image: "/images/514 diamonds.png" },
  { name: "344 Diamonds", bonus: "310 + 34 Bonus", price: "₹539", image: "/images/514 diamonds.png" },
  { name: "516 Diamonds", bonus: "465 + 51 Bonus", price: "₹779", image: "/images/514 diamonds.png" },

  { name: "565 Diamonds", bonus: "500 + 65 Bonus", price: "₹849", image: "/images/2195-3688 diamonds.png" },
  { name: "706 Diamonds", bonus: "625 + 81 Bonus", price: "₹1029", image: "/images/2195-3688 diamonds.png" },
  { name: "1346 Diamonds", bonus: "1160 + 186 Bonus", price: "₹1899", image: "/images/2195-3688 diamonds.png" },
  { name: "1825 Diamonds", bonus: "1547 + 278 Bonus", price: "₹2499", image: "/images/2195-3688 diamonds.png" },

  { name: "2195 Diamonds", bonus: "1860 + 335 Bonus", price: "₹2999", image: "/images/5532-9288 diamonds.png" },
  { name: "3688 Diamonds", bonus: "3099 + 589 Bonus", price: "₹4999", image: "/images/5532-9288 diamonds.png" },
  { name: "5532 Diamonds", bonus: "4649 + 883 Bonus", price: "₹7499", image: "/images/5532-9288 diamonds.png" },
  { name: "9288 Diamonds", bonus: "7740 + 1548 Bonus", price: "₹12499", image: "/images/5532-9288 diamonds.png" },
];

  const bundles = [
  {
    name: "Lukas Battle Reward",
    bonus: "Limited",
    price: "₹99",
    image: "/images/bundle tabs.png"
  },
  {
    name: "Discount Battle Reward",
    bonus: "Limited",
    price: "₹99",
    image: "/images/bundle tabs.png"
  },
];

  const doubles = [
  {
    name: "100 Diamonds",
    bonus: "50 + 50 Bonus",
    price: "₹90",
    image: "/images/special.png"
  },
  {
    name: "300 Diamonds",
    bonus: "150 + 150 Bonus",
    price: "₹259",
    image: "/images/special.png"
  },
  {
    name: "500 Diamonds",
    bonus: "250 + 250 Bonus",
    price: "₹399",
    image: "/images/special.png"
  },
  {
    name: "1000 Diamonds",
    bonus: "500 + 500 Bonus",
    price: "₹799",
    image: "/images/special.png"
  },
];

  const passes = [
  {
    name: "Weekly Pass",
    bonus: "7 Days",
    price: "₹210",
    image: "/images/weekly pass.png"
  },
];

  const packages =
    activeTab === "Diamonds"
      ? diamonds
      : activeTab === "Special Bundle"
      ? bundles
      : activeTab === "Double Diamonds"
      ? doubles
      : passes;
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
            src="/images/mcggbanner.jpg"
            alt="Magic Chess: Go Go"
            width={1200}
            height={450}
            priority
            className="w-full h-56 object-cover rounded-b-3xl"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent rounded-b-3xl" />

          <div className="absolute bottom-5 left-5">
            <h1 className="text-3xl font-extrabold">Magic Chess: Go Go</h1>
            <p className="text-red-400">Fast & Secure Recharge</p>
          </div>
        </div>

        <div className="p-4">
          <input
            value={playerId}
            onChange={(e) => {
              setPlayerId(e.target.value);
              setVerified(false);
            }}
            placeholder="Player ID"
            className="w-full rounded-xl border border-red-500/30 bg-[#161616] px-4 py-3 mb-3"
          />

          <input
            value={serverId}
            onChange={(e) => {
              setServerId(e.target.value);
              setVerified(false);
            }}
            placeholder="Server ID"
            className="w-full rounded-xl border border-red-500/30 bg-[#161616] px-4 py-3"
          />

          <button
            onClick={() => {
              if (!playerId.trim() || !serverId.trim()) {
                alert("Enter Player ID and Server ID");
                return;
              }
              setVerified(true);
            }}
            className="w-full mt-4 rounded-xl bg-red-600 py-3 font-semibold"
          >
            {verified ? "ID Verified ✓" : "Verify ID"}
          </button>

          <div className="grid grid-cols-4 gap-1 mt-6">
            {[
              ["Diamonds", "/images/diamonds tabs.png"],
              ["Special Bundle", "/images/bundle tabs.png"],
              ["Double Diamonds", "/images/special tabs.png"],
              ["Passes", "/images/passes tabs.png"],
            ].map(([name, img]) => (
              <button
                key={name}
                onClick={() => {
                  setActiveTab(name);
                  setSelected(null);
                }}
                className={`w-full rounded-2xl px-3 py-1 border transition ${
                  activeTab === name
                    ? "border-red-600 bg-[#171717]"
                    : "border-red-500/30 bg-[#171717]"
                }`}
              >
                <img
                  src={img}
                  className="mx-auto h-14 w-full object-contain"
                  alt={name}
                />
                <p className="mt-2 text-[14px] text-center font-semibold">
                  {name}
                </p>
              </button>
            ))}
          </div>

          <h2 className="mt-8 mb-4 text-sm font-semibold">
            Select Package
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {packages.length === 0 ? (<div className="col-span-2 rounded-2xl border border-dashed border-red-500/30 bg-[#171717] p-6 text-center text-gray-400">Packages will be available soon.</div>) : packages.map((pkg) => (
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

                <p className="mt-0 text-left text-xs text-green-400 text-xs">
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
            <h3 className="text-sm font-semibold">Order Summary</h3>

            <p className="mt-2 text-sm text-gray-400">
              Selected Tab:
              <span className="text-white"> {activeTab}</span>
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

          <button
            disabled={!verified || !selected}
            onClick={() => {
              if (verified && selected) {
                window.location.href = "/checkout";
              }
            }}
            className={`mt-6 w-full rounded-xl py-4 font-semibold transition ${
              verified && selected
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-700 text-gray-400 opacity-60 cursor-not-allowed"
            }`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </main>
  );
}
