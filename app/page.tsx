"use client";

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
export default function Home() {
  const [gameStatus, setGameStatus] = useState({
    mobileLegendsEnabled: true,
    mobileLegendsSmallPacksEnabled: true,
    magicChessEnabled: true,
    mlGiftingEnabled: true,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "general"), (snap) => {
      const data = snap.data();

      setGameStatus({
        mobileLegendsEnabled: data?.mobileLegendsEnabled !== false,
        mobileLegendsSmallPacksEnabled:
          data?.mobileLegendsSmallPacksEnabled !== false,
        magicChessEnabled: data?.magicChessEnabled !== false,
        mlGiftingEnabled: data?.mlGiftingEnabled !== false,
      });
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#080a0f] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#11141c]/95 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between px-5 py-2">
          <Link href="/" className="flex h-10 items-center overflow-hidden">
            <img
              src="/logo/aatmahub-logo.png"
              alt="AatmaHub Logo"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <div className="flex gap-2">
            <Link
              href="/developer"
              aria-label="Developer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/30 bg-[#181c26] text-red-400 shadow-[0_0_18px_rgba(239,68,68,0.18)] transition active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m8 9-4 3 4 3" />
                <path d="m16 9 4 3-4 3" />
                <path d="m14 5-4 14" />
              </svg>
            </Link>

            <button
              aria-label="Menu"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#181c26]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
<section className="px-3 pt-3">
  <img src="/images/aatmahub-banner.png" alt="AatmaHub Banner" className="mx-auto w-[98%] rounded-2xl object-cover" />
</section>
<section className="grid grid-cols-4 gap-3 px-3 py-4">
  <Link
    href="/guide"
    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#4a0f16] via-[#2b0c12] to-[#14090d] px-2 py-2 shadow-[0_0_18px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition active:scale-95 active:border-red-400"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/15 bg-gradient-to-b from-[#17191f] to-[#08090d] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_5px_12px_rgba(0,0,0,0.5)]">
      <BookOpenIcon className="h-6 w-6 text-white" strokeWidth={1.8} />
    </div>
    <span className="text-xs font-medium text-white">Guide</span>
  </Link>

  <Link
    href="/search"
    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#4a0f16] via-[#2b0c12] to-[#14090d] px-2 py-2 shadow-[0_0_18px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition active:scale-95 active:border-red-400"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/15 bg-gradient-to-b from-[#17191f] to-[#08090d] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_5px_12px_rgba(0,0,0,0.5)]">
      <MagnifyingGlassIcon className="h-6 w-6 text-white" strokeWidth={1.8} />
    </div>
    <span className="text-xs font-medium text-white">Search</span>
  </Link>

  <Link
    href="/follow"
    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#4a0f16] via-[#2b0c12] to-[#14090d] px-2 py-2 shadow-[0_0_18px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition active:scale-95 active:border-red-400"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/15 bg-gradient-to-b from-[#17191f] to-[#08090d] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_5px_12px_rgba(0,0,0,0.5)]">
      <GlobeAltIcon className="h-6 w-6 text-white" strokeWidth={1.8} />
    </div>
    <span className="text-xs font-medium text-white">Follow</span>
  </Link>

  <Link
    href="/support"
    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#4a0f16] via-[#2b0c12] to-[#14090d] px-2 py-2 shadow-[0_0_18px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition active:scale-95 active:border-red-400"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/15 bg-gradient-to-b from-[#17191f] to-[#08090d] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_5px_12px_rgba(0,0,0,0.5)]">
      <ShieldCheckIcon className="h-6 w-6 text-white" strokeWidth={1.8} />
    </div>
    <span className="text-xs font-medium text-white">Support</span>
  </Link>
</section>
<section className="overflow-hidden rounded-xl mx-3 my-3 border border-red-500/40 bg-gradient-to-r from-[#6b0f1a] via-[#b91c1c] to-[#6b0f1a] py-2 shadow-[0_0_20px_rgba(239,68,68,0.35)]">
  <div className="animate-marquee flex min-w-max items-center gap-8 whitespace-nowrap text-lg font-medium text-white">
    <span>⭐ Why Choose AatmaHub?</span><span className="text-red-400">•</span><span>Instant Delivery</span><span className="text-red-400">•</span><span>Best Prices</span><span className="text-red-400">•</span><span>24×7 Support</span><span className="text-red-400">•</span><span>100% Secure Top-Ups</span><span className="text-red-400">•</span><span>Trusted by Gamers</span>
    <span className="text-red-400">•</span>
    <span>🔒 Safe & Secure Orders</span>

    <span>⭐ Why Choose AatmaHub?</span><span className="text-red-400">•</span><span>Instant Delivery</span><span className="text-red-400">•</span><span>Best Prices</span><span className="text-red-400">•</span><span>24×7 Support</span><span className="text-red-400">•</span><span>100% Secure Top-Ups</span><span className="text-red-400">•</span><span>Trusted by Gamers</span>
    <span className="text-red-400">•</span>
    <span>🔒 Safe & Secure Orders</span>
  </div>
</section>

<section className="px-4 pb-3">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-extrabold text-white">🎮 Mobile Games</h2>
      <p className="mt-1 text-lg text-gray-400">Fast & Secure Top-ups</p>
    </div>
    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">HOT</span>
  </div>
</section>


<section className="px-3 pb-6">
  <div className="grid grid-cols-2 gap-3">
    {[
      {
        title: "Mobile Legends",
        image: "/images/MLBB.jpg",
        href: "/product/mobile-legends",
        enabled: gameStatus.mobileLegendsEnabled,
      },

      {
        title: "MLBB Small Packs",
        image: "/images/MLBB.jpg",
        href: "/product/mobile-legends-small-packs",
        enabled: gameStatus.mobileLegendsSmallPacksEnabled,
      },
      {
        title: "Magic Chess",
        image: "/images/mcgg.jpg",
        href: "/product/magic-chess-go-go",
        enabled: gameStatus.magicChessEnabled,
      },
      {
        title: "ML Gifting",
        image: "/images/ml gifting.png",
        href: "/product/mlbb-gifting",
        enabled: gameStatus.mlGiftingEnabled,
      },
    ].map((game) => (
      <div
        key={game.title}
        className="group overflow-hidden rounded-2xl border border-white/10 bg-[#151922] shadow-lg"
      >
        {game.enabled ? (
          <Link href={game.href} className="block active:scale-95">
            <div className="relative aspect-square overflow-hidden bg-zinc-900">
              <img
                src={game.image}
                alt={game.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex h-11 items-center justify-center bg-gradient-to-b from-[#171b25] to-[#10131a] px-2">
              <h3 className="line-clamp-1 text-center text-[18px] font-bold text-white">
                {game.title}
              </h3>
            </div>
          </Link>
        ) : (
          <>
            <div className="relative aspect-square overflow-hidden bg-zinc-900">
              <img
                src={game.image}
                alt={game.title}
                className="h-full w-full object-cover grayscale"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
                  OUT OF STOCK
                </span>
              </div>
            </div>

            <div className="flex h-11 items-center justify-center bg-gradient-to-b from-[#171b25] to-[#10131a] px-2">
              <h3 className="line-clamp-1 text-center text-[18px] font-bold text-gray-400">
                {game.title}
              </h3>
            </div>
          </>
        )}
      </div>
    ))}
  </div>
</section>
      <section className="px-3 pb-8">
        <a
          href="https://whatsapp.com/channel/0029VbB4dcm23n3fVHpH0r45"
          target="_blank"
          rel="noopener noreferrer"
          className="relative block overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-br from-[#0b1610] via-[#0f4f3f] to-[#157347] px-5 py-6 text-center shadow-[0_0_18px_rgba(21,115,71,0.18)] active:scale-[0.98]"
        >
          <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-green-900/25 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-28 w-28 rounded-full bg-black/30 blur-3xl" />

          <div className="relative">
            <h2 className="text-[22px] font-extrabold leading-tight text-white">
              <img src="/images/whatsapp.svg" alt="WhatsApp" className="inline h-7 w-7 mr-2"/> JOIN OUR WHATSAPP
            </h2>

            <p className="mt-1 text-[18px] font-medium text-white">
              COMMUNITY TODAY
            </p>

            <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-white/90">
              Get instant order updates, exclusive offers, new game launches &amp; 24×7 customer support directly on WhatsApp.
            </p>

            <p className="mt-3 text-[18px] font-extrabold text-white">
              +91 85669 36666
            </p>

            <div className="mx-auto mt-4 flex max-w-[300px] items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[15px] font-extrabold text-red-600">
              <img src="/images/whatsapp.svg" alt="" className="h-5 w-5" />
              <span>JOIN WHATSAPP CHANNEL</span>
            </div>
          </div>
        </a>
      </section>


      <footer className="border-t border-white/10 bg-[#171d26] px-5 pb-16 pt-5">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-white">
            AATMA<span className="text-red-600">HUB</span>
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Fast, secure &amp; trusted digital gaming top-ups.
          </p>
      </div>

        <div className="my-4 h-px bg-white/15" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[20px] text-white">
          <div className="space-y-3">
            <a href="/" className="block">Home</a>
            <a href="/login" className="block">Login</a>
            <a href="/register" className="block">Register</a>
            <a href="/support" className="block">Customer Support</a>
          </div>

          <div className="space-y-3">
            <a href="/privacy-policy" className="block">Privacy Policy</a>
            <a href="/terms-and-conditions" className="block">Terms &amp; Conditions</a>
            <a href="/refund-policy" className="block">Refund Policy</a>
          </div>
        </div>

        <div className="my-4 h-px bg-white/15" />
<p className="text-center text-lg text-gray-300">

          All Rights Reserved © 2026 | AATMAHUB
        </p>
      </footer>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="h-full w-[82%] max-w-[330px] border-r border-white/10 bg-[#0d1017] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="text-xl font-black text-white"
              >
                Aatma<span className="text-red-600">Hub</span>
              </Link>

              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <nav className="space-y-2 p-4">
              {[
                { href: "/", label: "Home" },
                { href: "/guide", label: "How to Recharge" },
                { href: "/search", label: "Search" },
                { href: "/orders", label: "My Orders" },
                { href: "/support", label: "Customer Support" },
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/terms-and-conditions", label: "Terms & Conditions" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#151923] px-4 py-4 font-semibold text-gray-200 transition active:scale-[0.98] active:border-red-500/50 active:bg-red-500/10"
                >
                  <span>{item.label}</span>
                  <span className="text-gray-500">›</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

</main>
  );
}
