"use server";

import * as yup from "yup";
import {
  findUserById,
  updateUser,
  updateUserPassword,
  DalResponse,
} from "@/prisma/access/user";
import {
  UserUpdateSchema,
  UserUpdateInput,
  UserPasswordUpdateInput,
  UserPasswordUpdateSchema,
} from "@/prisma/schemas/user";
import { redirect } from "next/navigation";
import { SessionPayload } from "@/lib/jwt";

interface FormActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: { [key: string]: string };
}

// Action to fetch user profile data for display.
export async function getUserProfile(userId: string): Promise<DalResponse<any>> {
  const result = await findUserById(userId);
  return result;
}

// Action to handle profile update form submission.
export async function updateProfileAction(
  prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const userId = formData.get("userId")?.toString();
  if (!userId) {
    return { success: false, message: "User ID is missing." };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    businessCode: formData.get("businessCode"),
    businessName: formData.get("businessName"),
  };

  try {
    // 1. Validate data using Yup schema.
    const validatedData: UserUpdateInput = await UserUpdateSchema.validate(rawData, {
      abortEarly: false,
      stripUnknown: true,
    });

    // 2. Call Access function.
    const result: DalResponse<{ id: string }> = await updateUser(userId, validatedData);

    if (!result.success) {
      // Handle access-level errors (e.g., unauthorized, email taken).
      if (result.statusCode === 409) {
        return {
          success: false,
          message: result.error,
          fieldErrors: { email: result.error || "Email already taken." },
        };
      }
      return { success: false, message: result.error || "Failed to update profile." };
    }

    return { success: true, message: "Profile updated successfully!" };
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
        message: "Validation failed. Please check your inputs.",
        fieldErrors,
      };
    }
    console.error("Server Action Error (updateProfileAction):", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// Action to handle password update form submission.
export async function updatePasswordAction(
  prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const userId = formData.get("userId")?.toString();
  if (!userId) {
    return { success: false, message: "User ID is missing." };
  }

  const rawData = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  };

  try {
    const validatedData: UserPasswordUpdateInput =
      await UserPasswordUpdateSchema.validate(rawData, {
        abortEarly: false,
        stripUnknown: true,
      });

    const result: DalResponse<void> = await updateUserPassword(userId, validatedData);

    if (!result.success) {
      return { success: false, message: result.error || "Failed to update password." };
    }

    return { success: true, message: "Password updated successfully!" };
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
        message: "Validation failed. Please check your inputs.",
        fieldErrors,
      };
    }
    console.error("Server Action Error (updatePasswordAction):", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
