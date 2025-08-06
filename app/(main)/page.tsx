import FilterTags from "@/components/filter-tags";
import ProductGrid from "@/components/product-grid/product-grid";
import { LockIcon } from "lucide-react";

import { getSession } from "@/lib/session";
import { getFilters } from "@/data/filter/action";
import { logout } from "@/lib/logout";

// Assets
import Logo from "@/assets/logo.png";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const filters = await getFilters();

  const tag = params?.filter;

  return (
    <div className="pb-44 sm:pb-0 bg-linear-180 from-slate-100 to-slate-50/10">
      <div className="md:hidden">
        <div className="px-6 pt-8 mb-8 sm:mb-12">
          <img
            // priority
            src={Logo.src}
            alt="Ironclad Logo"
            className="w-52 sm:w-64"
          />
        </div>

        <div className="px-6 mb-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">
              <form action={logout}>
                <button className="flex items-center hover:cursor-pointer bg-slate-800 rounded-full p-2 text-white">
                  <LockIcon className="inline-block w-[0.7em] h-[0.7em]" />
                </button>
              </form>
            </div>
            <div>
              <h3 className="text-xl sm:text-3xl sm:mb-4">Welcome back,</h3>
              <h1 className="text-3xl font-bold flex items-center gap-3 sm:text-4xl">
                {session?.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {filters && filters.length > 0 ? (
        <div className="pt-2 mb-2 md:px-6 md:pt-6 md:mb-6">
          <div className="flex flex-wrap items-center gap-2 p-4">
            {filters.map((filter) => (
              <FilterTags
                key={filter.id}
                filter={filter.name}
                active={(tag !== undefined && (tag as string)) || ""}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="sm:py-4"></div>
      )}

      <ProductGrid
        activeFilters={{
          tag: (tag !== undefined && (tag as string)) || "",
          search: null,
        }}
      />
    </div>
  );
}
