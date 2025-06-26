"use server";

import path from "path";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { sendEmail } from "@/lib/nodemailer";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";
import { NewOrderEmailClient, NewOrderEmailStaff } from "@/lib/emails/new-order";

import { getCart } from "@/data/cart/actions";

// Types
import { Prisma } from "@/lib/generated/prisma";
import { TCreateOrderProduct, TProductDetails, TProductStockUpdate } from "@/lib/types";

// Error Utility
// import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export const getOwnOrders = cache(async (page: number, itemsPerPage: number) => {
  const session = await verifyUserSession();
  const userId = session.id;

  try {
    const orders = await prisma.order.findMany({
      where: {
        clientId: userId,
      },
      skip: (page - 1) * itemsPerPage,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        code: true,
        client: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        orderProduct: {
          select: {
            details: true,
            brand: true,
            handle: true,
            request: true,
            product: {
              include: {
                sizes: true,
              },
            },
          },
        },
      },
    });

    return { data: orders, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch orders.", data: null };
  }
});

export async function getOwnOrderById(orderId: string) {
  const session = await verifyUserSession();
  const userId = session.id;

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        clientId: userId,
      },
      select: {
        id: true,
        code: true,
        client: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        orderProduct: {
          select: {
            details: true,
            brand: true,
            request: true,
            handle: true,
            product: {
              include: {
                sizes: true,
              },
            },
          },
        },
      },
    });

    return { data: order, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch order.", data: null };
  }
}

export async function createOrder() {
  const session = await verifyUserSession();

  // Get user's cart.
  const cart = await getCart();

  if (!cart) {
    return { error: "No cart found." };
  }

  // Verify quantities are available.
  const orderProductCreateInputs: TCreateOrderProduct[] = [];
  const stockUpdateOperations: TProductStockUpdate[] = [];

  for (const cartProduct of cart.products) {
    if (!cartProduct.product || !cartProduct.product.sizes) {
      return { error: "Invalid cart product." };
    }

    const parsedDetails = cartProduct.details as TProductDetails[];

    const validItemsForThisOrder = [];

    // Perform a stock check.
    for (const itemDetail of parsedDetails) {
      const sizeId = itemDetail.sizeId;
      const requestedQuantity = itemDetail.quantity;

      if (requestedQuantity === 0) {
        continue; // Skip items with no valid quantity.
      }

      const sizeInfo = cartProduct.product.sizes.find((s) => s.id === Number(sizeId));

      if (!sizeInfo) {
        return null;
      }

      if (requestedQuantity > sizeInfo.stock) {
        return { error: "No stock available for this size." }; // No stock available.
      }

      // Prepare for stock update.
      stockUpdateOperations.push({
        sizeId: sizeInfo.id,
        decrementAmount: requestedQuantity,
        productId: cartProduct.productId, // For revalidation.
      });

      // Add to items for this specific OrderProduct, just in case storing price at time of order.
      validItemsForThisOrder.length > 0 &&
        validItemsForThisOrder.push({
          id: sizeId,
          quantity: requestedQuantity,
          priceAtOrder: sizeInfo.price, // Store price at the time of order.
        });
    }

    if (validItemsForThisOrder.length > 0) {
      orderProductCreateInputs.push({
        product: { connect: { id: cartProduct.productId } },
        brand: cartProduct.brand,
        handle: cartProduct.handle,
        request: cartProduct.request,
        details: validItemsForThisOrder as Prisma.JsonArray,
      });
    } else {
      return { error: "No valid item quantity for this order." };
    }
  }

  if (orderProductCreateInputs.length === 0) {
    return { error: "No valid items for this order." };
  }

  // Generate a simple order code.
  const orderCode = `ORD-${Date.now().toString(36).toUpperCase()}-${session.id
    .substring(0, 6)
    .toUpperCase()}`;

  try {
    // Create order using Prisma transaction for atomicity.
    const newOrder = await prisma.$transaction(async (tx) => {
      // Reduce quantities acordingly.
      for (const op of stockUpdateOperations) {
        await tx.size.update({
          where: { id: op.sizeId },
          data: { stock: { decrement: op.decrementAmount } },
        });
      }

      // Create new order.
      const createdOrder = await tx.order.create({
        data: {
          client: { connect: { id: session.id } },
          code: orderCode,
          orderProduct: {
            create: orderProductCreateInputs,
          },
        },
        select: {
          id: true,
          code: true,
          client: {
            select: {
              name: true,
            },
          },
          createdAt: true,
          orderProduct: {
            select: {
              details: true,
              brand: true,
              handle: true,
              request: true,
              product: {
                include: {
                  sizes: true,
                },
              },
            },
          },
        },
      });

      // Clear the user's cart.
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          products: {
            deleteMany: {},
          },
        },
      });

      return createdOrder;
    });

    // Client emails.
    const clientEmail = await sendEmail({
      to: session.email,
      subject: "Order Confirmation",
      html: NewOrderEmailClient({ name: session.name, order: newOrder }).html,
      text: NewOrderEmailClient({ name: session.name, order: newOrder }).text,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(process.cwd(), "public", "logo.png"),
          cid: "logo@ironclad",
        },
      ],
    });
    console.log("Client Email: ", clientEmail);

    // Staff email.
    const staffEmail = await sendEmail({
      to: "staff@ironcladknives.com",
      subject: "New Order From " + session.name,
      html: NewOrderEmailStaff({ client: session.name, orderId: newOrder.id }).html,
      text: NewOrderEmailStaff({ client: session.name, orderId: newOrder.id }).text,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(process.cwd(), "public", "logo.png"),
          cid: "logo@ironclad",
        },
      ],
    });
    console.log("Staff Email: ", staffEmail);

    // Revalidate paths for updated data.
    revalidatePath("/cart");
    revalidatePath("/account/orders");

    // Revalidate each product pages from order.
    const uniqueProductIds = [
      ...new Set(stockUpdateOperations.map((op) => op.productId)),
    ];
    for (const productId of uniqueProductIds) {
      revalidatePath(`/products/${productId}`, "page");
    }

    return newOrder.id;
  } catch (error) {
    console.error(error);
    return { error: "Failed to create order." };
  }
}

