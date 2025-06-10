"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";
import {
  UserCreateInput,
  UserUpdateInput,
  UserPasswordUpdateInput,
} from "@/prisma/schemas/user";
import bcrypt from "bcryptjs";
import { SessionPayload } from "@/lib/jwt";
import { JsonValue } from "@/lib/generated/prisma/runtime/library";

// Type Definitions for Responses
export interface DalResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string;
  statusCode?: number;
}

/**
 * Creates a new user in the database.
 * No session verification here as it's for user creation.
 *
 * @param userData The data for the new user, validated by UserCreateInput.
 * @returns A DalResponse indicating success/failure, with the created user's ID on success.
 */
export async function createUser(
  userData: UserCreateInput
): Promise<DalResponse<{ id: string }>> {
  try {
    // 1. Hash the password.
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 2. Create the user in the database.
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword, // Store hashed password.
      },
      select: {
        id: true, // Only return the ID for security.
      },
    });

    return { success: true, data: { id: newUser.id } };
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return {
        success: false,
        error: "This email is already registered.",
        statusCode: 409,
      };
    }
    console.error("Access Error: Failed to create user:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating the user.",
      statusCode: 500,
    };
  }
}

/**
 * Finds a user by their ID.
 * Secured: Requires a valid user session.
 *
 * @param userId The ID of the user to find.
 * @returns A DalResponse containing the user data (excluding sensitive fields) or null.
 */
export async function findUserById(
  userId: string
): Promise<DalResponse<Omit<SessionPayload, "iat" | "exp">>> {
  // Ensure user is logged in.
  const session = await verifyUserSession();

  if (!session) {
    return { success: false, error: "Authentication required.", statusCode: 401 };
  }

  // Ensure the user is requesting their own profile unless they are an admin.
  if (session.id !== userId && session.role !== "admin") {
    return { success: false, error: "Unauthorized access.", statusCode: 403 };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessCode: true,
        businessName: true,
        engraving: true,
        isActive: true,
        // Exclude sensitive fields like password, token, code.
        // createdAt, updatedAt can be included if desired.
      },
    });

    if (!user) {
      return { success: false, data: null, error: "User not found.", statusCode: 404 };
    }

    // Cast `engraving` to `JsonValue` for type safety (if it's not already)
    const userWithoutTimestamps = {
      ...user,
      engraving: user.engraving as JsonValue,
    };

    return { success: true, data: userWithoutTimestamps };
  } catch (error) {
    console.error(`Access Error: Failed to find user with ID ${userId}:`, error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching user data.",
      statusCode: 500,
    };
  }
}

/**
 * Finds a user by their email.
 *
 * @param email The email of the user to find.
 * @returns A DalResponse containing the user data (excluding sensitive fields) or null.
 */
export async function findUserByEmail(
  email: string
): Promise<DalResponse<Omit<SessionPayload, "iat" | "exp">>> {
  const session = await verifyUserSession();
  if (!session) {
    return { success: false, error: "Admin authentication required.", statusCode: 401 };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessCode: true,
        businessName: true,
        engraving: true,
        isActive: true,
        // Exclude sensitive fields like password, token, code.
        // createdAt, updatedAt can be included if desired.
      },
    });

    if (!user) {
      return { success: false, data: null, error: "User not found.", statusCode: 404 };
    }

    const userWithoutTimestamps = {
      ...user,
      engraving: user.engraving as JsonValue,
    };

    return { success: true, data: userWithoutTimestamps };
  } catch (error) {
    console.error(`Access Error: Failed to find user by email ${email}:`, error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching user data.",
      statusCode: 500,
    };
  }
}

/**
 * Updates an existing user's profile.
 * Secured: Requires a valid user session. Users can only update their own profile, admins can update any.
 *
 * @param userId The ID of the user to update.
 * @param updates The partial user data to update, validated by UserUpdateInput.
 * @returns A DalResponse indicating success/failure, with the updated user's ID on success.
 */
export async function updateUser(
  userId: string,
  updates: UserUpdateInput
): Promise<DalResponse<{ id: string }>> {
  const session = await verifyUserSession();
  if (!session) {
    return { success: false, error: "Authentication required.", statusCode: 401 };
  }

  // Authorization check: User can only update their own profile unless they are an admin.
  if (session.id !== userId && session.role !== "admin") {
    return {
      success: false,
      error: "Unauthorized to update this user's profile.",
      statusCode: 403,
    };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        engraving: updates.engraving ? (updates.engraving as any) : undefined, // Ensure correct JsonValue type
        updatedAt: new Date(),
      },
      select: { id: true },
    });

    return { success: true, data: { id: updatedUser.id } };
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return { success: false, error: "This email is already taken.", statusCode: 409 };
    }
    console.error(`Access Error: Failed to update user with ID ${userId}:`, error);
    return {
      success: false,
      error: "An unexpected error occurred while updating the user.",
      statusCode: 500,
    };
  }
}

