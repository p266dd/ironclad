"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SingleCartProduct from "@/components/cart/cart-product";

import { createOrder } from "@/data/order/action";
import { clearCart } from "@/data/cart/actions";

import { useTour } from "@/lib/tour/tour-context";

// Shadcn
import { Button } from "@/components/ui/button";
import { MessageCircleQuestionIcon, ShoppingBagIcon, XCircleIcon } from "lucide-react";

// Types
import { CartProductWithRelations, TEngravingPreference } from "@/lib/types";

export default function CartProduct({
  cartProducts,
  shoppingCartId,
  preferences,
}: {
  cartProducts: CartProductWithRelations[];
  shoppingCartId: string;
  preferences: TEngravingPreference[] | null | undefined;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { startTour } = useTour();
  useEffect(() => {
    if (typeof window === undefined || cartProducts.length === 0) {
      return;
    }

    if (window.localStorage.getItem("cart-tour") !== null) {
      return;
    }

    setTimeout(() => startTour("cart-tour"), 1000);

    window.localStorage.setItem("cart-tour", "true");
    // return () => clearTimeout(start);
  }, [startTour, cartProducts.length]);

  return (
    <div className="flex flex-col gap-y-8 gap-x-20 lg:flex-row">
      <div className="flex flex-col gap-3">
        {cartProducts.map((product, i) => (
          <SingleCartProduct
            id={i === 0 ? "cart-item" : "undefined"}
            key={product.id}
            product={product}
            preferences={preferences}
          />
        ))}
      </div>
      <div>
        <form
          className="flex items-center justify-center gap-4 lg:flex-col lg:items-start lg:justify-start"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const order = await createOrder();
            if (order.error !== null) {
              toast.error(order.error);
              setLoading(false);
              return;
            }

            toast.success("Order created.");
            setLoading(false);
            setTimeout(
              () => router.push("/account/orders/" + order + "?success=true"),
              400
            );
          }}
        >
          <input type="hidden" name="shoppingCartId" value={shoppingCartId} readOnly />

          <Button
            id="cart-order"
            type="submit"
            variant="default"
            disabled={loading}
            size="lg"
          >
            <ShoppingBagIcon />
            {loading ? "Sending Order" : "Order Now!"}
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

          <button type="button" onClick={() => startTour("cart-tour")}>
            <MessageCircleQuestionIcon id="cart-help" className="text-gray-400" />
          </button>
        </form>
      </div>
    </div>
  );
}
