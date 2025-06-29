"use server";

import * as yup from "yup";
import { UserCreateSchema, UserCreateInput } from "@/prisma/schemas/user";
import { createUserForAuth } from "@/data/user/actions";
import { sendEmail } from "@/lib/nodemailer";
import {
  RegistrationEmailHTML,
  RegistrationEmailStaffHTML,
  RegistrationEmailText,
  RegistrationEmailStaffText,
} from "./email";

// Types
import { ActionFormInitialState } from "@/lib/types";

export async function signupUser(
  prevState: ActionFormInitialState,
  formData: FormData
): Promise<ActionFormInitialState> {
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

    const userData = {
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      businessName: validatedData.businessName,
      businessCode: validatedData.businessCode,
      role: validatedData.role,
    };

    // Create the user
    const result = await createUserForAuth(userData);

    if (result.error) {
      return { success: false, message: result.error || "Failed to create account." };
    }

    // Send confirmation email.
    await sendEmail({
      to: validatedData.email,
      subject: "Account Registration",
      html: RegistrationEmailHTML,
      text: RegistrationEmailText,
    });

    // Send confirmation email to staff.
    await sendEmail({
      to: "staff@ironcladknives.com",
      subject: "New Account Registration",
      html: RegistrationEmailStaffHTML,
      text: RegistrationEmailStaffText,
    });

    return {
      success: true,
      message: "Account created successfully. Our staff will review your application.",
    };
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
