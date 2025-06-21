"use server";

import path from "path";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { sendEmail } from "@/lib/nodemailer";
import { verifyUserSession } from "@/lib/session";
import { NewOrderEmailClient, NewOrderEmailStaff } from "@/lib/emails/new-order";

import { getCart } from "@/data/cart/actions";

// Types
import { Prisma } from "@/lib/generated/prisma";
import { TCreateOrderProduct, TProductDetails, TProductStockUpdate } from "@/lib/types";

// Error Utility
// import { generatePrismaErrorMessage } from "@/prisma/error-handling";

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
