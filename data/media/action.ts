"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";
import { ref, deleteObject, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

// Types
import { Media } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

export async function addMedia({
  blob,
  name,
  productId,
}: {
  blob: Blob;
  name: string;
  productId?: string;
}) {
  verifyAdminSession();

  try {
    const mediaName = `${name}-${Date.now()}.jpeg`;
    const docRef = ref(storage, `media/${mediaName}`);
    const snapshot = await uploadBytes(docRef, blob);

    // Get download reference.
    const downloadURL = await getDownloadURL(snapshot.ref);

    const created = await prisma.media.create({
      data: {
        name: mediaName ?? "media",
        url: downloadURL,
        product: productId
          ? {
              connect: {
                id: productId,
              },
            }
          : undefined,
      },
    });

    revalidatePath("/dashboard/products/" + productId);
    revalidatePath("/products/" + productId);

    return created;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteMedia({ id }: { id: string }) {
  verifyAdminSession();

  try {
    const deleted = await prisma.media.delete({
      where: { id: id },
    });

    // Delete image from storage.
    const docRef = ref(storage, `media/${deleted.name}`);
    await deleteObject(docRef);

    revalidatePath("/dashboard/products/" + deleted.productId);
    revalidatePath("/products/" + deleted.productId);

    return deleted;
  } catch (error) {
    console.error(error);
    return null;
  }
}
