"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type PackageItem = {
  name: string;
  bonus: string;
  price: string | number;
  image: string;
  smileProductId?: string;
};

type Product = {
  name: string;
  banner: string;
  categories: Record<string, PackageItem[]>;
};

export default function MobileLegendsEditor() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const snapshot = await getDoc(doc(db, "products", "mobile-legends"));

      if (snapshot.exists()) {
        setProduct(snapshot.data() as Product);
      }

      setLoading(false);
    }

    loadProduct();
  }, []);

  function updatePackage(
    category: string,
    index: number,
    field: keyof PackageItem,
    value: string
  ) {
    if (!product) return;

    const categories = { ...product.categories };
    const items = [...categories[category]];

    items[index] = {
      ...items[index],
      [field]: value,
    };

    categories[category] = items;
    setProduct({ ...product, categories });
  }

  async function saveProduct() {
    if (!product) return;

    setSaving(true);
    setMessage("");

    try {
      const blockedPackages = new Set([
        "1412 Diamonds",
        "7720 Diamonds",
      ]);

      const cleanedProduct = {
        ...product,
        categories: Object.fromEntries(
          Object.entries(product.categories).map(([category, items]) => [
            category,
            items.filter((item) => !blockedPackages.has(item.name)),
          ])
        ),
      };

      await setDoc(
        doc(db, "products", "mobile-legends"),
        cleanedProduct
      );

      setProduct(cleanedProduct);
      setMessage("Product saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save product.");
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
          Edit Mobile Legends
        </h1>

        <div className="mt-6 space-y-4">
          <input
            value={product.name}
            onChange={(event) =>
              setProduct({ ...product, name: event.target.value })
            }
            placeholder="Product name"
            className="w-full rounded-xl border border-white/10 bg-[#11141c] p-3 outline-none focus:border-red-500"
          />
</div>

        <div className="mt-7 space-y-7">
          {Object.entries(product.categories || {}).map(
            ([category, packages]) => (
              <section key={category}>
                <h2 className="mb-3 text-xl font-extrabold">{category}</h2>

                <div className="space-y-3">
                  {packages.map((item, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="space-y-2 rounded-2xl border border-white/10 bg-[#11141c] p-4"
                    >
                      <input
                        value={item.name}
                        onChange={(event) =>
                          updatePackage(
                            category,
                            index,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Package name"
                        className="w-full rounded-lg bg-black/30 p-3 outline-none"
                      />

                      <input
                        value={item.bonus}
                        onChange={(event) =>
                          updatePackage(
                            category,
                            index,
                            "bonus",
                            event.target.value
                          )
                        }
                        placeholder="Bonus"
                        className="w-full rounded-lg bg-black/30 p-3 outline-none"
                      />

                      <input
                        value={item.price}
                        onChange={(event) =>
                          updatePackage(
                            category,
                            index,
                            "price",
                            event.target.value
                          )
                        }
                        placeholder="Price"
                        className="w-full rounded-lg bg-black/30 p-3 outline-none"
                      />

                      <input
                        value={item.smileProductId || ""}
                        onChange={(event) =>
                          updatePackage(
                            category,
                            index,
                            "smileProductId",
                            event.target.value
                          )
                        }
                        placeholder="Smile Product ID"
                        className="w-full rounded-lg bg-black/30 p-3 outline-none"
                      />
</div>
                  ))}
                </div>
              </section>
            )
          )}
        </div>

        {message && (
          <p className="mt-5 text-center text-sm text-zinc-300">{message}</p>
        )}

        <button
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
