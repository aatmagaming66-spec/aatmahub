import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#0f1117] px-5 py-10 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#171d26] p-6">
        <h1 className="text-center text-3xl font-extrabold">
          Forgot Password
        </h1>

        <p className="mt-2 text-center text-sm text-gray-400">
          Enter your email or phone number to reset your password.
        </p>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold">
            Email or Phone
          </label>
          <input
            type="text"
            placeholder="Enter email or phone"
            className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 outline-none focus:border-red-500"
          />
        </div>

        <button className="mt-6 w-full rounded-xl bg-red-500 py-3 font-bold">
          Send Reset Link
        </button>

        <p className="mt-5 text-center text-sm text-gray-400">
          <Link href="/login" className="text-red-400 font-semibold">
            Back to Login
          </Link>
        </p>
      </div>
    </main>
  );
}
