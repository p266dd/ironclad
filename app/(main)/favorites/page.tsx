import PageTitle from "@/components/page-title";
import ProductModal from "@/components/product-grid/product-modal";
import EmptyFavorites from "@/components/empty-favorites";

import { getFavorites } from "@/data/favorite/action";

export default async function FavoritesPage() {
  // fetch and cache favorites.
  const favorite = await getFavorites();
  const products = favorite?.products;

  return (
    <div className="pt-16 pb-44 px-6 sm:pt-4 md:pb-12 lg:px-12">
      <PageTitle
        title="Favorites"
        showCount={true}
        count={products && products?.length}
        countFor="favorites"
      />
      {products && products.length > 0 ? (
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-1 mx-1 md:gap-2 md:mx-2 xl:gap-3 xl:mx-3">
          {products.map((product) =>
            product.product.active ? (
              <ProductModal key={product.productId} product={product.product} />
            ) : null
          )}
        </div>
      ) : (
        <EmptyFavorites />
      )}
    </div>
  );
}
