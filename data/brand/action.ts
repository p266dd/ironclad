"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Brand } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export async function getBrands() {
  try {
    const result = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "Brand", "findMany");
    return { data: null, error: errorMessage };
  }
}
