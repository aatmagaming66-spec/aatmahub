import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#0f1117] px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-extrabold">
          Create Account
        </h1>

        <p className="mt-2 text-center text-sm text-gray-400">
          Register to continue with AatmaHub
        </p>

        <div className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-[#171d26] p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email or Phone
            </label>
            <input
              type="text"
              placeholder="Enter email or phone"
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>
            <input
              type="password"
              placeholder="Create password"
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <button className="w-full rounded-xl bg-red-500 px-4 py-3 font-bold text-white">
            Register
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-red-400">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
