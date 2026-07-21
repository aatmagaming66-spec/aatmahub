export default function RefundPolicy() {
  return (
    <main className="min-h-screen bg-[#0f1117] text-white">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="mb-6 text-3xl font-extrabold">Refund Policy</h1>

        <div className="space-y-6 rounded-2xl border border-white/10 bg-[#171d26] p-5">

          <section>
            <h2 className="mb-2 text-xl font-bold">Digital Products</h2>
            <p className="text-gray-300">
              All game top-ups, gift cards and digital products are generally non-refundable once successfully delivered.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Failed Orders</h2>
            <p className="text-gray-300">
              If payment is successful but the order cannot be completed due to our fault, a full refund or replacement will be provided.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Incorrect Information</h2>
            <p className="text-gray-300">
              Refunds are not available for orders placed with incorrect Player ID, Server ID or other incorrect details submitted by the customer.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Refund Processing</h2>
            <p className="text-gray-300">
              Approved refunds are processed to the original payment method. Processing time may vary depending on the payment provider.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Need Help?</h2>
            <p className="text-gray-300">
              Contact our support team on WhatsApp: +91 85669 36666.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
