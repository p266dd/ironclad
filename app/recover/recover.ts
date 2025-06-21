"use server";

import * as yup from "yup";

import { RecoverAuthSchema, RecoverAuthInput } from "@/prisma/schemas/user";
import { sendEmail } from "@/lib/nodemailer";
import { getUserForAuth, insertUserToken } from "@/data/user/actions";
import { SignJWT } from "jose";
import path from "path";

// Email
import { RecoverEmailHTML, RecoverEmailText } from "./email";

// Types
import { ActionFormInitialState } from "@/lib/types";

export async function recover(
  _prevState: ActionFormInitialState,
  formData: FormData
): Promise<ActionFormInitialState> {
  const email = formData.get("email");

  const inputData: RecoverAuthInput = {
    email: typeof email === "string" ? email : "",
  };

  try {
    // Validate data.
    const validatedData = await RecoverAuthSchema.validate(inputData, {
      abortEarly: false,
    });

    // Find user by email.
    const userResult = await getUserForAuth(validatedData.email);

    // User not found.
    if (userResult.error || userResult.data === null) {
      return { success: false, message: "Invalid credentials. Please try again." };
    }

    const user = userResult.data as {
      id: string;
      name: string;
      email: string;
      role: string;
    };

    const secretValue = process.env.JWT_SECRET;
    const baseUrlValue = process.env.NEXT_PUBLIC_BASE_URL;

    if (!secretValue) {
      console.error("Recover Action Error: JWT_SECRET is not defined.");
      return {
        success: false,
        message: "An internal server error occurred. Please try again later.",
      };
    }
    if (!baseUrlValue) {
      console.error("Recover Action Error: NEXT_PUBLIC_BASE_URL is not defined.");
      return {
        success: false,
        message: "An internal server error occurred. Please try again later.",
      };
    }

    // Generate jwt token.
    const secret = new TextEncoder().encode(secretValue);
    const token = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(new Date(Date.now() + 3 * 60 * 60 * 1000))
      .sign(secret);

    // Insert token into user's database.
    const updatedUser = await insertUserToken(token, user.id);

    if (updatedUser.error) {
      return { success: false, message: "An error occured. Please try again." };
    }

    const code = `${baseUrlValue}/reset?token=${token}`; // Use validated baseUrlValue

    await sendEmail({
      to: validatedData.email,
      subject: "Password Reset",
      html: RecoverEmailHTML({ code }),
      text: RecoverEmailText({ code }),
      attachments: [
        {
          filename: "logo.png",
          path: path.join(process.cwd(), "public", "logo.png"),
          cid: "logo@ironclad",
        },
      ],
    });

    return {
      success: true,
      message: "If an account with that email exists, a recovery link has been sent.",
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
      console.error("Authentication server action failed:", error);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      };
    }
  }
}
