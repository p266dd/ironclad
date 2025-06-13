"use client";

import { useRef, useEffect, useCallback } from "react";
import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";
import { getProductsInfineScroll } from "@/data/product/action";
import ProductModal from "@/components/product-modal";
import { LoaderIcon } from "lucide-react";

// Types
import { ProductItem } from "@/app/(main)/fetch-products";

export default function ProductGrid({ activeFilter }: { activeFilter: string | null }) {
  const observerRef = useRef(null);

  // Get the pageIndex and filter.
  const getKey: SWRInfiniteKeyLoader = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null;
    return {
      pageIndex,
      activeFilter,
    };
  };

  // Fetch paginated products.
  const { data, error, setSize, isLoading, isValidating } = useSWRInfinite<ProductItem[]>(
    getKey,
    getProductsInfineScroll
  );

  // Is there more data?
  const hasMoreData = data && data[data.length - 1]?.length > 0;

  // Concatenate data from all database fetches.
  const allProducts: ProductItem[] = data ? data.flat() : [];

  // Callback for IntersectionObserver
  const handleObserver = useCallback(
    (entries: any[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMoreData && !isLoading) {
        setSize((prevSize) => prevSize + 1); // Load the next page of results.
      }
    },
    [setSize, hasMoreData, isLoading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    // Cleanup observer on component unmount.
    return () => observer.disconnect();
  }, [handleObserver]);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="flex flex-row flex-wrap gap-1">
        {allProducts.map((product, i) => (
          <div key={i} className="relative">
            <ProductModal product={product} />
          </div>
        ))}
      </div>

      {isValidating && (
        <div key="loadingMoreProducts" className="mt-6">
          <div className="flex items-center gap-4 text-gray-500">
            Loading <LoaderIcon className="animate-spin" />
          </div>
        </div>
      )}

      {hasMoreData && !isLoading && (
        <div key="observer" ref={observerRef} style={{ height: "1px" }} />
      )}
    </>
  );
}
