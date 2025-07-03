"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";
import { storage } from "@/lib/firebase";
import { writeFile } from "fs/promises";
import path from "path";

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

    // Save to temporary location
    const buffer = Buffer.from(await blob.arrayBuffer());
    const tempFilePath = path.join("/tmp", mediaName);
    await writeFile(tempFilePath, buffer);

    const bucket = storage.bucket();
    const destination = `media/${mediaName}`;

    const uploaded = await bucket.upload(tempFilePath, {
      destination,
      metadata: {
        contentType: "image/jpeg",
      },
    });

    // Get download reference.
    const publicUrl = await uploaded[0].getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });

    const created = await prisma.media.create({
      data: {
        name: mediaName ?? "media",
        url: publicUrl[0],
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
    const bucket = storage.bucket();
    const docRef = bucket.file(`media/${deleted.name}`);

    await docRef.delete();

    revalidatePath("/dashboard/products/" + deleted.productId);
    revalidatePath("/products/" + deleted.productId);

    return deleted;
  } catch (error) {
    console.error(error);
    return null;
  }
}
