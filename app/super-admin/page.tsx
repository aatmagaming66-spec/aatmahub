"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Order = {
  status?: string;
  amount?: number | string;
  createdAt?: any;
};

const menuItems = [
  {
    name: "Orders",
    description: "View and manage customer orders",
    href: "/super-admin/orders",
    icon: "▣",
  },
  {
    name: "Products",
    description: "Manage games, packages and pricing",
    href: "/super-admin/products",
    icon: "◇",
  },
  {
    name: "WhatsApp",
    description: "Manage support number and channel",
    href: "/super-admin/whatsapp",
    icon: "◉",
  },
  {
    name: "General",
    description: "Manage general store settings",
    href: "/super-admin/general",
    icon: "⚙",
  },
  {
    name: "Admins",
    description: "Manage admin accounts and permissions",
    href: "/super-admin/admins",
    icon: "♜",
  },
];

function getOrderDate(createdAt: any): Date | null {
  if (!createdAt) return null;

  if (typeof createdAt.toDate === "function") {
    return createdAt.toDate();
  }

  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function SuperAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const liveOrders = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as Order[];

        console.log("LIVE ORDERS:", liveOrders);
        setOrders(liveOrders);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load dashboard:", error);
        setLoading(false);
      }
    );
  }, []);

  const dashboard = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let pending = 0;
    let success = 0;
    let failed = 0;

    let todayRevenue = 0;
    let monthRevenue = 0;
    let lifetimeRevenue = 0;

    orders.forEach((order) => {
      const status = String(order.status || "pending").toLowerCase();
      const isSuccess = status === "success" || status === "completed";

      if (isSuccess) {
        success += 1;

        const amount = Number(order.amount) || 0;
        const orderDate = getOrderDate(order.createdAt);

        lifetimeRevenue += amount;

        if (orderDate && orderDate >= monthStart) {
          monthRevenue += amount;
        }

        if (orderDate && orderDate >= todayStart) {
          todayRevenue += amount;
        }
      } else if (status === "failed") {
        failed += 1;
      } else {
        pending += 1;
      }
    });

    return {
      total: orders.length,
      pending,
      success,
      failed,
      todayRevenue,
      monthRevenue,
      lifetimeRevenue,
    };
  }, [orders]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <main className="min-h-screen bg-[#07090e] px-4 pb-28 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <section className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-[#171118] via-[#101219] to-[#0b0d12] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-xl text-red-400">
                ♛
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">
                  AatmaHub
                </p>
                <p className="text-xs text-zinc-500">Control Center</p>
              </div>
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight">
              Super <span className="text-red-500">Admin</span>
            </h1>

            <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-400">
              Manage your store, products and orders from one place.
            </p>


          </div>
        </section>

        <section className="mt-5">
          <h2 className="mb-2 flex items-center gap-2 text-base font-black">📊 Store Overview</h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Orders", value: dashboard.total, color: "text-white" },
              { label: "Pending", value: dashboard.pending, color: "text-orange-400" },
              { label: "Success", value: dashboard.success, color: "text-green-400" },
              { label: "Failed", value: dashboard.failed, color: "text-red-400" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-[#11141c] px-4 py-3"
              >
                <p className="text-sm text-zinc-500">{item.label}</p>
                <p className={`mt-1 text-2xl font-black ${item.color}`}>
                  {loading ? "—" : item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h2 className="mb-2 flex items-center gap-2 text-base font-black">💰 Revenue</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#11141c] p-4">
              <p className="text-sm text-zinc-500">Today</p>
              <p className="mt-1 text-xl font-black text-green-400">
                {loading ? "—" : formatMoney(dashboard.todayRevenue)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#11141c] p-4">
              <p className="text-sm text-zinc-500">This Month</p>
              <p className="mt-1 text-xl font-black text-green-400">
                {loading ? "—" : formatMoney(dashboard.monthRevenue)}
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-white/10 bg-[#11141c] px-4 py-3">
              <p className="text-sm text-zinc-500">Lifetime</p>
              <p className="mt-1 text-xl font-black text-green-400">
                {loading ? "—" : formatMoney(dashboard.lifetimeRevenue)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0d1017] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-gradient-to-r from-[#151821] to-[#10131a] p-4 transition active:scale-[0.98] active:border-red-500/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/[0.08] text-xl font-bold text-red-400">
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-extrabold">{item.name}</h2>
                  <p className="mt-1 truncate text-sm text-zinc-500">
                    {item.description}
                  </p>
                </div>

                <span className="text-2xl text-zinc-500 transition group-active:translate-x-1 group-active:text-red-400">
                  ›
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
