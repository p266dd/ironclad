"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Filter } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

export async function getFilters() {
  try {
    const result = await prisma.filter.findMany({ orderBy: { name: "asc" } });
    return result;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "Filter", "findMany");
    console.error(errorMessage);
    return null;
  }
}

export async function saveFilter({
  filterData,
}: {
  filterData: {
    id?: string | undefined;
    name: string;
  };
}) {
  await verifyAdminSession();

  if (!filterData) {
    return null;
  }

  const updateQuery = {
    update: {
      where: {
        id: Number(filterData.id),
      },
      data: {
        name: filterData.name,
      },
    },
  };

  const createQuery = {
    create: {
      name: filterData.name,
    },
  };

  try {
    if (filterData?.id) {
      await prisma.filter.update({
        where: {
          id: Number(filterData.id),
        },
        data: {
          name: filterData.name,
        },
      });
    } else {
      await prisma.filter.create({
        data: {
          name: filterData.name,
        },
      });
    }

    revalidatePath("/");
    return { data: true, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save filter.", data: null };
  }
}

export async function deleteFilter(filterId: number) {
  await verifyAdminSession();

  if (!filterId) {
    return null;
  }

  try {
    const result = await prisma.filter.delete({
      where: {
        id: Number(filterId),
      },
    });

    if (!result) {
      return { error: "Failed to delete filter.", data: null };
    }

    revalidatePath("/");
    return { data: true, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete filter.", data: null };
  }
}

export async function toggleFilter({
  filterId,
  productId,
  status,
}: {
  filterId: number;
  productId: string;
  status: boolean;
}) {
  await verifyAdminSession();

  if (!filterId || !productId) {
    return null;
  }

  console.log(status);

  try {
    const result = await prisma.filter.update({
      where: {
        id: Number(filterId),
      },
      data: {
        products:
          status === true
            ? {
                connect: {
                  id: productId,
                },
              }
            : {
                disconnect: {
                  id: productId,
                },
              },
      },
    });

    if (!result) {
      return { error: "Failed to toggle filter.", data: null };
    }

    revalidatePath("/");
    return { data: result.id, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to toggle filter.", data: null };
  }
}