export async function fetchOrders({
  searchQuery,
  page,
  itemsPerPage,
  newOnly,
}: {
  searchQuery: {
    searchTerm: string | undefined;
    range:
      | {
          startDate: Date | undefined;
          endDate: Date | undefined;
        }
      | undefined;
  } | null;
  page: number;
  itemsPerPage: number;
  newOnly: boolean;
}) {
  await verifyAdminSession();

  try {
    // * return only new orders, and shallow query.
    const [totalCount, orders] = await prisma.$transaction([
      prisma.order.count({
        where: {
          isCompleted: newOnly,
          AND: searchQuery
            ? {
                OR: [
                  { code: { contains: searchQuery.searchTerm || undefined } },
                  {
                    client: {
                      businessName: {
                        contains: searchQuery.searchTerm || undefined,
                      },
                    },
                  },
                ],
                AND: [
                  {
                    createdAt: {
                      gte: searchQuery.range?.startDate || undefined,
                      lte: searchQuery.range?.endDate || undefined,
                    },
                  },
                ],
              }
            : [],
        },
      }),

      prisma.order.findMany({
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        where: {
          isCompleted: !newOnly,
          AND: searchQuery
            ? {
                OR: [
                  { code: { contains: searchQuery.searchTerm || undefined } },
                  {
                    client: {
                      businessName: {
                        contains: searchQuery.searchTerm || undefined,
                      },
                    },
                  },
                ],
                AND: [
                  {
                    createdAt: {
                      gte: searchQuery.range?.startDate || undefined,
                      lte: searchQuery.range?.endDate || undefined,
                    },
                  },
                ],
              }
            : [],
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          client: {
            select: {
              businessName: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return {
      data: orders,
      error: null,
      totalCount: totalCount || 0,
      totalPages: totalPages || 0,
      currentPage: page,
    };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Failed to fetch orders.",
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function getOrderById(orderId: string) {
  await verifyAdminSession();

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        code: true,
        completedAt: true,
        isCompleted: true,
        client: {
          select: {
            name: true,
            businessName: true,
          },
        },
        createdAt: true,
        orderProduct: {
          select: {
            id: true,
            details: true,
            brand: true,
            request: true,
            handle: true,
            product: {
              include: {
                sizes: true,
              },
            },
          },
        },
      },
    });

    return { data: order, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch order.", data: null };
  }
}

export async function completeOrder({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  await verifyAdminSession();

  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        updatedAt: new Date(),
        completedAt: status === "completed" ? new Date() : undefined,
        isCompleted: status === "completed",
      },
    });

    revalidatePath("/orders");
    revalidatePath("/orders/" + orderId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders/" + orderId);
    revalidatePath("/dashboard/orders/" + orderId + "/print");
    return { data: updatedOrder.id, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update order.", data: null };
  }
}

export async function deleteOrder({ orderId }: { orderId: string }) {
  await verifyAdminSession();

  try {
    const deletedOrder = await prisma.order.delete({
      where: {
        id: orderId,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/orders");
    revalidatePath("/orders/" + orderId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders/" + orderId);
    revalidatePath("/dashboard/orders/" + orderId + "/print");
    return { data: deletedOrder.id, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete order.", data: null };
  }
}
