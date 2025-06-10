"use server";

import * as yup from "yup";
import { UserCreateSchema, UserCreateInput } from "@/prisma/schemas/user";
import { sendEmail } from "@/lib/nodemailer";
import { RegistrationEmailHTML, RegistrationEmailText } from "./email";
import { createUser } from "@/prisma/access/user";

// Type Definitions
interface FormActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: { [key: string]: string };
}

const initialState: FormActionResult = {
  success: false,
  message: undefined,
  fieldErrors: undefined,
};

export async function signupUser(
  prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const businessName = formData.get("businessName");

  const inputData: UserCreateInput = {
    name: typeof name === "string" ? name : "",
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
    businessName: typeof businessName === "string" ? businessName : "",
    role: "user",
  };

  try {
    // Validate Data.
    const validatedData = await UserCreateSchema.validate(inputData, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Create the user
    const result = await createUser(validatedData);

    if (!result.success) {
      if (result.statusCode === 409) {
        return {
          success: false,
          message: result.error,
          fieldErrors: { email: result.error || "Email already in use." },
        };
      }
      return { success: false, message: result.error || "Failed to create account." };
    }

    // Send confirmation email.
    await sendEmail({
      to: validatedData.email,
      subject: "Account Registration",
      html: RegistrationEmailHTML,
      text: RegistrationEmailText,
    });

    return { success: true, message: "Account created successfully." };
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
      console.error("Signup server action failed:", error);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      };
    }
  }
}
