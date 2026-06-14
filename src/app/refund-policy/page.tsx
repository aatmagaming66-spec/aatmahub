
export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700">
      <header className="py-6">
        <h1 className="text-4xl font-headline font-black tracking-tighter uppercase mb-1">Refund Registry</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Digital Asset Protection Policy</p>
      </header>

      <div className="space-y-8 bg-card border border-border rounded-[2.5rem] p-8">
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">1. Digital Item Finality</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            Due to the nature of digital goods, refunds are generally not provided once an order is marked as 'Completed' or 'Processing'.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">2. Eligible Refunds</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            Refunds to the original payment source or HUB Wallet may be issued if a service is unavailable or if a transaction fails to deliver within 24 hours of payment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">3. User Errors</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            AATMA HUB is not responsible for assets delivered to incorrect IDs provided by the user. No refunds will be issued in cases of user input error.
          </p>
        </section>
      </div>
    </div>
  );
}
