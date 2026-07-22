"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Order = {
  id: string;
  orderId?: string;
  userId?: string;
  game?: string;
  packageName?: string;
  amount?: number | string;
  status?: string;
  createdAt?: any;
};

const tabs = ["All", "Pending", "Success", "Failed"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })) as Order[]
        );
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load orders:", error);
        setLoading(false);
      }
    );
  }, []);

  const filteredOrders = useMemo(() => {
    const value = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = String(order.status || "pending").toLowerCase();

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Success"
          ? status === "success" || status === "completed"
          : status === activeTab.toLowerCase());

      const matchesSearch =
        !value ||
        String(order.orderId || order.id).toLowerCase().includes(value) ||
        String(order.userId || "").toLowerCase().includes(value) ||
        String(order.game || "").toLowerCase().includes(value);

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, search]);

  return (
    <main className="min-h-screen bg-[#07090e] px-4 pb-28 pt-5 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/super-admin" className="font-bold text-red-500">
          ← Back
        </Link>

        <h1 className="mt-4 text-4xl font-black">Orders</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Manage all customer orders.
        </p>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search Order ID, UID or game"
          className="mt-5 w-full rounded-2xl border border-white/10 bg-[#141821] p-4 outline-none focus:border-red-500"
        />

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-full border px-5 py-2 font-semibold active:scale-95 ${
                activeTab === tab
                  ? "border-red-500 bg-red-500/15 text-red-400"
                  : "border-white/10 bg-[#141821] text-zinc-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-[#141821] p-8 text-center text-zinc-500">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
              No orders found
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = String(order.status || "pending").toLowerCase();

              return (
                <Link
                  key={order.id}
                  href={`/super-admin/orders/${order.id}`}
                  className="block rounded-2xl border border-white/10 bg-[#11141c] p-4 active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-zinc-500">Order ID</p>
                      <h2 className="mt-1 font-extrabold">
                        {order.orderId || order.id}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        status === "success" || status === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : status === "failed"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500">Game</span>
                      <span className="font-semibold">
                        {order.game || "Unknown"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500">Package</span>
                      <span className="text-right font-semibold">
                        {order.packageName || "Unknown"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500">Amount</span>
                      <span className="font-extrabold text-red-400">
                        ₹{order.amount ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500">User UID</span>
                      <span className="max-w-[220px] truncate text-xs">
                        {order.userId || "Unknown"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
