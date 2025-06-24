import { Prisma } from "./generated/prisma";

export interface ActionFormInitialState {
  success: boolean;
  message?: string | undefined;
  fieldErrors?: Record<string, string> | undefined;
}

// Product Types

export type TActiveFilters = {
  tag: string | null;
  search: TSearchFields | null;
};

export type TSearchFields = {
  searchTerm?: string;
  style?: string;
  stock?: string;
  price: string;
  brand: string | string[];
  material: string | string[];
};

export type TProductStockUpdate = {
  sizeId: number;
  decrementAmount: number;
  productId: string;
};

export type TProductDetails = {
  id: number;
  sizeId: number;
  quantity: number;
};

export type TProductItemResult = Prisma.ProductGetPayload<{
  include: { filters: true; media: true; thumbnail: true };
}>;

// User / Account Types

export type TAccountChange = {
  name?: string;
  email?: string;
  password?: string;
  businessName?: string;
  businessCode?: string | undefined | null;
  engraving?: Prisma.JsonArray | null | undefined;
} | null;

export type TEngravingPreference = {
  slug: string;
  name: string;
};

// Cart Types

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

// Order Types

export type TCreateOrderProduct = {
  product: { connect: { id: string } };
  brand: string;
  handle: string;
  request: string | null;
  details: Prisma.JsonArray;
};

export type TOrderWithConnection = Prisma.OrderGetPayload<{
  select: {
    id: true;
    client: {
      select: {
        name: true;
      };
    };
    code: true;
    createdAt: true;
    orderProduct: {
      select: {
        details: true;
        brand: true;
        handle: true;
        request: true;
        product: {
          include: {
            sizes: true;
          };
        };
      };
    };
  };
}>;
