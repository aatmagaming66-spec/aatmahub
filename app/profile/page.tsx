import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#0f1117] px-5 py-8 text-white">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#171d26] p-5 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-3xl font-extrabold">
            A
          </div>

          <h1 className="mt-4 text-2xl font-extrabold">AatmaHub User</h1>
          <p className="mt-1 text-sm text-gray-400">
            user@example.com
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#171d26] p-4 text-center">
            <p className="text-2xl font-extrabold">0</p>
            <p className="mt-1 text-xs text-gray-400">Total Orders</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171d26] p-4 text-center">
            <p className="text-2xl font-extrabold text-yellow-400">0</p>
            <p className="mt-1 text-xs text-gray-400">Pending</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171d26] p-4 text-center">
            <p className="text-2xl font-extrabold text-green-400">0</p>
            <p className="mt-1 text-xs text-gray-400">Completed</p>
          </div>
        </div>

        <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-[#171d26] p-4">
          <Link
            href="/orders"
            className="flex items-center justify-between rounded-xl bg-[#0f1117] px-4 py-4"
          >
            <span>My Orders</span>
            <span>→</span>
          </Link>

          <Link
            href="/privacy-policy"
            className="flex items-center justify-between rounded-xl bg-[#0f1117] px-4 py-4"
          >
            <span>Privacy Policy</span>
            <span>→</span>
          </Link>

          <Link
            href="/terms-and-conditions"
            className="flex items-center justify-between rounded-xl bg-[#0f1117] px-4 py-4"
          >
            <span>Terms &amp; Conditions</span>
            <span>→</span>
          </Link>

          <button className="w-full rounded-xl bg-red-500 px-4 py-4 font-bold">
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
