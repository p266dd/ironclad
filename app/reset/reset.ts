"use server";

import * as yup from "yup";
import { UserPasswordResetSchema, UserPasswordResetInput } from "@/prisma/schemas/user";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { SessionPayload, ResetTokenPayload, decryptResetToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

// Define the return type for the server action.
interface ResetActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: { [key: string]: string };
}

// Initial state for useActionState.
const initialState: ResetActionResult = {
  success: false,
  message: undefined,
  fieldErrors: undefined,
};

export async function resetPassword(
  prevState: ResetActionResult,
  formData: FormData
): Promise<ResetActionResult> {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPasssword");
  const token = formData.get("token");

  const inputData: UserPasswordResetInput = {
    password: typeof password === "string" ? password : "",
    confirmPassword: typeof password === "string" ? password : "",
    token: typeof token === "string" ? token : "",
  };

  try {
    // Validate data.
    const validatedData = await UserPasswordResetSchema.validate(inputData, {
      abortEarly: false, // Collect all errors
    });

    if (validatedData.password !== validatedData.confirmPassword) {
      return {
        success: false,
        message: "Passwords do not match.",
      };
    }

    if (validatedData.token.length === 0) {
      return {
        success: false,
        message: "Token is missing.",
      };
    }

    // Decrypt token to access user's id.
    const tokenPayload = await decryptResetToken(validatedData.token);
    const userId = tokenPayload?.id;

    if (!userId) {
      return {
        success: false,
        message: "Invalid token.",
      };
    }

    // Hash password.
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Update user's password.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
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

    // Create a session payload that matches your SessionPayload interface.
    const sessionPayload: SessionPayload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role as "user" | "admin",
    };

    // Create the session.
    await createSession(sessionPayload);

    return { success: true, message: "Password reset successfully!" };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const fieldErrors: { [key: string]: string } = {};
      error.inner.forEach((err) => {
        if (err.path) {
          fieldErrors[err.path] = err.message;
        }
      });
      return {
        success: false,
        message: "Validation failed.",
        fieldErrors: fieldErrors,
      };
    } else {
      console.error("Authentication server action failed:", error);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      };
    }
  }
}
