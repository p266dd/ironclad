"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";
import { getProductsInfineScroll } from "@/data/product/action";
import ProductModal from "@/components/product-grid/product-modal";
import ProductGridError from "@/components/product-grid/product-grid-error";
import { LoaderIcon } from "lucide-react";

// Types
import { ProductItemResult } from "@/data/product/action";

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
  const { data, error, setSize, isLoading, isValidating } = useSWRInfinite<
    ProductItemResult[]
  >(getKey, getProductsInfineScroll);

  // Is there more data?
  const hasMoreData = data && data[data.length - 1]?.length > 0;

  // Concatenate data from all database fetches.
  const allProductsResponse: ProductItemResult[] = data ? data.flat() : [];

  const allProducts = useMemo(() => {
    if (!allProductsResponse.length) {
      return [];
    }
    const uniqueProductsMap = new Map<string | number, ProductItemResult>();
    allProductsResponse.forEach((product) => {
      if (product && typeof product.id !== "undefined") {
        // Ensure product and id exist
        uniqueProductsMap.set(product.id, product);
      }
    });
    return Array.from(uniqueProductsMap.values());
  }, [allProductsResponse]);

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

  if (error) return <ProductGridError />;

  return (
    <>
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-1 mx-1 md:gap-2 md:mx-2 xl:gap-3 xl:mx-3">
        {allProducts.map((product) => (
          <ProductModal key={product.id} product={product} />
        ))}
      </div>

      {isValidating ||
        (isLoading ? (
          <div key="loadingMoreProducts" className="mt-6">
            <div className="flex items-center gap-4 text-gray-500">
              Loading <LoaderIcon className="animate-spin" />
            </div>
          </div>
        ) : null)}

      {hasMoreData && !isLoading && (
        <div key="observer" ref={observerRef} style={{ height: "1px" }} />
      )}
    </>
  );
}
