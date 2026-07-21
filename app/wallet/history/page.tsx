import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

export default function WalletHistoryPage() {
  return (
    <AuthGuard>
    <main className="min-h-screen bg-[#0f1117] p-5 text-white">
      <header className="flex items-center gap-4">
        <Link
          href="/wallet"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-xl"
        >
          ←
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Wallet History</h1>
          <p className="text-sm text-gray-400">Your wallet transactions</p>
        </div>
      </header>

      <section className="mt-8 rounded-2xl border border-dashed border-red-500/30 bg-[#181c24] px-6 py-12 text-center">
        <svg
          viewBox="0 0 24 24"
          className="mx-auto h-14 w-14 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M5 4h14v17l-3-2-4 2-4-2-3 2V4Z" />
          <path d="M8 9h8M8 13h6" />
        </svg>

        <h2 className="mt-5 text-lg font-bold">No Transactions Yet</h2>

        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-400">
          Completed wallet recharge and purchase transactions will appear here.
        </p>

        <Link
          href="/wallet/add-money"
          className="mt-6 inline-block rounded-xl bg-red-600 px-6 py-3 font-semibold"
        >
          Add Money
        </Link>
      </section>
    </main>
    </AuthGuard>
  );
}
