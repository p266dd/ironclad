"use client";

import { useRouter } from "next/navigation";
import SingleCartProduct from "./cart-product";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShoppingBagIcon, XCircleIcon } from "lucide-react";

import { createOrder } from "@/data/order/action";
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
  const router = useRouter();

  return (
    <div className="flex flex-col gap-y-8 gap-x-20 lg:flex-row">
      <div className="flex flex-col gap-3">
        {cartProducts.map((product) => (
          <SingleCartProduct key={product.id} product={product} />
        ))}
      </div>
      <div>
        <form
          className="flex items-center justify-center gap-4 lg:flex-col lg:items-start lg:justify-start"
          onSubmit={async (e) => {
            e.preventDefault();
            const order = await createOrder();
            if (!order) {
              toast.error("Failed to create order.");
              return;
            }
            if (typeof order === "object" && order.error) {
              toast.success(order.error);
              return;
            }
            toast.success("Order created.");
            setTimeout(
              () => router.push("/account/orders/" + order + "?success=true"),
              400
            );
          }}
        >
          <input type="hidden" name="shoppingCartId" value={shoppingCartId} readOnly />

          <Button type="submit" variant="default" size="lg">
            <ShoppingBagIcon />
            Order Now!
          </Button>

          <Button
            onClick={async () => {
              const cart = await clearCart(shoppingCartId);
              if (!cart) {
                toast.error("Failed to clear cart.");
              }
              toast.success("Cart cleared.");
            }}
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
