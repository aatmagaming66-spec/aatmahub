import Link from "next/link";

const products = [
  {
    id: "mobile-legends",
    name: "Mobile Legends",
  },
  {
    id: "mobile-legends-small-packs",
    name: "MLBB Small Packs",
  },
  {
    id: "magic-chess",
    name: "Magic Chess",
  },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#080a0f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/super-admin" className="text-red-500 font-bold">
          ← Back
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold">Products</h1>

        <div className="mt-6 space-y-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/super-admin/products/${p.id}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#11141c] p-4 active:scale-95"
            >
              <span className="font-bold">{p.name}</span>
              <span>✏️</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
