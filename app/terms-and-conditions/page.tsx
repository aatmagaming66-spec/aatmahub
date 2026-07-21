export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-[#0f1117] text-white">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="mb-6 text-3xl font-extrabold">Terms &amp; Conditions</h1>

        <div className="space-y-6 rounded-2xl border border-white/10 bg-[#171d26] p-5">
          <section>
            <h2 className="mb-2 text-xl font-bold">Order Information</h2>
            <p className="text-gray-300">
              Customers must provide the correct Player ID, Server ID and other required details.
              AatmaHub is not responsible for delivery issues caused by incorrect information.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Payments</h2>
            <p className="text-gray-300">
              Orders are processed only after successful payment confirmation.
              Prices may change without prior notice.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Delivery</h2>
            <p className="text-gray-300">
              Delivery times may vary due to game servers, maintenance, payment verification
              or other technical reasons.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Account Safety</h2>
            <p className="text-gray-300">
              We never ask for your game password. Do not share passwords, OTPs or recovery
              codes with anyone.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Service Availability</h2>
            <p className="text-gray-300">
              AatmaHub may temporarily suspend or cancel a service when a product is unavailable
              or affected by third-party restrictions.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Contact</h2>
            <p className="text-gray-300">
              For support, contact us on WhatsApp at +91 85669 36666.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
