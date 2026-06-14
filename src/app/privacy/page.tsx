
export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full p-4 space-y-10 animate-in fade-in duration-700">
      <header className="py-6">
        <h1 className="text-4xl font-headline font-black tracking-tighter uppercase mb-1">Privacy Encryption</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">Security Protocol v2.5</p>
      </header>

      <div className="space-y-8 bg-card border border-border rounded-[2.5rem] p-8">
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-accent">1. Data Collection</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            We collect minimal data required for operations: Name, Email, Phone Number, and Game Identifiers. We do not store full payment card details on our servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-accent">2. Security Measures</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            All data is transmitted via SSL encryption. We use industry-standard hashing for passwords and secure API tokens for third-party integrations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-accent">3. Third-Party Sharing</h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            Data is only shared with verified partners (PhonePe, Smile.one, UniPin) strictly for the purpose of transaction processing and digital asset fulfillment.
          </p>
        </section>
      </div>
    </div>
  );
}
