"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    label: "Home",
    icon: <path d="M3 10.8 12 3l9 7.8V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.8Z" />,
  },
  {
    href: "/wallet",
    label: "Wallet",
    icon: (
      <>
        <path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" />
        <path d="M5 6V4h11" />
      </>
    ),
  },
  {
    href: "/orders",
    label: "Orders",
    icon: (
      <>
        <path d="M5 4h14v17l-3-2-4 2-4-2-3 2V4Z" />
        <path d="M8 9h8M8 13h6" />
      </>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-red-500/20 bg-[#12090d]/95 shadow-[0_-10px_35px_rgba(255,45,53,0.22)] backdrop-blur-2xl">
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-1 pb-[calc(env(safe-area-inset-bottom)+6px)]">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex min-h-[64px] flex-col items-center justify-center gap-1 transition ${
                active ? "text-white" : "text-gray-300"
              }`}
            >
              {active && (
                <><span className="absolute top-1 h-1 w-10 rounded-full bg-gradient-to-r from-red-400 via-red-500 to-red-700 shadow-[0_0_14px_rgba(255,45,53,0.9)]" /><span className="absolute inset-x-3 bottom-1 top-2 -z-10 rounded-2xl bg-red-500/10" /></>
              )}

              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {item.icon}
              </svg>

              <span className="text-[11px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
