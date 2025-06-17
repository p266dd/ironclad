"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

// Validation
import { CartProductCreateSchema } from "@/prisma/schemas/cart";

// Types
import { Cart, CartProduct } from "@/lib/generated/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { ActionFormInitialState } from "@/lib/types";
import { ICreateCartProduct } from "./types";

export async function initializeCart() {
  const session = await verifyUserSession();
  const userId = session.id;

  try {
    const cart = await prisma.cart.findUnique({
      where: {
        clientId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!cart) {
      const createdCart = await prisma.cart.create({
        data: {
          clientId: userId,
        },
        select: {
          id: true,
        },
      });

      return createdCart.id;
    } else {
      return cart.id;
    }
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "cart", "create");
    console.error("Error initializing cart:", errorMessage);
    return null;
  }
}

export async function getCart() {
  const session = await verifyUserSession();
  const userId = session.id;

  try {
    const cart = await prisma.cart.findUnique({
      where: {
        clientId: userId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return cart;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "create");
    console.error(errorMessage);
    return null;
  }
}

export async function getProductFromCart(productId: string) {
  await verifyUserSession();

  try {
    // Get cart id.
    const cartId = await initializeCart();

    if (!cartId || typeof cartId !== "string") {
      return null;
    }

    const cart = await prisma.cartProduct.findFirst({
      where: {
        cartId: cartId,
        productId: productId,
      },
      include: {
        product: true,
      },
    });

    return cart;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "create");
    console.error(errorMessage);
    return null;
  }
}

export async function updateProductFromCart(
  initialState: ActionFormInitialState,
  formData: FormData
): Promise<ActionFormInitialState> {
  await verifyUserSession();

  const productId = formData.get("productId");
  const details = formData.get("details");
  const brand = formData.get("brand");
  const handle = formData.get("handle");
  const request = formData.get("request");
  const brandOther = formData.get("brandOther") || "";
  const handleOther = formData.get("handleOther") || "";

  const inputData: ICreateCartProduct = {
    productId: typeof productId === "string" ? productId : "",
    request: typeof request === "string" ? request : "",
    details:
      typeof details === "string"
        ? (JSON.parse(details) as Prisma.JsonValue)
        : ([] as Prisma.JsonValue),
    brand:
      typeof brand === "string" && brand !== "other"
        ? brand
        : typeof brandOther === "string"
        ? brandOther
        : "",
    handle:
      typeof handle === "string" && handle !== "custom"
        ? handle
        : typeof handleOther === "string"
        ? handleOther
        : "",
  };

  try {
    // Validate data.
    const validatedData = await CartProductCreateSchema.validate(inputData, {
      abortEarly: false,
      stripUnknown: true,
    });

    // ProductCart id.
    const cartProductId =
      (validatedData.productId && (await getProductFromCart(validatedData.productId))) ||
      null;
    if (!cartProductId) {
      return {
        success: false,
        message: "Failed to retrieve product from cart.",
        fieldErrors: {},
      };
    }

    const updatedCart = await prisma.cartProduct.update({
      where: {
        id: cartProductId.id,
      },
      data: {
        request: validatedData.request,
        details: validatedData.details || [],
        brand: validatedData.brand || "",
        handle: validatedData.handle || "",
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/cart");
    revalidatePath("/products/" + validatedData.productId);

    return { success: true, message: "Cart updated successfully.", fieldErrors: {} };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "create");
    return { success: false, message: errorMessage, fieldErrors: {} };
  }
}

export async function addToCart(
  initialState: ActionFormInitialState,
  formData: FormData
): Promise<ActionFormInitialState> {
  await verifyUserSession();

  const productId = formData.get("productId");
  const details = formData.get("details");
  const brand = formData.get("brand");
  const handle = formData.get("handle");
  const request = formData.get("request");
  const brandOther = formData.get("brandOther") || "";
  const handleOther = formData.get("handleOther") || "";

  const inputData: ICreateCartProduct = {
    productId: typeof productId === "string" ? productId : "",
    request: typeof request === "string" ? request : "",
    details:
      typeof details === "string"
        ? (JSON.parse(details) as Prisma.JsonValue)
        : ([] as Prisma.JsonValue),
    brand:
      typeof brand === "string" && brand !== "other"
        ? brand
        : typeof brandOther === "string"
        ? brandOther
        : "",
    handle:
      typeof handle === "string" && handle !== "custom"
        ? handle
        : typeof handleOther === "string"
        ? handleOther
        : "",
  };

  try {
    // Validate data.
    const validatedData = await CartProductCreateSchema.validate(inputData, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Initialize cart.
    const cartId = await initializeCart();
    if (!cartId) {
      return { success: false, message: "Failed to initialize cart.", fieldErrors: {} };
    }

    const updatedCart = await prisma.cart.update({
      where: {
        id: cartId,
      },
      data: {
        products: {
          create: {
            product: {
              connect: {
                id: validatedData.productId,
              },
            },
            request: validatedData.request,
            details: validatedData.details || [],
            brand: validatedData.brand || "",
            handle: validatedData.handle || "",
          },
        },
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/cart");
    revalidatePath("/products/" + validatedData.productId);

    return { success: true, message: "Product added to cart.", fieldErrors: {} };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "create");
    return { success: false, message: errorMessage, fieldErrors: {} };
  }
}
