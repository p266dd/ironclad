import PageTitle from "@/components/page-title";
import CartProductForm from "@/components/cart/cart-product-form";
import EmptyCart from "@/components/empty-cart";
import { getUserPreferences } from "@/data/user/actions";
import { getCart } from "@/data/cart/actions";

// Types
import { TEngravingPreference } from "@/lib/types";

export default async function CartPage() {
  const cart = await getCart();
  const cartProducts = cart?.products;

  const getUser = (await getUserPreferences()).data;
  const getPreferences = getUser?.engraving as TEngravingPreference[] | null | undefined;

  return (
    <div className="pt-16 pb-48 px-6 sm:pt-4 md:pb-12 lg:px-12">
      <PageTitle
        title="Shopping Cart"
        showCount={true}
        count={cartProducts?.length}
        countFor="cart"
      />
      {cartProducts && cartProducts.length > 0 ? (
        <div>
          <CartProductForm
            key={cart.id}
            shoppingCartId={cart.id}
            cartProducts={cartProducts}
            preferences={getPreferences}
          />
        </div>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}
