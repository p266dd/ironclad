"use server";

import prisma from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";
import {
  UserCreateSchema,
  OwnUserUpdateSchema,
  engravingValidation,
  passwordValidation,
} from "@/prisma/schemas/user";

// Types
import { User } from "@/lib/generated/prisma";
import { Prisma } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

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
  // Validate Data
  const validateData = await UserCreateSchema.validate(user, {
    abortEarly: false,
    stripUnknown: true,
  });

  try {
    const createdUser = await prisma.user.create({
      data: {
        name: validateData.name,
        email: validateData.email,
        password: hashSync(validateData.password, 10),
        role: "user",
        businessName: validateData.businessName,
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

export async function getOwnUserProfile() {
  const session = await verifyUserSession();
  const userId = session.id;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        businessCode: true,
      },
    });
    const preferences = await getUserPreferences();
    return { ...user, ...preferences.data };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "user", "findUnique");
    console.error(errorMessage);
    return null;
  }
}

export async function updateOwnUser(
  data: {
    name?: string;
    email?: string;
    password?: string;
    businessName?: string;
    businessCode?: string | null;
  } | null
) {
  const session = await verifyUserSession();
  const userId = session.id;

  if (!userId === null) {
    return { error: "Invalid user." };
  }

  try {
    // Validate Data
    const validateData = await OwnUserUpdateSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Validate Password
    const validatePassword = data?.password
      ? passwordValidation.validateSync(data.password)
      : null;

    const userObject = {
      ...validateData,
      password: validatePassword ? hashSync(validatePassword, 10) : undefined,
    };

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: userObject,
      select: {
        id: true,
      },
    });

    revalidatePath("/account");

    return updatedUser;
  } catch (error) {
    console.error(error);
    return { error: "An error occurred. We were unable to update your information." };
  }
}

export async function updateUserPreferences(
  preference: { slug: string; name: string } | null
) {
  const session = await verifyUserSession();
  const userId = session.id;

  if (preference === null || preference.slug === "" || preference.name === "") {
    return { error: "Invalid data." };
  }

  try {
    // Validate Data
    const validateData = await engravingValidation.validate(preference, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Get current preferences
    const getOldPreferences = await getUserPreferences();
    const oldPreferences = getOldPreferences.data?.engraving ?? [];

    // Update User
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        engraving: [...oldPreferences, validateData] as Prisma.JsonArray,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/account");

    return { data: updatedUser, error: null };
  } catch (error) {
    const errorMessage = generatePrismaErrorMessage(error, "user", "update");
    return { error: errorMessage };
  }
}

export async function removeUserPreference(slug: string) {
  const session = await verifyUserSession();
  const userId = session.id;

  if (slug === null || slug === undefined || slug === "") {
    return { error: "Invalid preference." };
  }

  const preferences = await getUserPreferences();
  const oldPreferences = preferences.data?.engraving as
    | Prisma.JsonArray
    | null
    | undefined;

  if (!oldPreferences || oldPreferences === undefined) {
    return { error: "No preferences found." };
  }

  const currentArray = oldPreferences as {
    slug: string;
    name: string;
  }[];

  const newPreferences = currentArray.filter((preference) => preference?.slug !== slug);

  const updatedPreferences = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      engraving: newPreferences as Prisma.JsonArray,
    },
    select: {
      id: true,
    },
  });

  revalidatePath("/account");
  revalidatePath("/products/*");

  return updatedPreferences;
}
