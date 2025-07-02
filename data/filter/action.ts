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
    return { error: "Filter was not provided.", data: null };
  }

  const updateQuery = {
    where: {
      id: Number(filterData.id),
    },
    data: {
      name: filterData.name,
    },
  };

  const createQuery = {
    data: {
      name: filterData.name,
    },
  };

  try {
    if (filterData?.id !== null) {
      await prisma.filter.update(updateQuery);
    } else {
      await prisma.filter.create(createQuery);
    }

    revalidatePath("/");
    return { error: null, data: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save filter.", data: null };
  }
}

export async function deleteFilter(filterId: number) {
  await verifyAdminSession();

  if (!filterId) {
    return { error: "Filter was not provided.", data: null };
  }

  try {
    const result = await prisma.filter.delete({
      where: {
        id: Number(filterId),
      },
    });

    revalidatePath("/");
    return { error: null, data: result };
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
    return { error: "No filter or product provided." };
  }

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

    revalidatePath("/");
    return { error: null, data: result.id };
  } catch (error) {
    console.error(error);
    return { error: "Failed to toggle filter." };
  }
}
