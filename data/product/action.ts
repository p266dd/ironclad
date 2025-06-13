"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Product } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export async function getProductsInfineScroll(pageIndex: number, filter?: string) {
  await verifyUserSession();

  const PER_PAGE = 12;

  try {
    const products = await prisma.product.findMany({
      skip: pageIndex * PER_PAGE,
      take: PER_PAGE,
      where: filter
        ? {
            filters: {
              some: {
                name: {
                  equals: filter,
                },
              },
            },
          }
        : {},
      include: {
        filters: true,
        media: true,
        thumbnail: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "product", "findMany");
    console.error(errorMessage);
    return [];
  }
}
