import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#080a0f] text-white">
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
<Link href="/guide" className="flex flex-col items-center gap-2 rounded-xl bg-zinc-900 p-3 transition-all duration-200 active:scale-95 active:brightness-125 active:ring-2 active:ring-red-500/60"><span className="text-2xl">📖</span><span className="text-xs text-white">Guide</span></Link>
<Link href="/search" className="flex flex-col items-center gap-2 rounded-xl bg-zinc-900 p-3 transition-all duration-200 active:scale-95 active:brightness-125 active:ring-2 active:ring-red-500/60"><span className="text-2xl">🔍</span><span className="text-xs text-white">Search</span></Link>
<Link href="/follow" className="flex flex-col items-center gap-2 rounded-xl bg-zinc-900 p-3 transition-all duration-200 active:scale-95 active:brightness-125 active:ring-2 active:ring-red-500/60"><span className="text-2xl">📢</span><span className="text-xs text-white">Follow</span></Link>
<Link href="/support" className="flex flex-col items-center gap-2 rounded-xl bg-zinc-900 p-3 transition-all duration-200 active:scale-95 active:brightness-125 active:ring-2 active:ring-red-500/60"><span className="text-2xl">🎧</span><span className="text-xs text-white">Support</span></Link>
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

    </main>
  );
}
