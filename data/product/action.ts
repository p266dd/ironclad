"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Prisma } from "@/lib/generated/prisma";
import { TActiveFilters } from "@/lib/types";
import { TProductItemResult } from "@/lib/types";

// Error Utility for logging
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

export async function getProductsInfineScroll(keys: {
  pageIndex: number;
  activeFilters: TActiveFilters;
}): Promise<TProductItemResult[]> {
  await verifyUserSession();

  const PAGE_INDEX: number = keys.pageIndex || 0;
  const PER_PAGE: number = 12;

  const filterTag = keys.activeFilters.tag;
  const searchFilters = keys.activeFilters.search;

  // * Dynamically build the filter for the 'sizes' relation.
  let sizesFilter: object | undefined = undefined;
  let brandFilter: object | undefined = undefined;
  let materialFilter: object | undefined = undefined;
  let styleFilter: object | undefined = undefined;
  let typeFilter: object | undefined = undefined;

  const sizeConditionsForAND = [];

  // * Add size condition.
  // * Cannot use due because of the possible format 120*100*10cm
  const searchBySize =
    searchFilters !== null && typeof searchFilters.size !== null
      ? String(searchFilters.size)
      : null;
  if (searchBySize !== null) {
    const sizes = searchBySize.split("-");
    sizeConditionsForAND.push({
      size: {
        gte: Number(sizes[0]), // Greater than or equal to minSize.
        lte: Number(sizes[1]), // Less than or equal to maxSize.
      },
    });
  }

  // * Add price condition.
  const searchByPrice =
    searchFilters !== null && searchFilters.price !== null
      ? String(searchFilters.price)
      : null;
  if (searchByPrice !== null) {
    const prices = searchByPrice.split("-");
    sizeConditionsForAND.push({
      price: {
        gte: Number(prices[0]),
        lte: Number(prices[1]),
      },
    });
  }

  // * Add stock condition.
  if (searchFilters !== null && searchFilters.stock !== null) {
    if (searchFilters.stock === "inStock") {
      sizeConditionsForAND.push({
        stock: {
          gt: 0,
        },
      });
    } else if (searchFilters.stock === "largeStock") {
      sizeConditionsForAND.push({
        stock: {
          gt: 50,
        },
      });
    } else {
      sizeConditionsForAND.push({
        stock: {
          gt: undefined,
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
      // If brand is an array of strings, use the 'in' operator.
      brandFilter = { in: searchFilters.brand };
    } else if (
      typeof searchFilters.brand === "string" &&
      searchFilters.brand.trim() !== ""
    ) {
      // If brand is a empty string, use 'equals'.
      brandFilter = { equals: searchFilters.brand, mode: "insensitive" };
    }
  }

  // * Add material to search clause.
  if (searchFilters && searchFilters.material) {
    if (Array.isArray(searchFilters.material) && searchFilters.material.length > 0) {
      // If material is an array of strings, use the 'in' operator.
      materialFilter = { in: searchFilters.material };
    } else if (
      typeof searchFilters.material === "string" &&
      searchFilters.material.trim() !== ""
    ) {
      // If material is a string, use 'equals'.
      materialFilter = { equals: searchFilters.material, mode: "insensitive" };
    }
  }

  // * Add styles to search clause.
  if (searchFilters && searchFilters.style) {
    if (typeof searchFilters.style === "string" && searchFilters.style.trim() !== "") {
      // If style is a string, use 'equals'.
      styleFilter = { equals: searchFilters.style, mode: "insensitive" };
    }
  }

  // * Add styles to search clause.
  if (searchFilters && searchFilters.type) {
    if (typeof searchFilters.type === "string" && searchFilters.type.trim() !== "") {
      // If style is a string, use 'equals'.
      typeFilter = { contains: searchFilters.type, mode: "insensitive" };
    }
  }

  try {
    const products = await prisma.product.findMany({
      take: PER_PAGE,
      skip: PAGE_INDEX * PER_PAGE,
      where: filterTag
        ? {
            active: {
              equals: true,
            },
            filters: {
              some: {
                name: {
                  equals: filterTag,
                  mode: "insensitive",
                },
              },
            },
          }
        : searchFilters
        ? {
            AND: [
              {
                active: {
                  equals: true,
                },
              },
              { type: searchFilters?.type === "all" ? undefined : typeFilter },
              {
                style: searchFilters?.style === "all" ? undefined : styleFilter,
              },
              {
                material: searchFilters?.material === "all" ? undefined : materialFilter,
              },
              {
                brand: searchFilters?.brand === "all" ? undefined : brandFilter,
              },
              {
                sizes: sizesFilter,
              },
              {
                OR: [
                  {
                    name: {
                      contains: searchFilters?.searchTerm,
                      mode: "insensitive",
                    },
                  },
                  {
                    brand: {
                      contains: searchFilters?.searchTerm,
                      mode: "insensitive",
                    },
                  },
                  {
                    material: {
                      contains: searchFilters?.searchTerm,
                      mode: "insensitive",
                    },
                  },
                  {
                    style: {
                      contains: searchFilters?.searchTerm,
                      mode: "insensitive",
                    },
                  },
                  {
                    handle: {
                      contains: searchFilters?.searchTerm,
                      mode: "insensitive",
                    },
                  },
                  {
                    sizes: {
                      some: {
                        name: {
                          contains: searchFilters?.searchTerm,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                ],
              },
            ],
          }
        : {
            active: {
              equals: true,
            },
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

export async function deleteProduct(productId: string) {
  await verifyAdminSession();

  try {
    const product = await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/" + productId);
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/" + productId);

    return product;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "product", "delete");
    console.error(errorMessage);
    return null;
  }
}

export async function getProductsPreview(searchTerm: string) {
  await verifyUserSession();

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            handle: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            material: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        handle: true,
        material: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "product", "findMany");
    console.error(errorMessage);
    return null;
  }
}

export async function getProducts() {
  verifyAdminSession();

  try {
    const products = await prisma.product.findMany({
      include: {
        sizes: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    if (products.length === 0) {
      return null;
    }
    return products;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "product", "findMany");
    console.error(errorMessage);
    return null;
  }
}

export async function fetchProducts({
  searchQuery,
  page,
  perPage,
}: {
  searchQuery:
    | {
        input: string | undefined;
        filter: string | undefined;
      }
    | undefined;
  page: number;
  perPage: number;
}) {
  await verifyAdminSession();

  const whereConditions: Prisma.ProductWhereInput[] = [];

  if (searchQuery) {
    // Add conditions for searchQuery.input if it exists.
    if (searchQuery.input) {
      whereConditions.push({
        OR: [
          { name: { contains: searchQuery.input, mode: "insensitive" } },
          { style: { contains: searchQuery.input, mode: "insensitive" } },
          { brand: { contains: searchQuery.input, mode: "insensitive" } },
          { handle: { contains: searchQuery.input, mode: "insensitive" } },
          { material: { contains: searchQuery.input, mode: "insensitive" } },
        ],
      });
    }

    // Add conditions for searchQuery.filter if it exists.
    if (searchQuery.filter) {
      whereConditions.push({
        OR: [
          { type: { contains: searchQuery.filter } },
          {
            filters: {
              some: {
                name: {
                  contains: searchQuery.filter,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      });
    }
  }

  try {
    const [totalCount, products] = await prisma.$transaction([
      prisma.product.count({
        where: { AND: whereConditions.length > 0 ? whereConditions : undefined },
      }),

      prisma.product.findMany({
        take: perPage,
        skip: (page - 1) * perPage,
        where: { AND: whereConditions.length > 0 ? whereConditions : undefined },
        orderBy: {
          name: "asc",
        },
        include: {
          thumbnail: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);

    return {
      data: products,
      error: null,
      totalCount: totalCount || 0,
      totalPages: totalPages || 0,
      currentPage: page,
    };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Failed to fetch products.",
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function getProductById(productId: string) {
  await verifyAdminSession();

  try {
    const order = await prisma.product.findFirst({
      where: {
        id: productId,
      },
      include: {
        filters: true,
        media: true,
        thumbnail: true,
        sizes: true,
      },
    });

    return { error: null, data: order };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch Product.", data: null };
  }
}

export async function updateProductDetails({
  productData,
  productId,
}: {
  productData: {
    type: string;
    name: string;
    description: string;
    brand: string;
    handle: string;
    canChangeHandle: boolean;
    material: string;
    style: string;
  };
  productId: string;
}) {
  await verifyAdminSession();

  try {
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...productData,
        canChangeHandle: productData.canChangeHandle,
        id: undefined,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/" + productId);

    return { error: null, data: product };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update product.", data: null };
  }
}

export async function updateProductStatus({
  newStatus,
  productId,
}: {
  newStatus: boolean;
  productId: string;
}) {
  await verifyAdminSession();

  try {
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        active: newStatus,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/" + productId);

    return { error: null, data: product };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update product.", data: null };
  }
}

export async function addNewProduct({
  productData,
}: {
  productData: {
    type: string;
    name: string;
    description: string;
    brand: string;
    handle: string;
    canChangeHandle: boolean;
    material: string;
    style: string;
  };
}) {
  await verifyAdminSession();

  try {
    const product = await prisma.product.create({
      data: {
        ...productData,
        canChangeHandle: productData.canChangeHandle,
        id: undefined,
      },
    });

    revalidatePath("/admin/products");

    return { error: null, data: product };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create product. Is the name unique?", data: null };
  }
}

export async function saveThumbnail({
  thumbnailId,
  productId,
}: {
  thumbnailId: string;
  productId: string;
}) {
  await verifyAdminSession();

  try {
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        thumbnailId: thumbnailId,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/" + productId);

    return { error: null, data: product };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save thumbnail.", data: null };
  }
}

export async function saveSize({
  sizeData,
  productId,
}: {
  sizeData: {
    id?: string;
    name: string;
    size?: string;
    dimension?: string;
    price: string;
    stock: string;
  };
  productId: string | undefined;
}) {
  await verifyAdminSession();

  if (!productId) {
    return null;
  }

  const updateQuery = {
    update: {
      where: {
        id: Number(sizeData.id),
      },
      data: {
        name: sizeData.name,
        size:
          sizeData?.size && typeof Number(sizeData?.size) === "number"
            ? Number(sizeData?.size)
            : 0,
        dimension: sizeData?.dimension,
        price: Number(sizeData.price.replace(",", "")),
        stock: Number(sizeData.stock),
      },
    },
  };

  const createQuery = {
    create: {
      name: sizeData.name,
      size:
        sizeData?.size && typeof Number(sizeData?.size) === "number"
          ? Number(sizeData?.size)
          : 0,
      dimension: sizeData?.dimension,
      price: Number(sizeData.price.replace(",", "")),
      stock: Number(sizeData.stock),
    },
  };

  try {
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        sizes: sizeData?.id ? updateQuery : createQuery,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/" + productId);

    return { data: product, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save size.", data: null };
  }
}

export async function saveFilterList({
  filterData,
  productId,
}: {
  filterData: {
    id?: string | undefined;
    name: string;
  };
  productId: string | undefined;
}) {
  await verifyAdminSession();
}

export async function getProductList() {
  await verifyAdminSession();

  try {
    const products = await prisma.product.findMany({
      select: {
        name: true,
        id: true,
      },
    });

    return products;
  } catch (error) {
    console.error(error);
    return null;
  }
}
