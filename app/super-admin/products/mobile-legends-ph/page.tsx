"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type PackageItem = {
  name: string;
  bonus: string;
  price: string | number;
  image?: string;
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
      const snapshot = await getDoc(doc(db, "products", "mobile-legends-ph"));

      const defaultProduct: Product = {
        name: "Mobile Legends 🇵🇭",
        banner: "/images/moba legends banner.jpg",
        categories: {
          Diamonds: [
            {
              name: "11 Diamonds",
              bonus: "10 + 1 Bonus",
              price: "14",
              smileProductId: "",
            },
            {
              name: "22 Diamonds",
              bonus: "20 + 2 Bonus",
              price: "29",
              smileProductId: "",
            },
            {
              name: "56 Diamonds",
              bonus: "51 + 5 Bonus",
              price: "71",
              smileProductId: "",
            },
            {
              name: "112 Diamonds",
              bonus: "102 + 10 Bonus",
              price: "143",
              smileProductId: "",
            },
            {
              name: "223 Diamonds",
              bonus: "203 + 20 Bonus",
              price: "285",
              smileProductId: "",
            },
            {
              name: "336 Diamonds",
              bonus: "303 + 33 Bonus",
              price: "428",
              smileProductId: "",
            },
            {
              name: "570 Diamonds",
              bonus: "504 + 66 Bonus",
              price: "713",
              smileProductId: "",
            },
            {
              name: "1163 Diamonds",
              bonus: "1007 + 156 Bonus",
              price: "1425",
              smileProductId: "",
            },
            {
              name: "2398 Diamonds",
              bonus: "2015 + 383 Bonus",
              price: "2850",
              smileProductId: "",
            },
            {
              name: "6042 Diamonds",
              bonus: "5035 + 1007 Bonus",
              price: "7125",
              smileProductId: "",
            },
          ],
          "Special Bundle": [
            {
              name: "Weekly Elite Bundle",
              bonus: "Purchasable once every week",
              price: "71",
              smileProductId: "",
            },
            {
              name: "Monthly Epic Bundle",
              bonus: "Purchasable once every month",
              price: "351",
              smileProductId: "",
            },
          ],
          Passes: [
            {
              name: "Weekly Diamond Pass",
              bonus: "",
              price: "143",
              smileProductId: "",
            },
            {
              name: "Twilight Pass",
              bonus: "",
              price: "713",
              smileProductId: "",
            },
          ],
        },
      };

      if (snapshot.exists()) {
        const savedProduct = snapshot.data() as Product;

        const hasPackages = Object.values(
          savedProduct.categories || {}
        ).some((packages) => packages.length > 0);

        setProduct(hasPackages ? savedProduct : defaultProduct);
      } else {
        setProduct(defaultProduct);
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

  function addPackage(category: string) {
    if (!product) return;

    const categories = { ...product.categories };
    const items = [...(categories[category] || [])];

    items.push({
      name: "",
      bonus: "",
      price: "",
      smileProductId: "",
    });

    categories[category] = items;
    setProduct({ ...product, categories });
  }

  function deletePackage(category: string, index: number) {
    if (!product) return;

    const categories = { ...product.categories };
    const items = [...(categories[category] || [])];

    items.splice(index, 1);
    categories[category] = items;
    setProduct({ ...product, categories });
  }

  async function saveProduct() {
    if (!product) return;

    setSaving(true);
    setMessage("");

    try {
      await setDoc(
        doc(db, "products", "mobile-legends-ph"),
        product
      );
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
          Edit Mobile Legends Philippines
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
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-extrabold">{category}</h2>

                  <button
                    type="button"
                    onClick={() => addPackage(category)}
                    className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-400 active:scale-95"
                  >
                    + Add Package
                  </button>
                </div>

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


                        <button
                          type="button"
                          onClick={() => deletePackage(category, index)}
                          className="w-full rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm font-bold text-red-400 active:scale-95"
                        >
                          Delete Package
                        </button>
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
