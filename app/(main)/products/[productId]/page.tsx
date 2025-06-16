import { getProduct } from "@/data/product/action";
import PageTitle from "@/components/page-title";
import ProductCarousel from "@/components/product-carousel";
import ProductPageForm from "@/components/product-page-form";

// Types

export default async function SingleProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const getParams = await params;
  const product = await getProduct(getParams.productId);

  const media = product ? [...product.media] : null;

  return (
    <div className="lg:h-full pt-16 pb-44 px-3 sm:pt-4 lg:px-12">
      <PageTitle
        title={product?.name || "Missing Name"}
        subtitle={`From ${product?.brand}`}
        className="lg:hidden"
      />

      <div className="h-full flex flex-col items-center gap-4 lg:justify-center lg:flex-row">
        <div className="relative flex-1 mx-3 max-w-[400px] lg:w-1/2">
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
            subtitle={`From ${product?.brand}`}
            className="hidden lg:block"
          />
          <ProductPageForm product={product} />
        </div>
      </div>
    </div>
  );
}
