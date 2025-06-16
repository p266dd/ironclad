"use server";

import * as yup from "yup";
import { UserPasswordResetSchema, UserPasswordResetInput } from "@/prisma/schemas/user";
import { updateUserPasswordForAuth } from "@/data/user/actions";
import { createSession, SessionPayload } from "@/lib/session";
import { ResetTokenPayload, decryptResetToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

// Types
import { ActionFormInitialState } from "@/lib/types";

export async function resetPassword(
  prevState: ActionFormInitialState,
  formData: FormData
): Promise<ActionFormInitialState> {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const token = formData.get("token");

  const inputData: UserPasswordResetInput = {
    password: typeof password === "string" ? password : "",
    confirmPassword: typeof confirmPassword === "string" ? confirmPassword : "",
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
    const tokenPayload: ResetTokenPayload | null = await decryptResetToken(
      validatedData.token
    );
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
    const updatedUser = await updateUserPasswordForAuth(hashedPassword, userId);

    if (updatedUser.error) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const user = updatedUser.data as {
      id: string;
      name: string;
      email: string;
      role: string;
    };

    // Create a session payload that matches your SessionPayload interface.
    const sessionPayload: SessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "user" | "admin",
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
