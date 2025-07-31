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
import { userActivationEmail } from "@/lib/emails/user-active";

// Types
import { Prisma } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/nodemailer";
import path from "path";

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
        isActive: true,
      },
    });
    return { data: user, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(
      error,
      "user",
      "findUnique"
    );
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
    const errorMessage = await generatePrismaErrorMessage(
      error,
      "user",
      "update"
    );
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
    const errorMessage = await generatePrismaErrorMessage(
      error,
      "user",
      "create"
    );
    return { data: null, error: errorMessage };
  }
}

export async function updateUserPasswordForAuth(
  password: string,
  userId: string
) {
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
    const errorMessage = await generatePrismaErrorMessage(
      error,
      "user",
      "update"
    );
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
    return preferences;
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(
      error,
      "user",
      "findUnique"
    );
    console.error(errorMessage);
    return null;
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
        canConnect: true,
        connections: true,
        pendingConnections: true,
      },
    });
    const preferences = await getUserPreferences();
    return { ...user, ...preferences };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(
      error,
      "user",
      "findUnique"
    );
    console.error(errorMessage);
    return null;
  }
}

export async function updateOwnUser(data: {
  name: string;
  email: string;
  password: string | undefined;
  businessName: string;
  businessCode: string | undefined;
}) {
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

    return { error: null, data: updatedUser };
  } catch (error) {
    console.error(error);
    return { error: "We were unable to update your information." };
  }
}

export async function updateUserPreferences(preference: {
  slug: string | null;
  name: string;
}) {
  const session = await verifyUserSession();
  const userId = session.id;

  if (preference.slug === "" || preference.name === "") {
    return { error: "Preference name must be provided." };
  }

  try {
    // Validate Data
    const validateData = await engravingValidation.validate(preference, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Get current preferences
    const getOldPreferences = await getUserPreferences();
    const oldPreferences = getOldPreferences?.engraving || [];

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

    return { error: null, data: updatedUser };
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
  const oldPreferences = preferences?.engraving as
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

  const newPreferences = currentArray.filter(
    (preference) => preference?.slug !== slug
  );

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

export async function fetchUsers({
  searchQuery,
  page,
  itemsPerPage,
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
}) {
  await verifyAdminSession();

  try {
    const [totalCount, users] = await prisma.$transaction([
      prisma.user.count({
        where: {
          AND: searchQuery
            ? {
                OR: [
                  { name: { contains: searchQuery.searchTerm || undefined } },
                  {
                    businessName: {
                      contains: searchQuery.searchTerm || undefined,
                    },
                  },
                  {
                    businessCode: {
                      contains: searchQuery.searchTerm || undefined,
                    },
                  },
                ],
              }
            : [],
        },
      }),

      prisma.user.findMany({
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        where: {
          AND: searchQuery
            ? {
                OR: [
                  { name: { contains: searchQuery.searchTerm || undefined } },
                  {
                    businessName: {
                      contains: searchQuery.searchTerm || undefined,
                    },
                  },
                  {
                    businessCode: {
                      contains: searchQuery.searchTerm || undefined,
                    },
                  },
                ],
              }
            : [],
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          businessName: true,
          isActive: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return {
      data: users,
      error: null,
      totalCount: totalCount || 0,
      totalPages: totalPages || 0,
      currentPage: page,
    };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Failed to fetch users.",
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function addNewUser({
  userData,
}: {
  userData: {
    name: string;
    email: string;
    password: string;
    businessName: string;
    businessCode?: string;
    role: string;
    isActive: boolean;
  };
}) {
  await verifyAdminSession();

  try {
    const user = await prisma.user.create({
      data: {
        ...userData,
        isActive: userData.isActive,
        id: undefined,
      },
    });

    revalidatePath("/admin/users");

    return { error: null, data: user };
  } catch (error) {
    console.error(error);
    return { error: "Failed to add new user.", data: null };
  }
}

export async function updateUser({
  userData,
  userId,
}: {
  userData: {
    name: string;
    email: string;
    businessName: string;
    businessCode: string;
    role: string;
    isActive: boolean;
  };
  userId: string;
}) {
  await verifyAdminSession();

  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...userData,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/users/" + userId);

    return { error: null, data: user };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update user.", data: null };
  }
}

export async function updateUserStatus({
  status,
  user,
}: {
  status: boolean;
  user: {
    id: string;
    email: string;
  };
}) {
  await verifyAdminSession();

  try {
    const updated = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: status,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/users/" + user.id);

    if (status === true) {
      const userEmail = userActivationEmail({
        user: {
          name: updated.name,
          businessName: updated.businessName,
        },
      });
      await sendEmail({
        to: user.email,
        subject: "Account Review - Ironclad Knives",
        html: userEmail.html,
        text: userEmail.text,
        attachments: [
          {
            filename: "logo.png",
            path: path.join(process.cwd(), "public", "logo.png"),
            cid: "logo@ironclad",
          },
        ],
      });
    }

    return { error: null, data: user };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update user.", data: null };
  }
}

export async function deleteUser({ userId }: { userId: string }) {
  await verifyAdminSession();

  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/account/");
    revalidatePath("/dashboard/users");
    return { data: deletedUser.id, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete user.", data: null };
  }
}

export async function getUserById(userId: string) {
  await verifyAdminSession();

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        password: true,
        token: true,
        code: true,
        engraving: true,
      },
    });
    return { data: user, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch user.", data: null };
  }
}

export async function getUserList() {
  await verifyAdminSession();

  try {
    const user = await prisma.user.findMany({
      omit: {
        password: true,
        token: true,
        code: true,
        engraving: true,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function verifyBusinessCode(businessCode: string) {
  await verifyAdminSession();

  try {
    const users = await prisma.user.findMany({
      where: {
        businessCode: {
          equals: businessCode,
        },
      },
    });
    return users;
  } catch (error) {
    console.error(error);
    return null;
  }
}
