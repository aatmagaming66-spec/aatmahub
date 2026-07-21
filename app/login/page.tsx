import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0f1117] px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-extrabold">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-sm text-gray-400">
          Login to continue to AatmaHub
        </p>

        <div className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-[#171d26] p-5">
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
              placeholder="Enter password"
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-red-400"
            >
              Forgot Password?
            </Link>
          </div>

          <button className="w-full rounded-xl bg-red-500 px-4 py-3 font-bold text-white">
            Login
          </button>

          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-red-400">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
