import Image from "next/image";
import FilterTags from "@/components/filter-tags";
import ProductGrid from "@/components/product-grid/product-grid";
import { getSession, SessionPayload } from "@/lib/session";
import { logout } from "@/lib/logout";
import { LockIcon } from "lucide-react";
import { getFilters } from "@/data/filter/action";

// Assets
import Logo from "@/assets/logo.png";

// Shadcn
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter: string | null }>;
}) {
  const session: SessionPayload | null = await getSession();
  const params = await searchParams;

  const filters = await getFilters();
  const currentlyActiveFilter = params.filter;

  return (
    <div className="pb-44 sm:pb-0 bg-linear-180 from-slate-100 to-slate-50/10">
      <div className="md:hidden">
        <div className="px-6 pt-8 mb-8 sm:mb-12">
          <Image priority src={Logo} alt="Ironclad Logo" className="w-52 sm:w-64" />
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

      {filters.data && filters.data.length > 0 ? (
        <div className="pt-2 mb-2 md:px-6 md:pt-6 md:mb-6">
          <ScrollArea className="w-full p-4 whitespace-nowrap">
            {filters.data.map((filter, i) => (
              <FilterTags
                key={i}
                filter={filter.name}
                active={currentlyActiveFilter ? currentlyActiveFilter : ""}
              />
            ))}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ) : null}

      <ProductGrid activeFilter={currentlyActiveFilter} />
    </div>
  );
}
