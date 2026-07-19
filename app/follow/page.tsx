import Link from "next/link";

export default function FollowPage() {
  const socials = [
  {
    name: "WhatsApp",
    icon: "💬",
    desc: "Join our official WhatsApp Channel",
    href: "https://whatsapp.com/channel/0029VbB4dcm23n3fVHpH0r45",
  },
  {
    name: "Instagram",
    icon: "📸",
    desc: "Follow us for latest posts & updates",
    href: "https://www.instagram.com/aatma_hub?igsh=MWVuYmg2dXV5bnZuMQ==",
  },
  {
    name: "Facebook",
    icon: "🌐",
    desc: "Like our official Facebook page",
    href: "https://www.facebook.com/profile.php?id=61590318340164",
  },
];

  return (
    <main className="min-h-screen bg-[#080a0f] text-white">
      <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-white/10 bg-[#11141c]/95 px-4 py-4 backdrop-blur">
        <Link href="/" className="text-red-500 font-semibold">
          ← Back
        </Link>
        <h1 className="text-xl font-bold">Follow AatmaHub</h1>
      </header>

      <div className="p-4">
        <div className="rounded-3xl bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 p-6 text-center">
          <div className="text-5xl">❤️</div>
          <h2 className="mt-3 text-2xl font-bold">Stay Connected</h2>
          <p className="mt-2 text-sm text-gray-400">
            Follow us for updates, offers and announcements.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {socials.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#151922] p-4 transition-all duration-200 active:scale-95 active:border-red-500"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-2xl">
                  <img src={item.name==="WhatsApp"?"/images/whatsapp.svg":item.name==="Instagram"?"/images/instagram.png":"/images/facebook.svg"} alt={item.name} className="h-8 w-8 object-contain" />
                </div>

                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-400">
                    {item.desc}
                  </div>
                </div>
              </div>

              <span className="text-xl text-red-500">→</span>
            </a>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#151922] p-5 text-center">
          <h3 className="font-semibold">✨ Never Miss</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-400">
            <li>• Top-up Offers</li>
            <li>• New Games</li>
            <li>• Service Updates</li>
            <li>• Giveaway Announcements</li>
          </ul>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Made with ❤️ by AatmaHub
        </p>
      </div>
    </main>
  );
}
