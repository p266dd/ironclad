"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Prisma } from "@/lib/generated/prisma";
import { Product } from "@/lib/generated/prisma";
import { TActiveFilters } from "@/lib/types";
export type ProductItemResult = Prisma.ProductGetPayload<{
  include: { filters: true; media: true; thumbnail: true };
}>;

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export async function getProductsInfineScroll(keys: {
  index: number;
  activeFilters: TActiveFilters;
}): Promise<ProductItemResult[]> {
  await verifyUserSession();

  const PAGE_INDEX: number = keys.index || 0;
  const PER_PAGE: number = 12;

  const filterTag: string | null = keys.activeFilters.tag;
  const searchFilters = keys.activeFilters.search;

  // * Dynamically build the filter for the 'sizes' relation.
  let sizesFilter: object | undefined = undefined;
  let brandFilter: object | undefined = undefined;
  let materialFilter: object | undefined = undefined;

  const sizeConditionsForAND = [];

  // * Add size condition.
  if (searchFilters && searchFilters.size) {
    const sizes = searchFilters.size.split("-");
    sizeConditionsForAND.push({
      size: {
        gte: Number(sizes[0]), // Greater than or equal to minSize.
        lte: Number(sizes[1]), // Less than or equal to maxSize.
      },
    });
  }

  // * Add price condition.
  if (searchFilters && searchFilters.price) {
    const prices = searchFilters.price.split("-");
    sizeConditionsForAND.push({
      price: {
        gte: Number(prices[0]), // Greater than or equal to minPrice.
        lte: Number(prices[1]), // Less than or equal to maxPrice.
      },
    });
  }

  // * Add stock condition.
  if (searchFilters && searchFilters.stock) {
    if (searchFilters.stock === "inStock") {
      sizeConditionsForAND.push({
        stock: {
          gt: 0, // Greater than 0
        },
      });
    } else if (searchFilters.stock === "largeStock") {
      sizeConditionsForAND.push({
        stock: {
          gt: 50, // Greater than 50
        },
      });
    }
  }

  // * Construct the 'some' filter for size.
  if (sizeConditionsForAND.length > 0) {
    sizesFilter = {
      some: {
        AND: sizeConditionsForAND,
      },
    };
  }

  // * Add brand to search clause.
  if (searchFilters && searchFilters.brand) {
    if (Array.isArray(searchFilters.brand) && searchFilters.brand.length > 0) {
      // If brand is an array of strings, use the 'in' operator
      brandFilter = { in: searchFilters.brand };
    } else if (
      typeof searchFilters.brand === "string" &&
      searchFilters.brand.trim() !== ""
    ) {
      // If brand is a single, non-empty string, use 'equals'
      brandFilter = { equals: searchFilters.brand };
    }
  }

  // * Add material to search clause.
  if (searchFilters && searchFilters.material) {
    if (Array.isArray(searchFilters.material) && searchFilters.material.length > 0) {
      // If material is an array of strings, use the 'in' operator
      materialFilter = { in: searchFilters.material };
    } else if (
      typeof searchFilters.material === "string" &&
      searchFilters.material.trim() !== ""
    ) {
      // If material is a single, non-empty string, use 'equals'
      materialFilter = { equals: searchFilters.material };
    }
  }

  try {
    const products = await prisma.product.findMany({
      take: PER_PAGE,
      skip: PAGE_INDEX * PER_PAGE,
      where: filterTag
        ? {
            filters: {
              some: {
                name: {
                  equals: filterTag,
                },
              },
            },
          }
        : {
            name: {
              contains: searchFilters?.name,
            },
            style: searchFilters?.style,
            material: materialFilter,
            brand: brandFilter,
            sizes: sizesFilter,
          },
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

export async function getProduct(productId: string) {
  await verifyUserSession();

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        media: true,
        thumbnail: true,
        sizes: true,
      },
    });

    return product;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "product", "findUnique");
    console.error(errorMessage);
    return null;
  }
}
