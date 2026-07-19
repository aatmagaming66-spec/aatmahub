import Link from "next/link";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#080a0f] text-white">
      <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-white/10 bg-[#11141c]/95 px-4 py-4 backdrop-blur">
        <Link href="/" className="text-red-500 font-semibold">
          ← Back
        </Link>
        <h1 className="text-xl font-bold">Support</h1>
      </header>

      <div className="p-4">

        <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-600/20 to-zinc-900 p-6 text-center">
          <h2 className="text-2xl font-bold">Need Help?</h2>
          <p className="mt-2 text-sm text-gray-400">
            Our support team is here to help you with your orders.
          </p>

          <a
            href="https://wa.me/918566936666"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-xl bg-red-600 px-6 py-3 font-semibold transition active:scale-95"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-6 space-y-4">

          <div className="rounded-2xl border border-white/10 bg-[#151922] p-4">
            <h3 className="font-semibold">📦 Order Support</h3>
            <p className="mt-2 text-sm text-gray-400">
              Questions about top-ups, payments or delivery.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151922] p-4">
            <h3 className="font-semibold">❓ Frequently Asked Questions</h3>
            <p className="mt-2 text-sm text-gray-400">
              Find answers to common questions quickly.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151922] p-4">
            <h3 className="font-semibold">⏰ Support Hours</h3>
            <p className="mt-2 text-sm text-gray-400">
              Monday - Sunday<br />
              9:00 AM - 11:00 PM IST
            </p>
          </div>

        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          ❤️ Thank you for choosing AatmaHub
        </p>

      </div>
    </main>
  );
}
