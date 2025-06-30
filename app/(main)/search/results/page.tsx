import PageTitle from "@/components/page-title";
import SearchDialog from "@/components/search/search-dialog";
import ProductGrid from "@/components/product-grid/product-grid";

import { getBrands } from "@/data/brand/action";
import { getMaterials } from "@/data/material/action";

// Types
import { SearchParams } from "next/dist/server/request/search-params";
import { TSearchFields } from "@/lib/types";

export default async function ResultsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const availableBrands = await getBrands();
  const availableMaterials = await getMaterials();

  // Create the object with type TSearchFields
  const params: Partial<TSearchFields> = await props.searchParams;
  const searchFilters: TSearchFields = {
    searchTerm: params.searchTerm ?? "",
    style: params.style ?? "",
    type: params.type ?? "",
    stock: params.stock ?? "",
    price: params.price ?? { min: 0, max: 99999 },
    size: params.size ?? { min: 0, max: 300 },
    brand: params.brand ?? "",
    material: params.material ?? "",
  };

  return (
    <div className="h-full pt-16 pb-48 px-6 sm:pt-4 md:pb-12 lg:px-12">
      <div className="h-full">
        <div className="w-full max-w-[800px] flex flex-col justify-center gap-4 mb-4">
          <PageTitle
            title="Search Results"
            subtitle="You can narrow your search by modifying the search filters below."
          />

          <div className="mb-2">
            <SearchDialog
              availableBrands={availableBrands.data}
              availableMaterials={availableMaterials.data}
            />
          </div>
        </div>

        <div>
          <ProductGrid activeFilters={{ tag: null, search: searchFilters }} />
        </div>
      </div>
    </div>
  );
}
