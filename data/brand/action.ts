"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Brand } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

export async function getBrands() {
  try {
    const result = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "Brand", "findMany");
    return { data: null, error: errorMessage };
  }
}

export async function updateBrand({
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
    const updated = await prisma.brand.update({
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

export async function deleteBrand({ id, productId }: { id: number; productId: string }) {
  verifyAdminSession();

  try {
    const updated = await prisma.brand.delete({
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

export async function addBrand({ name, productId }: { name: string; productId: string }) {
  verifyAdminSession();

  try {
    const updated = await prisma.brand.create({
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
