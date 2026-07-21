export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#0f1117] text-white">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="mb-6 text-3xl font-extrabold">Privacy Policy</h1>

        <div className="space-y-6 rounded-2xl border border-white/10 bg-[#171d26] p-5">

          <section>
            <h2 className="mb-2 text-xl font-bold">Information We Collect</h2>
            <p className="text-gray-300">
              We only collect the information required to complete your game top-up,
              including Player ID, Server ID, contact details and payment information.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">How We Use Your Information</h2>
            <p className="text-gray-300">
              Your information is used only for order processing, customer support,
              payment verification and service improvement.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Data Security</h2>
            <p className="text-gray-300">
              We use reasonable security measures to protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Third-Party Services</h2>
            <p className="text-gray-300">
              Payments and other services may be processed by trusted third-party providers.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Contact Us</h2>
            <p className="text-gray-300">
              WhatsApp: +91 85669 36666
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
