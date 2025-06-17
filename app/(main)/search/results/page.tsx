import PageTitle from "@/components/page-title";
import SearchDialog from "@/components/search/search-dialog";
import ResultsGrid from "@/components/search/results-grid";
import EmptyResults from "@/components/empty-results";

import { getBrands } from "@/data/brand/action";
import { getMaterials } from "@/data/material/action";

export default async function ResultsPage() {
  const availableBrands = await getBrands();
  const availableMaterials = await getMaterials();

  const results: string[] = [];
  const numberOfResults: number = results && results?.length;

  return (
    <div className="h-full pt-16 pb-40 px-6 sm:pt-4 lg:px-12">
      <div className="h-full flex items-start justify-start">
        <div className="w-full max-w-[800px] flex flex-col justify-center gap-4">
          <PageTitle
            title="Search Results"
            showCount={true}
            count={numberOfResults}
            countFor="results"
          />

          {numberOfResults === 0 && <EmptyResults />}

          <div className="mb-8">
            <SearchDialog
              availableBrands={availableBrands.data}
              availableMaterials={availableMaterials.data}
            />
          </div>

          {numberOfResults > 0 && (
            <div>
              <ResultsGrid />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
