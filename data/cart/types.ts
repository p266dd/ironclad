import { Prisma } from "@/lib/generated/prisma";

export interface ICreateCartProduct {
  productId: string;
  details: Prisma.JsonValue;
  brand: string;
  handle: string;
  request: string;
}
