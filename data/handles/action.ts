"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Handle } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

export async function getHandles() {
  try {
    const result = await prisma.handle.findMany({ orderBy: { name: "asc" } });
    return result;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "handle", "findMany");
    console.error(errorMessage);
    return null;
  }
}

export async function updateHandle({
  id,
  name,
  oldName,
  productId,
}: {
  id: string;
  name: string;
  oldName: string;
  productId: string;
}) {
  verifyAdminSession();

  try {
    const updated = await prisma.handle.update({
      where: { id: Number(id) },
      data: { name },
    });

    const updatedProduct = await prisma.product.updateMany({
      where: { brand: oldName },
      data: { brand: name },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/" + productId);

    return updated.name;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteHandle({ id, productId }: { id: number; productId: string }) {
  verifyAdminSession();

  try {
    const updated = await prisma.handle.delete({
      where: { id: Number(id) },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/" + productId);

    return updated.name;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function addHandle({
  name,
  productId,
}: {
  name: string;
  productId: string;
}) {
  verifyAdminSession();

  try {
    const updated = await prisma.handle.create({
      data: { name },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/" + productId);

    return updated.name;
  } catch (error) {
    console.error(error);
    return null;
  }
}
