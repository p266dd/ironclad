"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Filter } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export async function getFilters() {
  try {
    const result = await prisma.filter.findMany({ orderBy: { name: "asc" } });
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "Filter", "create");
    return { data: null, error: errorMessage };
  }
}
