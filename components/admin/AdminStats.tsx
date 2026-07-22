"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Order = {
  status?: string;
  amount?: number | string;
};

export default function AdminStats() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState(0);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => doc.data() as Order));
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.size);
    });

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, []);

  const stats = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let failed = 0;
    let revenue = 0;

    orders.forEach((order) => {
      const status = String(order.status || "pending").toLowerCase();
      const amount =
        Number(String(order.amount ?? 0).replace(/[₹,\s]/g, "")) || 0;

      if (status === "pending") pending += 1;
      if (status === "success" || status === "completed") {
        completed += 1;
        revenue += amount;
      }
      if (status === "failed") failed += 1;
    });

    return {
      pending,
      completed,
      failed,
      revenue,
    };
  }, [orders]);

  const cards = [
    { label: "Total Orders", value: orders.length },
    { label: "Total Users", value: users },
    { label: "Pending", value: stats.pending },
    { label: "Completed", value: stats.completed },
    { label: "Failed", value: stats.failed },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}` },
  ];

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#141821] p-4"
        >
          <p className="text-sm font-semibold text-zinc-400">{card.label}</p>
          <h2 className="text-2xl font-black text-white">{card.value}</h2>
        </div>
      ))}
    </div>
  );
}
