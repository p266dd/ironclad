import * as yup from "yup";

// Reusable Definitions for CartProduct schemas
const detialsValidation = yup.array().of(
  yup.object({
    sizeId: yup.number().required(),
    quantity: yup.number().required(),
  })
);

/**
 * Schema for add a product to a cart..
 */
export const CartProductCreateSchema = yup
  .object({
    cartId: yup.string(),
    productId: yup.string(),
    details: detialsValidation,
    brand: yup.string(),
    handle: yup.string(),
    request: yup.string(),
    brandOther: yup.string().optional(),
    handleOther: yup.string().optional(),
  })
  .required();

// Type inference for client-side forms.
export type CartProductCreateInput = yup.InferType<typeof CartProductCreateSchema>;
