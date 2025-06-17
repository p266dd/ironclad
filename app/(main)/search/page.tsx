import { getBrands } from "@/data/brand/action";
import { getMaterials } from "@/data/material/action";

import PageTitle from "@/components/page-title";
import SearchForm from "@/components/search/form";

export default async function SearchPage() {
  const availableBrands = await getBrands();
  const availableMaterials = await getMaterials();

  return (
    <div className="pt-16 pb-40 px-6 sm:pt-4 lg:px-12 h-full">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <PageTitle title="Search" subtitle="What are you looking for?" />
        <SearchForm
          availableBrands={availableBrands.data}
          availableMaterials={availableMaterials.data}
        />
      </div>
    </div>
  );
}
