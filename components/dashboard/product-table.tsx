"use client";

import useSWR, { mutate } from "swr";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchProducts } from "@/data/product/action";
import { getFilters } from "@/data/filter/action";

// Shadcn
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  FilterIcon,
  HashIcon,
  LoaderCircleIcon,
  SearchIcon,
  SearchX,
  XCircle,
  XCircleIcon,
} from "lucide-react";

export default function AdminProductTable() {
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState("");

  // * Search input content.
  // const [searchQuery, setSearchQuery] = useState<
  //   | {
  //       input: string | undefined;
  //       filter: string | undefined;
  //     }
  //   | undefined
  // >(undefined);

  const getSearchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  const { data: filtersData } = useSWR("fetchFilters", getFilters);

  // * Pagination settings.
  const perPage = 10;
  // Extract params from URL
  const page = Number(getSearchParams.get("page") || "1");
  const search = getSearchParams.get("search") || undefined;
  const filter = getSearchParams.get("filter") || undefined;

  // Fetch products — SWR key changes when search/filter/page/perPage changes
  const { data, error, isLoading } = useSWR(
    ["getProducts", search, filter, page, perPage],
    () =>
      fetchProducts({
        searchQuery: { input: search, filter },
        page,
        perPage,
      })
  );

  // // * Set the searchQuery.
  // const handleSearch = async (searchTerm: string | undefined) => {
  //   setLoadingSearch(true);
  //   setSearchQuery((prev) => ({
  //     input: searchTerm !== "" ? searchTerm : undefined,
  //     filter: prev?.filter,
  //   }));
  //   await mutate("getProducts");
  //   await mutate("getProducts");
  //   setLoadingSearch(false);
  //   router.replace("/dashboard/products?page=1");
  // };

  // Update search params helper
  const updateParams = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(getSearchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        sp.delete(key);
      } else {
        sp.set(key, value);
      }
    });
    router.replace(`/dashboard/products?${sp.toString()}`);
  };

  // Change search params
  const handleSearch = async (searchTerm?: string) => {
    setLoadingSearch(true);
    updateParams({ search: searchTerm || undefined, page: "1" });
    await mutate("getProducts");
    setLoadingSearch(false);
  };

  // Change filter.
  const handleFilterChange = async (newFilter?: string) => {
    setLoadingFilter(true);
    updateParams({ filter: newFilter || undefined, page: "1" });
    await mutate("getProducts");
    setLoadingFilter(false);
  };

  // Change # of items per page.
  const handlePerPageChange = async (newPerPage: number) => {
    updateParams({ perPage: String(newPerPage), page: "1" });
    await mutate("getProducts");
  };

  // Clear search params
  const handleClearSearch = async () => {
    updateParams({ search: undefined, page: "1" });
    if (inputRef.current) inputRef.current.value = "";
    await mutate("getProducts");
  };

  // * Change page number.
  const handlePageChange = async (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      updateParams({
        page: String(newPage),
        search,
        filter,
        perPage: perPage.toString(),
      });
      await mutate("getProducts");
    }
  };

  // Function to render pagination links.
  const renderPaginationLinks = () => {
    const links = [];
    const maxPageLinks = 6;

    if ((data?.totalPages || 1) <= maxPageLinks) {
      for (let i = 1; i <= (data?.totalPages || 1); i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={`/dashboard/products?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(filter ? { filter } : {}),
                page: i.toString(),
              })}`}
              isActive={i === data?.currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page.
      links.push(
        <PaginationItem key={1}>
          <PaginationLink
            href={`/dashboard/products?${new URLSearchParams({
              ...(search ? { search } : {}),
              ...(filter ? { filter } : {}),
              page: "1",
            })}`}
            isActive={1 === data?.currentPage}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from the beginning.
      if ((data?.currentPage || 1) > 2) {
        links.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around the current page.
      let start = Math.max(2, (data?.currentPage || 1) - 1);
      let end = Math.min((data?.totalPages || 1) - 1, (data?.currentPage || 1) + 1);

      if ((data?.currentPage || 1) === 1) {
        // Adjust range if current page is 1.
        start = 2;
        end = Math.min((data?.totalPages || 1) - 1, 3);
      } else if ((data?.currentPage || 1) === (data?.totalPages || 1)) {
        // Adjust range if current page is last.
        start = Math.max(2, (data?.totalPages || 1) - 2);
        end = (data?.totalPages || 1) - 1;
      }

      for (let i = start; i <= end; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={`/dashboard/products?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(filter ? { filter } : {}),
                page: i.toString(),
              })}`}
              isActive={i === (data?.currentPage || 1)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from the end.
      if ((data?.currentPage || 1) < (data?.totalPages || 1) - 1) {
        links.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page.
      if ((data?.totalPages || 1) > 1) {
        // Only show last page if there's more than one page.
        links.push(
          <PaginationItem key={data?.totalPages || 1}>
            <PaginationLink
              href={`/dashboard/products?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(filter ? { filter } : {}),
                page: (data?.totalPages || 1).toString(),
              })}`}
              isActive={(data?.totalPages || 1) === (data?.currentPage || 1)}
            >
              {data?.totalPages || 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    return links;
  };

  return (
    <div className="py-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 focus-visible:outline-0">
              <Button asChild type="button" variant="outline">
                <span>
                  {perPage} <ChevronDownIcon />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-0">
              <DropdownMenuLabel>表示</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlePerPageChange(10)}>
                <HashIcon /> 10
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePerPageChange(15)}>
                <HashIcon /> 15
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePerPageChange(20)}>
                <HashIcon /> 20
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="focus-visible:outline-0">
              <Button asChild type="button" variant={filter ? "default" : "outline"}>
                <span>
                  {loadingFilter ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <FilterIcon />
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>フィルター</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {filter ? (
                <DropdownMenuItem onClick={() => handleFilterChange()}>
                  <span className="flex items-center gap-2 bg-gray-50 rounded-md">
                    Clear <XCircleIcon />
                  </span>
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuItem onClick={() => handleFilterChange("knife")}>
                包丁
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("other")}>
                その他
              </DropdownMenuItem>

              {filtersData &&
                filtersData?.length > 0 &&
                filtersData.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => handleFilterChange(`${filter.name}`)}
                  >
                    {filter.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleSearch(inputRef.current?.value);
          }}
        >
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              name="searchTerm"
              autoComplete="off"
              placeholder="検索"
            />
            <Button
              variant={search ? "default" : "outline"}
              type="button"
              onClick={() => handleSearch(inputRef.current?.value)}
            >
              {loadingSearch ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : search ? (
                <SearchX />
              ) : (
                <SearchIcon />
              )}
            </Button>

            <Button variant="outline" type="button" onClick={handleClearSearch}>
              <XCircle />
            </Button>
          </div>
        </form>
      </div>

      <div className="mb-6">
        <Table className="w-full max-w-3xl mb-3">
          <TableBody>
            {isLoading === true && (
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <LoaderCircleIcon className="animate-spin" /> Loading ...
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.error ||
              (error && (
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-3">読み込みに失敗しました</div>
                  </TableCell>
                </TableRow>
              ))}

            {data &&
              data?.data !== null &&
              data?.data?.length > 0 &&
              data?.data.map((product) => (
                <TableRow
                  key={product.id}
                  className={`${product.active ? "" : "bg-gray-50 border"}`}
                >
                  <TableCell
                    className="cursor-pointer w-[100px]"
                    onClick={() => {
                      setLoadingNavigation(product.id);
                      router.push("/dashboard/products/" + product.id);
                    }}
                  >
                    <div className="relative h-[120px] rounded-lg overflow-hidden">
                      <img
                        src={product?.thumbnail?.url || "/product-fallback.webp"}
                        alt={product?.thumbnail?.name || "Product Image"}
                        // fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => {
                      setLoadingNavigation(product.id);
                      router.push("/dashboard/products/" + product.id);
                    }}
                  >
                    <div>
                      <h5 className="font-medium text-lg text-wrap line-clamp-2 capitalize">
                        {loadingNavigation === product.id ? (
                          <LoaderCircleIcon className="inline animate-spin mr-2 size-4" />
                        ) : null}
                        {product?.name}
                      </h5>
                      <p className="text-sm">
                        <span className="text-slate-500 capitalize">Brand:</span>{" "}
                        {product?.brand}
                      </p>
                      <p className="text-sm">
                        <span className="text-slate-500 capitalize">handle:</span>{" "}
                        {product?.handle}
                      </p>
                      <p className="text-sm">
                        <span className="text-slate-500 capitalize">Material:</span>{" "}
                        {product?.material}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <Pagination className="justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/dashboard/products?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(filter ? { filter } : {}),
                  page: String(page - 1),
                })}`}
                onClick={() => handlePageChange(page - 1)}
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : undefined}
                className={page === 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
            {renderPaginationLinks()}
            <PaginationItem>
              <PaginationNext
                href={`/dashboard/products?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(filter ? { filter } : {}),
                  page: String(page + 1),
                })}`}
                onClick={() => handlePageChange(page + 1)}
                aria-disabled={page === data?.totalPages}
                tabIndex={page === data?.totalPages ? -1 : undefined}
                className={
                  page === data?.totalPages ? "pointer-events-none opacity-50" : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
