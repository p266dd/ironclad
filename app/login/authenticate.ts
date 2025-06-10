"use server";

import * as yup from "yup";
import { UserAuthSchema, UserAuthInput } from "@/prisma/schemas/user";
import { findUserByEmailForAuth } from "@/prisma/access/user";
import { createSession } from "@/lib/session";
import { SessionPayload } from "@/lib/jwt";
import bcrypt from "bcryptjs";

// Define the return type for the server action.
interface LoginActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: { [key: string]: string };
}

// Initial state for useActionState.
const initialState: LoginActionResult = {
  success: false,
  message: undefined,
  fieldErrors: undefined,
};

export async function authenticateUser(
  prevState: LoginActionResult,
  formData: FormData
): Promise<LoginActionResult> {
  const email = formData.get("email");
  const password = formData.get("password");

  const inputData: UserAuthInput = {
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
  };

  try {
    // Validate data.
    const validatedData = await UserAuthSchema.validate(inputData, {
      abortEarly: false, // Collect all errors
    });

    // Find user by email.
    const userResult = await findUserByEmailForAuth(validatedData.email);

    if (!userResult.success || !userResult.data) {
      // User not found.
      return { success: false, message: "Invalid credentials. Please try again." };
    }

    const user = userResult.data;

    // Verify password.
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid credentials. Please try again." };
    }

    // Create a session payload that matches your SessionPayload interface.
    const sessionPayload: SessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "user" | "admin",
    };

    // Create the session.
    await createSession(sessionPayload);

    return { success: true, message: "Login successful!" };
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
