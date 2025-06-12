import Image from "next/image";
import { getSession, SessionPayload } from "@/lib/session";
import FilterTags from "@/components/filter-tags";
import { logout } from "@/actions/logout";
import { LockIcon } from "lucide-react";

import { getFilters } from "@/prisma/operations/filter";

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
  const currentlyActive = params.filter;

  return (
    <main className="pb-44 sm:pb-0">
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

      {filters && filters.length > 0 ? (
        <div className="my-6 md:px-6">
          <ScrollArea className="w-full p-4 whitespace-nowrap">
            {filters.map((filter, i) => (
              <FilterTags
                key={i}
                filter={filter.name}
                active={currentlyActive ? currentlyActive : ""}
              />
            ))}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ) : null}

      {/* TODO; Product grid -> pass currentActive */}
    </main>
  );
}
