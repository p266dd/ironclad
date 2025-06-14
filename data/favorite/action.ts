"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyUserSession, verifyAdminSession, SessionPayload } from "@/lib/session";

// Types
import { Prisma } from "@/lib/generated/prisma";
import { Favorite } from "@/lib/generated/prisma";
export type FavoriteItemsResultWithProducts = Prisma.FavoriteGetPayload<{
  include: { client: true; products: true };
}>;

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export async function initialiizeFavorites() {
  const session = await verifyUserSession();
  const userId = session.id;

  try {
    // Try to fetch favorites.
    const favorites = await getFavorites();

    if (favorites) {
      return;
    }

    // Create if does not exist.
    const createdFavorites = await prisma.favorite.create({
      data: {
        client: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return createdFavorites;
  } catch (error) {
    return null;
  }
}

export async function getFavorites() {
  const session: SessionPayload = await verifyUserSession();
  const userId = session.id;

  try {
    const favorites = await prisma.favorite.findUnique({
      where: {
        clientId: userId,
      },
      include: { client: true, products: true },
    });

    if (!favorites) {
      return null;
    }

    return favorites;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(
      error,
      "favorite",
      "findUnique"
    );
    console.error(errorMessage);
    return null;
  }
}

export async function addFavotiteProduct(productId: string) {
  const session = await verifyUserSession();
  const userId = session.id;

  try {
    await initialiizeFavorites();

    const favorites = await prisma.favorite.update({
      where: {
        clientId: userId,
      },
      data: {
        products: {
          create: {
            productId: productId,
          },
        },
      },
      select: { id: true },
    });

    revalidatePath("/favorites");
    revalidatePath("/");

    return favorites;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "favorite", "update");
    console.error(errorMessage);
    return null;
  }
}

export async function removeFavotiteProduct(productId: string) {
  const session = await verifyUserSession();
  const userId = session.id;

  try {
    await initialiizeFavorites();

    const favorites = await prisma.favorite.update({
      where: {
        clientId: userId,
      },
      data: {
        products: {
          deleteMany: {
            productId: productId,
          },
        },
      },
      select: { id: true },
    });

    revalidatePath("/favorites");
    revalidatePath("/");

    return favorites;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "favorite", "update");
    console.error(errorMessage);
    return null;
  }
}
