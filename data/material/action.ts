"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Material } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

export async function getMaterials() {
  try {
    const result = await prisma.material.findMany({ orderBy: { name: "asc" } });
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "Material", "findMany");
    return { data: null, error: errorMessage };
  }
}

export async function updateMaterial({
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
    const updated = await prisma.material.update({
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

export async function deleteMaterial({
  id,
  productId,
}: {
  id: number;
  productId: string;
}) {
  verifyAdminSession();

  try {
    const updated = await prisma.material.delete({
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

export async function addMaterial({
  name,
  productId,
}: {
  name: string;
  productId: string;
}) {
  verifyAdminSession();

  try {
    const updated = await prisma.material.create({
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
