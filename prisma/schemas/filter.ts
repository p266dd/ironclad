import * as yup from "yup";

// For name field.
const nameValidation = yup.string().trim().required("Name is required.");

// Infer type for a single filter object
export type FilterInput = yup.InferType<typeof nameValidation>[number];

// Schemas for Filter Operations.

/**
 * Schema for creating a new Filter.
 */
export const FilterCreateSchema = yup.object({
  name: nameValidation,
});

// Type inference for client-side forms.
export type FilterCreateInput = yup.InferType<typeof FilterCreateSchema>;

/**
 * Schema for updating an existing Filter.
 * All fields are optional because a partial update is common.
 */
export const ProductUpdateSchema = yup.object({
  name: nameValidation.optional(),
});

// Type inference for client-side forms.
export type ProductUpdateInput = yup.InferType<typeof ProductUpdateSchema>;
