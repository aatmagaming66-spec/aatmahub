
export default function TermsPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700">
      <header className="py-6">
        <h1 className="text-4xl font-headline font-black tracking-tighter uppercase mb-1">Terms of Protocol</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Last Updated: February 2025</p>
      </header>

      <div className="space-y-8 bg-card border border-border rounded-[2.5rem] p-8">
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-primary">1. Agreement to Terms</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            By accessing the AATMA HUB platform, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-primary">2. Digital Fulfillment</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            Our services provide digital assets. All transactions are final once fulfillment is triggered. Users are responsible for providing correct Player IDs and Server IDs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-primary">3. Wallet Usage</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            Funds deposited into the AATMA HUB Wallet are non-transferable and can only be used for purchases within the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-primary">4. Governing Law</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>
        </section>
      </div>
    </div>
  );
}
