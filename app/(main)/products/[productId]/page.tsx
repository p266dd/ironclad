import { getProduct } from "@/data/product/action";
import { getUserPreferences } from "@/data/user/actions";
import { getProductFromCart } from "@/data/cart/actions";

import PageTitle from "@/components/page-title";
import ProductCarousel from "@/components/product-carousel";
import ProductPageForm from "@/components/product-page-form";
import FavoriteButton from "@/components/favorite-button";

// Types
import { TEngravingPreference } from "@/lib/types";

export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const getParams = await params;
  const product = await getProduct(getParams.productId);

  const getUser = (await getUserPreferences()).data;
  const getPreferences = getUser?.engraving as TEngravingPreference[] | null | undefined;

  const getCurrentProductFromcart = product && (await getProductFromCart(product.id));

  const media = product ? [...product.media] : null;

  return (
    <div className="lg:h-full pt-16 pb-48 px-3 sm:pt-4 md:pb-12 lg:px-12">
      <PageTitle
        title={product?.name || "Missing Name"}
        subtitle={`Brand: ${product?.brand}`}
        className="lg:hidden"
      />

      <div className="h-full flex flex-col items-center gap-4 lg:justify-center lg:flex-row">
        <div className="relative flex-1 mx-3 max-w-[400px] lg:w-1/2">
          <FavoriteButton productId={product?.id} />
          <ProductCarousel media={media} />
          {product?.description && (
            <div className="mt-6 px-6">
              <p className="text-slate-600 whitespace-pre-line">{product?.description}</p>
            </div>
          )}
        </div>

        <div className="w-full px-6 lg:w-1/2">
          <PageTitle
            title={product?.name || "Missing Name"}
            subtitle={`Brand: ${product?.brand}`}
            className="hidden lg:block"
          />
          <ProductPageForm
            product={product}
            preferences={getPreferences}
            cart={getCurrentProductFromcart}
          />
        </div>
      </div>
    </div>
  );
}
