import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#080a0f] text-white">
      <div className="sticky top-0 z-50 flex items-center gap-4 border-b border-white/10 bg-[#11141c] px-4 py-4">
        <Link href="/" className="text-red-500 font-semibold transition-all duration-200 active:scale-95">← Back</Link>
        <h1 className="text-xl font-bold">Quick Guide</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5">

        <section className="rounded-2xl bg-[#151922] p-4">
          <h2 className="mb-3 text-lg font-bold">📖 Getting Started</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Enter your Player ID & Server ID.</li>
            <li>Verify your account details.</li>
            <li>Select your preferred package.</li>
            <li>Review your order before payment.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-[#151922] p-4">
          <h2 className="mb-3 text-lg font-bold">💳 Payment</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Complete only one payment.</li>
            <li>• Wait until payment finishes.</li>
            <li>• Don't refresh or close the page.</li>
            <li>• Pending orders usually update automatically.</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-[#151922] p-4">
          <h2 className="mb-3 text-lg font-bold">🚚 Delivery</h2>
          <ul className="space-y-2 text-gray-300">
            <li>⚡ Delivery: 1–15 minutes.</li>
            <li>⏳ May be delayed during maintenance.</li>
            <li>📦 Track from My Orders.</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-[#151922] p-4">
          <h2 className="mb-3 text-lg font-bold">💡 Tips</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Keep your Order ID.</li>
            <li>• Don't place duplicate orders.</li>
            <li>• Use a stable internet connection.</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-[#151922] p-4">
          <h2 className="mb-3 text-lg font-bold">🎧 Support</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Contact AatmaHub Support.</li>
            <li>• Share Order ID.</li>
            <li>• Payment screenshot if requested.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-red-500 bg-red-500/10 p-4">
          <h2 className="mb-3 text-lg font-bold text-red-400">⚠️ Important</h2>
          <ul className="space-y-2 text-gray-300">
            <li>✅ Check Player ID & Server ID.</li>
            <li>✅ Review your selected package.</li>
            <li>❌ Orders can't be changed after payment.</li>
          </ul>
        </section>

        <Link href="/" className="mb-6 block w-full rounded-xl bg-red-600 py-3 text-center font-semibold transition-all duration-200 active:scale-95 active:bg-red-700 active:brightness-110 active:ring-2 active:ring-red-400/60 shadow-lg shadow-red-600/20">
          ✔ I Understand, Continue
        </Link>

      </div>
    </main>
  );
}
