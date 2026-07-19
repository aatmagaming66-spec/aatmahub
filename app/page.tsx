import Link from "next/link";
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#080a0f] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#11141c]/95 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-4xl font-black tracking-tight">
            Aatma<span className="text-[#ff4d5a]">Hub</span>
          </h1>

          <div className="flex gap-2">
            <button
              aria-label="Cart"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#181c26]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="20" r="1" />
                <circle cx="19" cy="20" r="1" />
                <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
              </svg>
            </button>

            <button
              aria-label="Menu"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#181c26]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
<section className="px-3 pt-3">
  <img src="/images/aatmahub-banner.png" alt="AatmaHub Banner" className="w-full rounded-2xl scale-[1.08] object-cover" />
</section>
<section className="grid grid-cols-4 gap-3 px-3 py-4">
  <Link
    href="/guide"
    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#4a0f16] via-[#2b0c12] to-[#14090d] px-2 py-2 shadow-[0_0_18px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition active:scale-95 active:border-red-400"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/15 bg-gradient-to-b from-[#17191f] to-[#08090d] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_5px_12px_rgba(0,0,0,0.5)]">
      <BookOpenIcon className="h-6 w-6 text-white" strokeWidth={1.8} />
    </div>
    <span className="text-xs font-medium text-white">Guide</span>
  </Link>

  <Link
    href="/search"
    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#4a0f16] via-[#2b0c12] to-[#14090d] px-2 py-2 shadow-[0_0_18px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition active:scale-95 active:border-red-400"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/15 bg-gradient-to-b from-[#17191f] to-[#08090d] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_5px_12px_rgba(0,0,0,0.5)]">
      <MagnifyingGlassIcon className="h-6 w-6 text-white" strokeWidth={1.8} />
    </div>
    <span className="text-xs font-medium text-white">Search</span>
  </Link>

  <Link
    href="/follow"
    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#4a0f16] via-[#2b0c12] to-[#14090d] px-2 py-2 shadow-[0_0_18px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition active:scale-95 active:border-red-400"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/15 bg-gradient-to-b from-[#17191f] to-[#08090d] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_5px_12px_rgba(0,0,0,0.5)]">
      <GlobeAltIcon className="h-6 w-6 text-white" strokeWidth={1.8} />
    </div>
    <span className="text-xs font-medium text-white">Follow</span>
  </Link>

  <Link
    href="/support"
    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#4a0f16] via-[#2b0c12] to-[#14090d] px-2 py-2 shadow-[0_0_18px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition active:scale-95 active:border-red-400"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/15 bg-gradient-to-b from-[#17191f] to-[#08090d] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_5px_12px_rgba(0,0,0,0.5)]">
      <ShieldCheckIcon className="h-6 w-6 text-white" strokeWidth={1.8} />
    </div>
    <span className="text-xs font-medium text-white">Support</span>
  </Link>
</section>
<section className="overflow-hidden rounded-xl mx-3 my-3 border border-red-500/40 bg-gradient-to-r from-[#6b0f1a] via-[#b91c1c] to-[#6b0f1a] py-2 shadow-[0_0_20px_rgba(239,68,68,0.35)]">
  <div className="animate-marquee flex min-w-max items-center gap-8 whitespace-nowrap text-sm font-medium text-white">
    <span>⚡ Fast Mobile Legends Top-Up</span>
    <span className="text-red-400">•</span>
    <span>🎮 Magic Chess Top-Up Available</span>
    <span className="text-red-400">•</span>
    <span>💬 ML Gifting, HOK & BGMI via WhatsApp</span>
    <span className="text-red-400">•</span>
    <span>🔒 Safe & Secure Orders</span>

    <span>⚡ Fast Mobile Legends Top-Up</span>
    <span className="text-red-400">•</span>
    <span>🎮 Magic Chess Top-Up Available</span>
    <span className="text-red-400">•</span>
    <span>💬 ML Gifting, HOK & BGMI via WhatsApp</span>
    <span className="text-red-400">•</span>
    <span>🔒 Safe & Secure Orders</span>
  </div>
</section>

<section className="px-4 pb-3">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-extrabold text-white">🎮 Mobile Games</h2>
      <p className="mt-1 text-sm text-gray-400">Fast & Secure Top-ups</p>
    </div>
    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">HOT</span>
  </div>
</section>


<section className="px-3 pb-6">
  <div className="grid grid-cols-3 gap-3">
    {[
      {
        title: "Mobile Legends",
        image: "/images/MLBB.jpg",
        href: "/product/mobile-legends",
      },
      {
        title: "Magic Chess",
        image: "/images/mcgg.jpg",
        href: "/product/magic-chess",
      },
      {
        title: "ML Gifting",
        image: "/images/ml gifting.png",
        href: "/product/mlbb-gifting",
      },
      {
        title: "HOK",
        image: "/images/honor-of-kings.webp",
        href: "/product/honor-of-kings",
      },
      {
        title: "BGMI",
        image: "/images/BGMI.jpg",
        href: "/product/bgmi",
      },
    ].map((game) => (
      <Link
        key={game.title}
        href={game.href}
        className="group overflow-hidden rounded-2xl border border-white/10 bg-[#151922] shadow-lg transition-all duration-200 active:scale-95 active:border-red-500/60 active:shadow-red-500/20"
      >
        <div className="relative aspect-square overflow-hidden bg-zinc-900">
          <img
            src={game.image}
            alt={game.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex h-11 items-center justify-center bg-gradient-to-b from-[#171b25] to-[#10131a] px-2">
          <h3 className="line-clamp-1 text-center text-[13px] font-semibold leading-tight text-white">
            {game.title}
          </h3>
        </div>
      </Link>
    ))}
  </div>
</section>

    </main>
  );
}
