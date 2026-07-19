"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecent(data);
  }, []);

  return (
    <main className="min-h-screen bg-[#080a0f] text-white">
      <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-white/10 bg-[#11141c] px-4 py-4">
        <Link href="/" className="text-red-500">← Back</Link>
        <h1 className="text-xl font-bold">Search</h1>
      </header>

      <div className="p-4">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-xl border border-white/10 bg-[#151922] px-4 py-3 outline-none focus:border-red-500"
        />

        {recent.length > 0 && (
          <>
            <div className="mt-6 mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-400">Recent Searches</h2>
              <button
                onClick={() => {
                  localStorage.removeItem("recentSearches");
                  setRecent([]);
                }}
                className="text-xs text-red-500"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2">
              {recent.map((item) => (
                <div key={item} className="rounded-xl bg-[#151922] p-4">
                  🕒 {item}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
