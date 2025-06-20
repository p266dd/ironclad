"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifyUserSession } from "@/lib/session";
import path from "path";

import { sendEmail } from "@/lib/nodemailer";
import { NewOrderEmailClient } from "@/lib/emails/new-order";

import { getCart } from "@/data/cart/actions";

// Types
import { Prisma } from "@/lib/generated/prisma";

// Error Utility
// import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export async function createOrder() {
  const session = await verifyUserSession();

  // Get user's cart.
  const cart = await getCart();

  if (!cart) {
    return null;
  }

  // Verify quantities are available.
  const orderProductCreateInputs: {
    product: { connect: { id: string } };
    brand: string;
    handle: string;
    request: string | null;
    details: Prisma.JsonArray;
  }[] = [];
  const stockUpdateOperations: {
    sizeId: number;
    decrementAmount: number;
    productId: string;
  }[] = [];

  for (const cartProduct of cart.products) {
    if (!cartProduct.product || !cartProduct.product.sizes) {
      return null;
    }

    const parsedDetails = cartProduct.details as {
      sizeId: number;
      quantity: number;
    }[];

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
        return null; // No stock available.
      }

      // Prepare for stock update.
      stockUpdateOperations.push({
        sizeId: sizeInfo.id,
        decrementAmount: requestedQuantity,
        productId: cartProduct.productId, // For revalidation.
      });

      // Add to items for this specific OrderProduct, storing price at time of order
      validItemsForThisOrder.push({
        id: sizeId, // Size ID
        quantity: requestedQuantity,
        priceAtOrder: sizeInfo.price, // Store price at the time of order
        nameAtOrder: sizeInfo.name || String(sizeInfo.size), // Store size name/identifier
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
    }
  }

  if (orderProductCreateInputs.length === 0) {
    return null;
  }

  // Generate a simple order code
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
            deleteMany: {}, // Deletes all CartProduct records linked to this cart
          },
        },
      });

      return createdOrder;
    });

    // Send emails.
    const clientEmail = await sendEmail({
      to: session.email,
      subject: "Order Confirmation - Testing",
      html: NewOrderEmailClient({ name: session.name, order: newOrder }).html,
      text: NewOrderEmailClient({ name: session.name, order: newOrder }).text,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(process.cwd(), "assets", "logo.png"),
          cid: "logo@ironclad",
        },
      ],
    });

    // Staff email.

    // Revalidate paths for updated data.
    revalidatePath("/cart");
    revalidatePath("/account/orders");
    // Revalidate all product pages from order.
    const uniqueProductIds = [
      ...new Set(stockUpdateOperations.map((op) => op.productId)),
    ];
    for (const productId of uniqueProductIds) {
      revalidatePath(`/products/${productId}`, "page");
    }

    return newOrder.id;
  } catch (error) {
    console.error(error);
    return null;
  }
}
