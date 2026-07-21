import Link from "next/link";

const details = [
  ["Developer", "Aatma Official"],
  ["Website", "AatmaHub"],
  ["Email", "shivatetz@gmail.com"],
  ["Version", "v1.0.0"],
  ["Technology", "Next.js 16 • React 19 • Tailwind CSS"],
  ["Platform", "Android • Web"],
];

export default function DeveloperPage() {
  return (
    <main className="min-h-screen bg-[#080a0f] px-4 pb-28 pt-6 text-white">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-red-400"
        >
          ← Back
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[28px] border border-red-500/25 bg-gradient-to-br from-[#2a0d14] via-[#17121a] to-[#0d1118] p-6 shadow-[0_18px_60px_rgba(255,45,53,0.18)]">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-red-900/20 blur-3xl" />

          <div className="relative text-center">
            <div className="mx-auto h-28 w-28 overflow-hidden rounded-3xl border border-red-500/30 shadow-[0_0_35px_rgba(255,45,53,0.35)]">
              <img
                src="/images/dev.png"
                alt="Aatma Official"
                className="h-full w-full object-cover"
              />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-red-400">
              Developer Profile
            </p>

            <h1 className="mt-3 text-3xl font-extrabold">
              Aatma Official
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Designer and developer of the AatmaHub digital gaming platform.
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-[#12151d] p-5">
          <h2 className="text-lg font-bold">Developer Information</h2>

          <div className="mt-4 divide-y divide-white/10">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 py-3 text-sm"
              >
                <span className="shrink-0 text-gray-500">{label}</span>

                {label === "Email" ? (
                  <a
                    href="mailto:shivatetz@gmail.com"
                    className="break-all text-right font-semibold text-red-400"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-right font-semibold text-white">
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-red-500/20 bg-red-500/5 p-5">
          <h2 className="text-lg font-bold">About AatmaHub</h2>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            AatmaHub is built to provide a fast, secure, and reliable experience
            for gaming top-ups, digital products, wallet services, and customer
            support.
          </p>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-[#12151d] p-5">
          <h2 className="text-lg font-bold">Technical Support</h2>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            For website bugs, technical issues, or development enquiries,
            contact the developer by email.
          </p>

          <a
            href="mailto:shivatetz@gmail.com"
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-red-600 py-3.5 font-bold transition active:scale-[0.98]"
          >
            Contact Developer
          </a>
        </section>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
          <p className="font-semibold text-white">
            Proudly Made in 🇮🇳 India
          </p>

          <p className="mt-2 text-xs text-gray-500">
            © 2026 AatmaHub. All Rights Reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
