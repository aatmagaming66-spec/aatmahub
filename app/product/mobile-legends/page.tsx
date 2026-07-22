 "use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MobileLegendsPage() {
  const [selected, setSelected] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Diamonds");
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [verified, setVerified] = useState(false);
  const [username, setUsername] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productRef = doc(db, "products", "mobile-legends");

    return onSnapshot(
      productRef,
      (snapshot) => {
        setProduct(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load Mobile Legends product:", error);
        setLoading(false);
      }
    );
  }, []);

  const packages = product?.categories?.[activeTab] ?? [];

  const formatPrice = (price: number | string) => {
    const value = String(price);
    return value.startsWith("₹") ? value : `₹${value}`;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-white">
        Loading product...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4 text-center text-white">
        Product data was not found.
      </main>
    );
  }
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
            src={product.banner || "/images/moba legends banner.jpg"}
            alt="Mobile Legends"
            width={1200}
            height={450}
            priority
            className="w-full h-56 object-cover rounded-b-3xl"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent rounded-b-3xl" />

          <div className="absolute bottom-5 left-5">
            <h1 className="text-3xl font-extrabold">{product.name || "Mobile Legends"}</h1>
            <p className="text-red-400">Fast & Secure Top-Up</p>
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
            disabled={verifying}
            onClick={async () => {
              if (!playerId.trim() || !serverId.trim()) {
                alert("Enter Player ID and Server ID");
                return;
              }

              try {
                setVerifying(true);
                setVerified(false);
                setUsername("");

                const response = await fetch(
                  `/api/smile/get-role?userid=${encodeURIComponent(
                    playerId.trim()
                  )}&zoneid=${encodeURIComponent(serverId.trim())}`
                );

                const data = await response.json();

                if (!response.ok || data.status !== 200 || !data.username) {
                  throw new Error(data.message || "Player verification failed");
                }

                setUsername(data.username);
                setVerified(true);
              } catch (error) {
                alert(
                  error instanceof Error
                    ? error.message
                    : "Player verification failed"
                );
              } finally {
                setVerifying(false);
              }
            }}
            className="w-full mt-4 rounded-xl bg-red-600 py-3 font-semibold disabled:opacity-60"
          >
            {verifying
              ? "Verifying..."
              : verified
                ? "ID Verified ✓"
                : "Verify ID"}
          </button>

          {verified && username && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-green-500/40 bg-[#102018] px-4 py-3">
              <span className="text-sm text-gray-300">In-Game Name</span>
              <span className="font-bold text-green-400">{username} ✓</span>
            </div>
          )}

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
            {packages.map((pkg: any) => (
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
                    {formatPrice(pkg.price)}
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
                {selected ? formatPrice(selected.price) : "--"}
              </span>
            </p>
          </div>

          <button
            disabled={!verified || !selected}
            onClick={() => {
              if (verified && selected) {
                  sessionStorage.setItem(
                    "checkoutOrder",
                    JSON.stringify({
                      game: "Mobile Legends",
                      smileProduct: "mobilelegends",
                      userid: playerId.trim(),
                      zoneid: serverId.trim(),
                      package: selected.name,
                      price: selected.price,
                      smileProductId: selected.smileProductId || "",
                    })
                  );

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
