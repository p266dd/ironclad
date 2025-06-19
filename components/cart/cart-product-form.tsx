"use client";

import SingleCartProduct from "./cart-product";
import { Button } from "@/components/ui/button";
import { ShoppingBagIcon, XCircleIcon } from "lucide-react";

import { clearCart } from "@/data/cart/actions";

// Types
import { CartProductWithRelations } from "@/lib/types";

export default function CartProduct({
  cartProducts,
  shoppingCartId,
}: {
  cartProducts: CartProductWithRelations[];
  shoppingCartId: string;
}) {
  return (
    <div className="flex flex-col gap-y-8 gap-x-20 lg:flex-row">
      <div className="flex flex-col gap-3">
        {cartProducts.map((product) => (
          <SingleCartProduct key={product.id} product={product} />
        ))}
      </div>
      <div>
        <form className="flex items-center gap-4 lg:flex-col lg:items-start" action="">
          <input type="hidden" name="shoppingCartId" value={shoppingCartId} readOnly />

          <Button type="submit" variant="default" size="lg">
            <ShoppingBagIcon />
            Order Now!
          </Button>

          <Button
            onClick={() => clearCart(shoppingCartId)}
            type="button"
            variant="outline"
            size="lg"
          >
            <XCircleIcon />
            Clear cart
          </Button>
        </form>
      </div>
    </div>
  );
}
