"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  activeCategory: string | null;
  activeSort: string;
  searchQ: string;
};

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function SearchFilters({
  categories,
  activeCategory,
  activeSort,
  searchQ,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchQ);
  const [sort, setSort] = useState(activeSort);

  function buildUrl(params: Record<string, string | null>) {
    const current = new URLSearchParams();
    if (search) current.set("q", search);
    if (activeCategory) current.set("category", activeCategory);
    if (sort && sort !== "newest") current.set("sort", sort);

    Object.entries(params).forEach(([k, v]) => {
      if (v === null) current.delete(k);
      else current.set(k, v);
    });

    return `${pathname}?${current.toString()}`;
  }

  function navigate(params: Record<string, string | null>) {
    startTransition(() => router.push(buildUrl(params)));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ q: search || null });
  }

  function handleSort(value: string) {
    setSort(value);
    navigate({ sort: value === "newest" ? null : value });
  }

  return (
    <section
      className="sticky top-[73px] z-40 py-5 mb-12 bg-[#f8f6f3]/90 backdrop-blur-md
        flex flex-col md:flex-row justify-between items-start md:items-center gap-5
        border-b border-[#c4c7c7]/20"
    >
      {/* Filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
        {/* All pill */}
        <button
          onClick={() => navigate({ category: null })}
          className={`shrink-0 px-5 py-2 label-caps uppercase transition-colors ${
            !activeCategory
              ? "bg-black text-white"
              : "border border-[#c4c7c7]/50 text-black hover:bg-black hover:text-white"
          }`}
        >
          All
        </button>

        {/* Category pills */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              navigate({
                category: activeCategory === cat.slug ? null : cat.slug,
              })
            }
            className={`shrink-0 px-5 py-2 label-caps uppercase transition-colors flex items-center gap-2 ${
              activeCategory === cat.slug
                ? "bg-[#d4af37] text-white"
                : "border border-[#c4c7c7]/50 text-black hover:bg-black hover:text-white"
            }`}
          >
            {cat.name}
            {activeCategory === cat.slug && (
              <span className="material-symbols-outlined text-[14px]">close</span>
            )}
          </button>
        ))}
      </div>

      {/* Sort + Search */}
      <div className="flex items-center gap-6 w-full md:w-auto shrink-0">

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="appearance-none bg-transparent border-b border-black/20 pb-1 pr-6
              label-caps uppercase cursor-pointer focus:ring-0 focus:outline-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="relative flex-grow md:flex-grow-0">
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#747878] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collection"
            className="bg-transparent border-b border-black py-1 pl-8 focus:ring-0
              focus:outline-none w-full md:w-48 label-caps uppercase placeholder:text-[#747878]/50"
          />
        </form>

        {isPending && (
          <span className="label-caps text-[#747878] animate-pulse">Loading...</span>
        )}
      </div>
    </section>
  );
}