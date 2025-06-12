"use server";

export interface Filter {
  id: number;
  name: string;
}

import { findMany } from "@/lib/dal";

export async function getFilters() {
  const filters = await findMany("filter", { select: { id: true, name: true } });

  if (filters.error) {
    return null;
  }

  return filters.data as Filter[];
}
