"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Prisma } from "@/lib/generated/prisma";
import { Product } from "@/lib/generated/prisma";
export type ProductItemResult = Prisma.ProductGetPayload<{
  include: { filters: true; media: true; thumbnail: true };
}>;

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export async function getProductsInfineScroll(pageIndex: {
  index: number;
  activeFilter: string | null;
}): Promise<ProductItemResult[]> {
  await verifyUserSession();

  const PAGE_INDEX: number = pageIndex.index || 0;
  const PAGE_FILTER: string | null = pageIndex.activeFilter;
  const PER_PAGE: number = 12;

  console.log(pageIndex.activeFilter);

  try {
    const products = await prisma.product.findMany({
      take: PER_PAGE,
      skip: PAGE_INDEX * PER_PAGE,
      where: PAGE_FILTER
        ? {
            filters: {
              some: {
                name: {
                  equals: PAGE_FILTER,
                },
              },
            },
          }
        : undefined,
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
