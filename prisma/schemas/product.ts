import * as yup from "yup";

// Basic string validation for required fields.
const stringRequired = yup.string().trim().required("This field is required.");

// Basic string validation for optional fields.
const stringOptional = yup.string().trim().optional().nullable();

// Product description validation (optional).
const descriptionValidation = stringOptional.max(
  1000,
  "Description cannot exceed 1000 characters."
);

// For 'type', 'name', 'brand', 'material', 'handle'.
const nameValidation = stringRequired;
const typeValidation = stringRequired;
const brandValidation = stringRequired;
const materialValidation = stringRequired;
const handleValidation = stringRequired;

// For `canChangeHandle` boolean field.
const canChangeHandleValidation = yup
  .boolean()
  .default(false)
  .required("Please specify if handle can be changed.");

// For `style` (optional).
const styleValidation = stringOptional;

// For `thumbnailId` (string, optional, positive).
const thumbnailIdValidation = yup.string().optional().nullable();

// For `media` nested object schema.
const mediaValidation = yup
  .array(
    yup.object({
      name: yup
        .string()
        .required("Please specify a name for the media.")
        .max(50, "Name is too long.")
        .trim(),
      url: yup.string().required().trim(),
      productId: yup.string().optional().nullable(),
      thumbnailFor: yup.string().optional().nullable(),
      blob: yup.object().optional().nullable(),
    })
  )
  .min(1, "At least one media per product is required.")
  .required("Media is required.");

// For `sizes` nested object schema.
const sizesValidation = yup
  .array(
    yup.object({
      name: yup
        .string()
        .required("Please specify a name for the size.")
        .max(50, "Name is too long.")
        .trim(),
      size: yup.string().required("Please specify a size."),
      price: yup
        .number()
        .required("Please type a price.")
        .integer("Price must be an integer.")
        .default(0),
      stock: yup
        .number()
        .required("Please type a stock.")
        .integer("Stock must be an integer.")
        .default(0),
      productId: yup.string().optional().nullable(),
    })
  )
  .min(1, "At least one size per product is required.")
  .required("Sizes are required.");

// Infer type for a single size object
export type ProductSizeInput = yup.InferType<typeof sizesValidation>[number];

// For `filters` an array of strings, e.g., ["color:red"])
const filtersValidation = yup
  .array(
    yup.object({
      name: yup
        .string()
        .required("Please specify a name for the size.")
        .max(50, "Name is too long.")
        .trim(),
      products: yup.array(
        yup.string().required("Please specify a product id.").optional().nullable()
      ),
    })
  )
  .optional()
  .nullable();

// Schemas for Product Operations.

/**
 * Schema for creating a new Product.
 */
export const ProductCreateSchema = yup
  .object({
    type: typeValidation,
    name: nameValidation,
    description: descriptionValidation,
    brand: brandValidation,
    handle: handleValidation,
    canChangeHandle: canChangeHandleValidation,
    style: styleValidation,
    material: materialValidation,
    media: mediaValidation,
    thumbnailId: thumbnailIdValidation,
    sizes: sizesValidation,
    filters: filtersValidation,
  })
  .required();

// Type inference for client-side forms.
export type ProductCreateInput = yup.InferType<typeof ProductCreateSchema>;

/**
 * Schema for updating an existing Product.
 * All fields are optional because a partial update is common.
 */
export const ProductUpdateSchema = yup
  .object({
    type: typeValidation.optional(),
    name: nameValidation.optional(),
    description: descriptionValidation,
    brand: brandValidation.optional(),
    handle: handleValidation.optional(),
    canChangeHandle: canChangeHandleValidation.optional(),
    style: styleValidation,
    material: materialValidation.optional(),
    thumbnailId: thumbnailIdValidation,
    sizes: sizesValidation.optional(),
    filters: filtersValidation,
  })
  .required();

// Type inference for client-side forms
export type ProductUpdateInput = yup.InferType<typeof ProductUpdateSchema>;

/**
 * Schema for validating product search or filter parameters.
 * All fields are optional and often allow partial matches.
 */
export const ProductSearchSchema = yup
  .object({
    type: yup.string().optional(),
    name: yup.string().optional(),
    brand: yup.string().optional(),
    material: yup.string().optional(),
    style: yup.string().optional(),
    // For filters/sizes in search, you might accept single strings or arrays
    size: yup.string().optional(),
    filter: yup.string().optional(),
    minPrice: yup.number().positive("Minimum price must be positive.").optional(),
    maxPrice: yup.number().positive("Maximum price must be positive.").optional(),
    page: yup.number().integer().positive().default(1),
    limit: yup.number().integer().positive().default(10),
  })
  .required();

// Type inference for search query parameters
export type ProductSearchInput = yup.InferType<typeof ProductSearchSchema>;
