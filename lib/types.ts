import { Prisma } from "./generated/prisma";

export interface ActionFormInitialState {
  success: boolean;
  message?: string | undefined;
  fieldErrors?: Record<string, string> | undefined;
}

export type TActiveFilters = {
  tag: string | null;
  search: TSearchFields | null;
};

export type TSearchFields = {
  searchTerm?: string;
  style?: string;
  stock?: string;
  price: string;
  size: string;
  brand: string | string[];
  material: string | string[];
};

export type CartProductWithRelations = Prisma.CartProductGetPayload<{
  include: {
    product: {
      include: {
        thumbnail: true;
        sizes: true;
      };
    };
  };
}>;

export type TProductItemResult = Prisma.ProductGetPayload<{
  include: { filters: true; media: true; thumbnail: true };
}>;

export type TAccountChange = {
  name?: string;
  email?: string;
  password?: string;
  businessName?: string;
  businessCode?: string | undefined | null;
  engraving?: Prisma.JsonArray | null | undefined;
} | null;
