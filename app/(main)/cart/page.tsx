import PageTitle from "@/components/page-title";
import CartProductForm from "@/components/cart/cart-product-form";
import EmptyCart from "@/components/empty-cart";
import { getCart } from "@/data/cart/actions";

export default async function CartPage() {
  const cart = await getCart();
  const cartProducts = cart?.products;

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
          />
        </div>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}
