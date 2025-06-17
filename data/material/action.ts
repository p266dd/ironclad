"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Material } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export async function getMaterials() {
  try {
    const result = await prisma.material.findMany({ orderBy: { name: "asc" } });
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "Material", "findMany");
    return { data: null, error: errorMessage };
  }
}
