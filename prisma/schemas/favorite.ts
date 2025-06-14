import * as yup from "yup";

// Basic string validation for required fields.
const stringRequired = yup.string().trim().required("This field is required.");

// Field Validations
const clientIdValidation = stringRequired; // Implicitly "Client ID is required." via stringRequired
const productIdValidation = stringRequired; // Implicitly "Product ID is required." via stringRequired

// Nested Schema for Favorite Product Items

// Schema for an individual product item within a favorites list.
// This defines the structure of each element in the 'products' array.
const favoriteProductItemSchema = yup.object({
  productId: productIdValidation,
});

// Type inference for a single favorite product item.
export type FavoriteProductItem = yup.InferType<typeof favoriteProductItemSchema>;

// Validation for the array of products when creating a favorite list.
// It must contain at least one product.
const createFavoriteProductsArrayValidation = yup
  .array(favoriteProductItemSchema)
  .min(1, "At least one product must be selected for favorites.")
  .required("A list of products is required.");

// Validation for the array of products when updating a favorite list.
// An empty array is allowed (to clear favorites), and the array can be null.
const updateFavoriteProductsArrayValidation = yup
  .array(favoriteProductItemSchema)
  .nullable();

// Schemas for Operations

/**
 * Schema for creating a new Favorite list for a user.
 * Associates a clientId with an initial list of productIds.
 */
export const FavoriteCreateSchema = yup
  .object({
    clientId: clientIdValidation,
    products: createFavoriteProductsArrayValidation, // e.g., [{ productId: "uuid1" }, { productId: "uuid2" }]
  })
  .required();

export type FavoriteCreateInput = yup.InferType<typeof FavoriteCreateSchema>;

/**
 * Schema for updating an existing Favorite list.
 * Allows replacing the entire list of favorited products.
 * The Favorite list to update is typically identified by `clientId` or `favoriteId` (e.g., via URL parameter).
 */
export const FavoriteUpdateSchema = yup
  .object({
    // If 'products' is provided as an array (even empty), it replaces the existing list.
    // If 'products' is null, it can be interpreted as clearing the list.
    // If 'products' key is omitted, the list remains unchanged.
    products: updateFavoriteProductsArrayValidation.optional(),
  })
  .required(); // The update payload object itself is required.

export type FavoriteUpdateInput = yup.InferType<typeof FavoriteUpdateSchema>;

/**
 * Schema for listing/searching a user's favorites.
 * Primarily filtered by `clientId`.
 */
export const FavoriteSearchSchema = yup
  .object({
    clientId: clientIdValidation.optional(), // Often required, but optional if admin lists all or context provides it
    page: yup.number().integer().positive().default(1).optional(),
    limit: yup.number().integer().positive().default(10).optional(),
  })
  .required();

export type FavoriteSearchInput = yup.InferType<typeof FavoriteSearchSchema>;

// Schemas for Granular Favorite Product Actions

/**
 * Schema for adding a single product to a user's favorites.
 * `clientId` might be inferred from authenticated user context on the server.
 */
export const FavoriteAddProductSchema = yup.object({
  productId: productIdValidation,
}); // clientId would be external or from context
export type FavoriteAddProductInput = yup.InferType<typeof FavoriteAddProductSchema>;

/**
 * Schema for removing a single product from a user's favorites.
 * `clientId` might be inferred.
 */
export const FavoriteRemoveProductSchema = yup.object({
  productId: productIdValidation,
}); // clientId would be external or from context
export type FavoriteRemoveProductInput = yup.InferType<
  typeof FavoriteRemoveProductSchema
>;
