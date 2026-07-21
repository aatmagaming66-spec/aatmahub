import Link from "next/link";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#080a0f] px-4 pb-28 pt-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-semibold text-red-400">
          ← Back
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Help Center
          </p>
          <h1 className="mt-2 text-3xl font-bold">Customer Support</h1>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Choose the right support option below. Our team will help you with
            orders, payments, wallet recharges, and account-related issues.
          </p>
        </div>

        <section className="mt-7 rounded-3xl border border-red-500/20 bg-gradient-to-br from-[#1b1015] to-[#10131a] p-5 shadow-[0_18px_50px_rgba(255,45,53,0.12)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 text-2xl">
            💬
          </div>

          <h2 className="mt-4 text-xl font-bold">WhatsApp Support</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Chat with support for order, payment, wallet, or recharge help.
          </p>

          <a
            href="https://wa.me/918566936666"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-green-600 py-3.5 font-bold transition active:scale-[0.98]"
          >
            Chat on WhatsApp
          </a>
        </section>

        <section className="mt-4 rounded-3xl border border-red-500/20 bg-[#12151d] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-2xl">
            📢
          </div>

          <h2 className="mt-4 text-xl font-bold">WhatsApp Channel</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Join the official channel for announcements, offers, and updates.
          </p>

          <a
            href="https://whatsapp.com/channel/0029VbB4dcm23n3fVHpH0r45"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 font-bold text-red-400 transition active:scale-[0.98]"
          >
            Join WhatsApp Channel
          </a>
        </section>

        <section className="mt-4 rounded-3xl border border-white/10 bg-[#12151d] p-5">
          <h2 className="text-lg font-bold">Before Contacting Support</h2>

          <div className="mt-4 space-y-3 text-sm text-gray-400">
            <p>• Keep your order ID or payment screenshot ready.</p>
            <p>• Explain your issue clearly in one message.</p>
            <p>• Never share your password or OTP.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
