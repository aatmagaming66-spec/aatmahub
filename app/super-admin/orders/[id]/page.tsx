"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);

  async function loadOrder() {
    const snap = await getDoc(doc(db, "orders", String(id)));

    if (snap.exists()) {
      setOrder({ id: snap.id, ...snap.data() });
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function updateStatus(status: string) {
    await updateDoc(doc(db, "orders", String(id)), { status });

    setOrder((current: any) => ({
      ...current,
      status,
    }));
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090e] text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090e] p-4 text-white">
      <button
        onClick={() => router.back()}
        className="mb-5 font-bold text-red-500"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-black">Order Details</h1>

      <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#11141c] p-4">
        <p>
          <b>Game:</b> {order.game}
        </p>

        <p>
          <b>Package:</b> {order.package}
        </p>

        <p>
          <b>Amount:</b> ₹{order.amount}
        </p>

        <p>
          <b>Player ID:</b> {order.playerId}
        </p>

        <p>
          <b>Server ID:</b> {order.serverId}
        </p>

        <p>
          <b>Smile Product:</b> {order.smileProduct}
        </p>

        <p>
          <b>Smile Product ID:</b> {order.smileProductId}
        </p>

        <p>
          <b>Payment Status:</b> {order.paymentStatus}
        </p>

        <p>
          <b>Order Status:</b> {order.status}
        </p>
      </div>



      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => updateStatus("pending")}
          className="rounded-xl bg-yellow-600 p-3 font-bold"
        >
          Mark Pending
        </button>

        <button
          onClick={() => updateStatus("failed")}
          className="rounded-xl bg-red-600 p-3 font-bold"
        >
          Mark Failed
        </button>
      </div>
    </main>
  );
}
