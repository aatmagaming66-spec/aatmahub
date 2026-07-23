"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type PackageItem = {
  name: string;
  price: string | number;
};

type Product = {
  categories: {
    Tokens: PackageItem[];
  };
};

const defaultProduct: Product = {
  categories: {
    Tokens: [
      { name: "16 Tokens", price: 18.35 },
      { name: "80 Tokens", price: 89.81 },
      { name: "240 Tokens", price: 271.36 },
      { name: "400 Tokens", price: 452.91 },
      { name: "560 Tokens", price: 634.46 },
      { name: "830 Tokens", price: 906.78 },
      { name: "1245 Tokens", price: 1360.66 },
      { name: "2508 Tokens", price: 2722.28 },
      { name: "4180 Tokens", price: 4537.77 },
      { name: "8360 Tokens", price: 9076.51 },
    ],
  },
};

export default function HonorOfKingsEditor() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const snapshot = await getDoc(
          doc(db, "products", "honor-of-kings")
        );

        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<Product>;

          setProduct({
            categories: {
              Tokens:
                data.categories?.Tokens ??
                defaultProduct.categories.Tokens,
            },
          });
        } else {
          setProduct(defaultProduct);
        }
      } catch (error) {
        console.error(error);
        setProduct(defaultProduct);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, []);

  function updatePackage(
    index: number,
    field: keyof PackageItem,
    value: string
  ) {
    if (!product) return;

    const packages = [...product.categories.Tokens];

    packages[index] = {
      ...packages[index],
      [field]: value,
    };

    setProduct({
      categories: {
        Tokens: packages,
      },
    });
  }

  async function saveProduct() {
    if (!product) return;

    setSaving(true);
    setMessage("");

    try {
      await setDoc(
        doc(db, "products", "honor-of-kings"),
        product
      );

      setMessage("Honor of Kings packs saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save Honor of Kings packs.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080a0f] p-6 text-white">
        Loading product...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#080a0f] p-6 text-white">
        Product not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080a0f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link
          href="/super-admin/products"
          className="font-bold text-red-500"
        >
          ← Back
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold">
          Edit Honor of Kings
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Edit token pack names and prices.
        </p>

        <div className="mt-7 space-y-3">
          {product.categories.Tokens.map((item, index) => (
            <div
              key={index}
              className="space-y-2 rounded-2xl border border-white/10 bg-[#11141c] p-4"
            >
              <input
                value={item.name}
                onChange={(event) =>
                  updatePackage(index, "name", event.target.value)
                }
                placeholder="Package name"
                className="w-full rounded-lg bg-black/30 p-3 outline-none focus:ring-1 focus:ring-red-500"
              />

              <input
                value={item.price}
                onChange={(event) =>
                  updatePackage(index, "price", event.target.value)
                }
                placeholder="Price"
                inputMode="decimal"
                className="w-full rounded-lg bg-black/30 p-3 outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          ))}
        </div>

        {message && (
          <p className="mt-5 text-center text-sm text-zinc-300">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={saveProduct}
          disabled={saving}
          className="mt-5 w-full rounded-xl bg-red-600 p-4 font-extrabold active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </main>
  );
}
