"use server";

import * as yup from "yup";
import { UserAuthSchema, UserAuthInput } from "@/prisma/schemas/user";
import { createSession, SessionPayload } from "@/lib/session";
import { getUserForAuth } from "@/data/user/actions";
import bcrypt from "bcryptjs";

// Types
import { ActionFormInitialState } from "@/lib/types";

export async function authenticateUser(
  _prevState: ActionFormInitialState,
  formData: FormData
): Promise<ActionFormInitialState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const inputData: UserAuthInput = {
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
  };

  try {
    // Validate data.
    const validatedData = await UserAuthSchema.validate(inputData, {
      abortEarly: false,
    });

    // Find user by email.
    const userResult = await getUserForAuth(validatedData.email);

    console.log(userResult);

    if (userResult.error || userResult.data === null) {
      // User not found.
      return { success: false, message: "Invalid credentials. Please try again." };
    }

    const user = userResult.data as {
      id: string;
      name: string;
      email: string;
      password: string;
      role: string;
    };

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
