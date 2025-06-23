"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";
import { getProductsInfineScroll } from "@/data/product/action";
import ProductModal from "@/components/product-grid/product-modal";
import ProductGridError from "@/components/product-grid/product-grid-error";
import EmptyResults from "@/components/empty-results";
import { LoaderCircleIcon } from "lucide-react";

// Types
import { TProductItemResult } from "@/lib/types";
import { TActiveFilters } from "@/lib/types";

export default function ProductGrid(props: { activeFilters: TActiveFilters }) {
  const observerRef = useRef(null);

  // Get the pageIndex and filter.
  const getKey: SWRInfiniteKeyLoader = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null;
    const { activeFilters } = props;
    return {
      pageIndex,
      activeFilters,
    };
  };

  // Fetch paginated products.
  const { data, error, setSize, isLoading, isValidating } = useSWRInfinite<
    TProductItemResult[]
  >(getKey, getProductsInfineScroll);

  // Is there more data?
  const hasMoreData = data && data[data.length - 1]?.length > 0;

  const allProducts = useMemo(() => {
    // Concatenate data from all database fetches.
    const allProductsResponse: TProductItemResult[] = data ? data.flat() : [];

    if (!allProductsResponse.length) {
      return [];
    }
    const uniqueProductsMap = new Map<string | number, TProductItemResult>();
    allProductsResponse.forEach((product) => {
      if (product && typeof product.id !== "undefined") {
        // Ensure product and id exist
        uniqueProductsMap.set(product.id, product);
      }
    });
    return Array.from(uniqueProductsMap.values());
  }, [data]);

  // Callback for IntersectionObserver
  const handleObserver = useCallback(
    (entries: ReadonlyArray<IntersectionObserverEntry>) => {
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
  if (isLoading)
    return (
      <div className="flex items-center gap-4 px-8 text-slate-500">
        <LoaderCircleIcon className="animate-spin" /> Loading...
      </div>
    );
  if (!isLoading && allProducts.length === 0) return <EmptyResults />;

  return (
    <>
      <div className="grid grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-1 mx-1 md:gap-2 md:mx-2 xl:gap-3 xl:mx-3">
        {allProducts.map((product) => (
          <ProductModal key={product.id} product={product} />
        ))}
      </div>

      {isValidating ? (
        <div key="loadingMoreProducts" className="mt-6 px-8">
          <div className="flex items-center gap-4 text-gray-500">
            <LoaderCircleIcon className="animate-spin" />
          </div>
        </div>
      ) : null}

      {hasMoreData && !isLoading && (
        <div key="observer" ref={observerRef} style={{ height: "1px" }} />
      )}
    </>
  );
}
