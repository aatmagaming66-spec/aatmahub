import Link from "next/link";

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-[#0f1117] text-white p-5">
      <h1 className="text-2xl font-bold text-red-500">Wallet</h1>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-red-400/30 bg-gradient-to-br from-red-600 via-red-800 to-[#181c24] p-6 shadow-[0_12px_35px_rgba(220,38,38,0.25)]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-red-100">Available Balance</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              AatmaHub Wallet
            </span>
          </div>

          <h2 className="mt-3 text-4xl font-bold">₹0.00</h2>
          <p className="mt-2 text-xs text-red-100/70">
            Manually updated after payment confirmation
          </p>

        <Link href="/wallet/add-money" className="mt-6 block w-full rounded-xl bg-red-600 py-3 text-center font-semibold hover:bg-red-700">
          Add Money
        </Link>
        </div>
      </div>



      <section className="mt-6 rounded-2xl border border-red-500/20 bg-[#181c24] p-5">
        <h2 className="text-lg font-bold">Wallet Benefits</h2>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <p className="text-sm text-gray-300">Faster checkout using wallet balance.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <p className="text-sm text-gray-300">Secure manual verification by AatmaHub.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">🎮</span>
            <p className="text-sm text-gray-300">Use wallet balance for game top-ups.</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-[#181c24] p-3 text-center">
          <p className="text-xs text-gray-400">Status</p>
          <p className="mt-1 font-bold text-green-400">Active</p>
        </div>

        <div className="rounded-xl border border-yellow-500/20 bg-[#181c24] p-3 text-center">
          <p className="text-xs text-gray-400">Pending</p>
          <p className="mt-1 font-bold text-yellow-400">0</p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-[#181c24] p-3 text-center">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="mt-1 font-bold text-blue-400">0</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link href="/wallet/add-money" className="rounded-2xl border border-red-500/20 bg-[#181c24] p-4 text-center">
          <div className="text-2xl">💳</div>
          <p className="mt-2 font-semibold">Add Money</p>
        </Link>

        <Link href="/wallet/history" className="rounded-2xl border border-red-500/20 bg-[#181c24] p-4 text-center">
          <div className="text-2xl">🧾</div>
          <p className="mt-2 font-semibold">History</p>
        </Link>
      </div>


      <section className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
        <h2 className="text-lg font-bold text-yellow-400">Wallet Rules</h2>

        <ul className="mt-4 space-y-2 text-sm text-gray-300">
          <li>• Wallet recharge is verified manually.</li>
          <li>• Balance is added after payment confirmation.</li>
          <li>• Do not send multiple requests for the same payment.</li>
          <li>• Keep your payment screenshot until recharge is completed.</li>
          <li>• Contact support if your request remains pending.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-[#181c24] p-5">
        <h2 className="text-lg font-bold">How It Works</h2>

        <div className="mt-5 space-y-4">
          {[
            ["1", "Enter Amount", "Enter the amount you want to add."],
            ["2", "Send Request", "Submit the request through WhatsApp."],
            ["3", "Make Payment", "Admin will send the payment details."],
            ["4", "Wallet Updated", "Balance will be added after confirmation."],
          ].map(([number, title, description]) => (
            <div key={number} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold">
                {number}
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-gray-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <span className="text-xs text-red-400">View All</span>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-red-500/30 bg-[#181c24] px-5 py-10 text-center">
          <div className="text-5xl">💼</div>
          <p className="mt-4 font-semibold">No Transactions Yet</p>
          <p className="mt-2 text-sm text-gray-400">
            Your wallet activity will appear here after you add money or make a purchase.
          </p>
        </div>
      </div>
    </main>
  );
}