/**
 * Updates a user's password.
 * Secured: Requires a valid user session. User can update their own password, admin can update any.
 * This function also requires the `currentPassword` for non-admin users for security.
 *
 * @param userId The ID of the user whose password to update.
 * @param passwordData Contains currentPassword and newPassword, validated by UserPasswordUpdateInput.
 * @returns A DalResponse indicating success/failure.
 */
export async function updateUserPassword(
  userId: string,
  passwordData: UserPasswordUpdateInput
): Promise<DalResponse<void>> {
  const session = await verifyUserSession();
  if (!session) {
    return { success: false, error: "Authentication required.", statusCode: 401 };
  }

  // Authorization: User can update their own password, or admin can update any.
  if (session.id !== userId && session.role !== "admin") {
    return {
      success: false,
      error: "Unauthorized to change this user's password.",
      statusCode: 403,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, role: true },
    });

    if (!user) {
      return { success: false, error: "User not found.", statusCode: 404 };
    }

    // For non-admin users, verify current password.
    if (session.role !== "admin") {
      if (!passwordData.currentPassword) {
        return {
          success: false,
          error: "Current password is required to change password.",
          statusCode: 400,
        };
      }
      const isMatch = await bcrypt.compare(passwordData.currentPassword, user.password);
      if (!isMatch) {
        return { success: false, error: "Incorrect current password.", statusCode: 401 };
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error(
      `Access Error: Failed to update password for user ID ${userId}:`,
      error
    );
    return {
      success: false,
      error: "An unexpected error occurred while updating the password.",
      statusCode: 500,
    };
  }
}

/**
 * Deletes a user from the database.
 * Secured: Requires an admin session.
 *
 * @param userId The ID of the user to delete.
 * @returns A DalResponse indicating success/failure.
 */
export async function deleteUser(userId: string): Promise<DalResponse<void>> {
  // Only admins can delete users
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: "Admin authentication required.", statusCode: 401 };
  }

  // Prevent admin from deleting themselves.
  if (session.id === userId) {
    return {
      success: false,
      error: "Admin cannot delete their own account through this endpoint.",
      statusCode: 403,
    };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2025") {
      // Prisma record not found error code
      return { success: false, error: "User not found for deletion.", statusCode: 404 };
    }
    console.error(`Access Error: Failed to delete user with ID ${userId}:`, error);
    return {
      success: false,
      error: "An unexpected error occurred while deleting the user.",
      statusCode: 500,
    };
  }
}

/**
 * Retrieves all users from the database.
 * Secured: Requires an admin session.
 *
 * @returns A DalResponse containing an array of user data (excluding sensitive fields).
 */
export async function getAllUsers(): Promise<
  DalResponse<Omit<SessionPayload, "iat" | "exp">[]>
> {
  // Only admins can view all users.
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: "Admin authentication required.", statusCode: 401 };
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessCode: true,
        businessName: true,
        engraving: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Map and cast engraving
    const usersFormatted = users.map((user) => ({
      ...user,
      engraving: user.engraving as JsonValue,
    }));

    return { success: true, data: usersFormatted };
  } catch (error) {
    console.error("Access Error: Failed to retrieve all users:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching users.",
      statusCode: 500,
    };
  }
}

/**
 * Finds a user by email, specifically for authentication purposes.
 * This function is NOT for public display of user data.
 * It selects the hashed password.
 * It does NOT perform session verification, as it's part of establishing a session.
 *
 * @param email The email of the user.
 * @returns A DalResponse containing essential auth data (id, name, email, role, password) or null.
 */
export async function findUserByEmailForAuth(
  email: string
): Promise<
  DalResponse<{ id: string; name: string; email: string; role: string; password: string }>
> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      return { success: false, data: null, error: "User not found.", statusCode: 404 };
    }

    // SECURITY RISK! Return the user data including the password hash.
    return { success: true, data: user };
  } catch (error) {
    console.error(`Access Error: Failed to find user by email for auth ${email}:`, error);
    return {
      success: false,
      error: "An unexpected error occurred during user lookup.",
      statusCode: 500,
    };
  }
}
