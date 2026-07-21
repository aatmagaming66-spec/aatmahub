"use client";

import Image from "next/image";
import { useState } from "react";

const services = [
  {
    name: "Skin Gifting",
    description: "Request any available Mobile Legends skin through WhatsApp.",
    icon: "🎨",
  },
  {
    name: "Starlight Card Gifting",
    description: "Standard Starlight Card gifting with manual confirmation.",
    icon: "⭐",
  },
  {
    name: "Premium Starlight Gifting",
    description: "Premium Starlight gifting processed through WhatsApp.",
    icon: "💎",
  },
  {
    name: "Charisma Gifting",
    description: "Send charisma gifts after confirming quantity and price.",
    icon: "💖",
  },
  {
    name: "In-Game Gifts",
    description: "Other supported in-game gifts and event items.",
    icon: "🎁",
  },
  {
    name: "Instream Gifts",
    description: "Request supported stream and creator gifting items.",
    icon: "📺",
  },
  {
    name: "Other Gifts",
    description: "Ask our team about any other Mobile Legends gifting service.",
    icon: "✨",
  },
];

export default function MlbbGiftingPage() {
  const [selected, setSelected] = useState<(typeof services)[number] | null>(null);

  const openWhatsApp = () => {
    if (!selected) return;

    const message = encodeURIComponent(
      `Hello AatmaHub, I want to order ${selected.name} for Mobile Legends. Please share availability, price and delivery details.`
    );

    window.open(`https://wa.me/918566936666?text=${message}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-md pb-10">
        <a
          href="/"
          className="m-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold"
        >
          ← Back
        </a>

        <div className="relative">
          <Image
            src="/images/ml gifting.png"
            alt="Mobile Legends Gifting"
            width={1200}
            height={450}
            priority
            className="h-56 w-full rounded-b-3xl object-cover"
          />
          <div className="absolute inset-0 rounded-b-3xl bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-5 left-5">
            <h1 className="text-3xl font-extrabold">ML Gifting</h1>
            <p className="text-red-400">Manual WhatsApp Processing</p>
          </div>
        </div>

        <section className="p-4">
          <p className="text-sm leading-6 text-gray-300">
            Select the gifting service you need. Our team will confirm
            availability, price, account requirements and delivery time on
            WhatsApp.
          </p>

          <h2 className="mb-3 mt-6 text-sm font-semibold">Select a Service</h2>

          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {services.map((service) => (
              <button
                key={service.name}
                onClick={() => setSelected(service)}
                className={`min-w-[125px] flex-1 rounded-2xl border p-3 text-left transition ${
                  selected?.name === service.name
                    ? "border-red-500 bg-[#241313]"
                    : "border-[#2d2d2d] bg-[#171717]"
                }`}
              >
                <div className="text-3xl">{service.icon}</div>
                <h3 className="mt-3 text-sm font-semibold">{service.name}</h3>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-400">
                  {service.description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-green-400">Available 24/7</p>
              <p className="text-xs text-gray-400">Typical response within 5–15 minutes</p>
            </div>
            <span className="text-2xl">💬</span>
          </div>

          <div className="mt-5 rounded-2xl border border-red-500/20 bg-[#151515] p-4">
            <h2 className="text-sm font-semibold">How It Works</h2>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="font-semibold text-red-400">1. Select Service</p>
                <p className="mt-1 text-gray-400">
                  Choose the gifting service you want.
                </p>
              </div>

              <div>
                <p className="font-semibold text-red-400">
                  2. Continue on WhatsApp
                </p>
                <p className="mt-1 text-gray-400">
                  Send the prepared request to our team.
                </p>
              </div>

              <div>
                <p className="font-semibold text-red-400">
                  3. Confirm Details
                </p>
                <p className="mt-1 text-gray-400">
                  We will confirm price, availability and requirements.
                </p>
              </div>

              <div>
                <p className="font-semibold text-red-400">
                  4. Payment and Delivery
                </p>
                <p className="mt-1 text-gray-400">
                  Complete payment and receive the gift after confirmation.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#2d2d2d] bg-[#151515] p-4">
            <h2 className="text-sm font-semibold">Important Notes</h2>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-gray-400">
              <li>• Some gifts may require an in-game friendship period.</li>
              <li>• Availability depends on current events and region.</li>
              <li>• Final price may vary according to the selected item.</li>
              <li>• Never share your password or OTP with anyone.</li>
            </ul>
          </div>

          <button
            disabled={!selected}
            onClick={openWhatsApp}
            className={`mt-6 w-full rounded-xl py-4 font-semibold transition ${
              selected
                ? "bg-green-600 hover:bg-green-700"
                : "cursor-not-allowed bg-gray-700 text-gray-400 opacity-60"
            }`}
          >
            {selected ? `💬 Continue on WhatsApp` : "Select a Service"}
          </button>
        </section>
      </div>
    </main>
  );
}
