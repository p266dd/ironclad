"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { User } from "@/lib/generated/prisma";
import { Prisma } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";

export async function getUserForAuth(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      },
    });
    return { data: user, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "findUnique");
    return { data: null, error: errorMessage };
  }
}

export async function insertUserToken(token: string, userId: string) {
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        token,
        updatedAt: new Date(),
      },
      select: {
        id: true,
      },
    });
    return { data: user, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "update");
    return { data: null, error: errorMessage };
  }
}

export async function createUserForAuth(user: Prisma.UserCreateInput) {
  try {
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: "user",
        businessName: user.businessName,
      },
      select: {
        id: true,
      },
    });
    return { data: createdUser, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "create");
    return { data: null, error: errorMessage };
  }
}

export async function updateUserPasswordForAuth(password: string, userId: string) {
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password,
        token: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    return { data: user, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "update");
    return { data: null, error: errorMessage };
  }
}

export async function getUserPreferences() {
  const session = await verifyUserSession();
  const userId = session.id;

  try {
    const preferences = (await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        engraving: true,
      },
    })) as { id: string; engraving: Prisma.JsonArray | null };
    return { data: preferences, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "findUnique");
    return { data: null, error: errorMessage };
  }
}
