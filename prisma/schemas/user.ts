import * as yup from "yup";

// Reusable Definitions.
const emailValidation = yup
  .string()
  .email("Invalid email address")
  .required("Email is required");

const passwordValidation = yup
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password cannot exceed 100 characters") // Max length for security
  .required("Password is required");

const nameValidation = yup
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name cannot exceed 50 characters")
  .required("Name is required");

const businessNameValidation = yup
  .string()
  .min(2, "Business name must be at least 2 characters")
  .max(100, "Business name cannot exceed 100 characters")
  .required("Business name is required");

const businessCodeValidation = yup
  .string()
  .min(3, "Business code must be at least 3 characters")
  .max(20, "Business code cannot exceed 20 characters")
  .matches(/^[A-Z]{2}[0-9]{4}$/, "Code must match this format AA1111.")
  .optional()
  .nullable();

const roleValidation = yup
  .string()
  .oneOf(["user", "admin"], "Invalid role specified")
  .default("user");

const engravingValidation = yup
  .object({
    // Define structure of your engraving JSON here if known
    // Example:
    text: yup.string().optional().max(255),
    font: yup.string().optional(),
    size: yup.number().optional().positive(),
  })
  .optional()
  .nullable();

const codeValidation = yup
  .number()
  .integer("Code must be an integer")
  .positive("Code must be a positive number")
  .optional()
  .nullable();

const isActiveValidation = yup.boolean().default(false);

/**
 * Schema for creating a new User.
 */
export const UserCreateSchema = yup
  .object({
    name: nameValidation,
    email: emailValidation,
    password: passwordValidation,
    businessCode: businessCodeValidation,
    businessName: businessNameValidation,
    role: roleValidation,
  })
  .required();

// Type inference for client-side forms.
export type UserCreateInput = yup.InferType<typeof UserCreateSchema>;

/**
 * Schema for updating an existing User's profile.
 * All fields are optional because a user might only update one field.
 */
export const UserUpdateSchema = yup
  .object({
    name: nameValidation.optional(),
    businessCode: businessCodeValidation,
    businessName: businessNameValidation.optional(),
    role: roleValidation.optional(), // Admin-only updates.
    engraving: engravingValidation,
    isActive: isActiveValidation.optional(), // Admin-only updates.
    code: codeValidation,
  })
  .required();

// Type inference for client-side forms
export type UserUpdateInput = yup.InferType<typeof UserUpdateSchema>;

/**
 * Schema specifically for user login.
 * Minimal fields required for authentication.
 */
export const UserAuthSchema = yup
  .object({
    email: emailValidation,
    password: passwordValidation,
  })
  .required();

// Type inference for client-side forms
export type UserAuthInput = yup.InferType<typeof UserAuthSchema>;

/**
 * Schema for updating only a user's password.
 */
export const UserPasswordUpdateSchema = yup
  .object({
    currentPassword: passwordValidation.optional(),
    newPassword: passwordValidation
      .notOneOf(
        [yup.ref("currentPassword")],
        "New password cannot be the same as old password"
      )
      .required("New password is required"),
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Passwords must match")
      .required("Confirm new password is required"),
  })
  .required();

// Type inference for client-side forms
export type UserPasswordUpdateInput = yup.InferType<typeof UserPasswordUpdateSchema>;
