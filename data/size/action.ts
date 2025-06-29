"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Size } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

export async function deleteSize({
  sizeId,
  productId,
}: {
  sizeId: number;
  productId: string;
}) {
  await verifyAdminSession();

  try {
    const size = await prisma.size.delete({
      where: {
        id: sizeId,
      },
    });

    if (!size) {
      return { error: "Failed to delete size." };
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/" + productId);

    return { data: size, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete size.", data: null };
  }
}
