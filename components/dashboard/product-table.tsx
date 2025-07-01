"use client";

import Image from "next/image";
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
  const [searchQuery, setSearchQuery] = useState<
    | {
        input: string | undefined;
        filter: string | undefined;
      }
    | undefined
  >(undefined);

  const getSearchParams = useSearchParams();
  const page = getSearchParams.get("page");

  // Fetch data
  const { data: filtersData } = useSWR("fetchFilters", getFilters);

  // * Pagination settings.
  const [perPage, setPerPage] = useState<number>(10);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, error, isLoading } = useSWR("getProducts", () =>
    fetchProducts({
      searchQuery,
      page: page ? Number(page) : 1,
      perPage,
    })
  );

  // * Set the searchQuery.
  const handleSearch = async (searchTerm: string | undefined) => {
    setLoadingSearch(true);
    setSearchQuery((prev) => ({
      input: searchTerm !== "" ? searchTerm : undefined,
      filter: prev?.filter,
    }));
    await mutate("getProducts");
    await mutate("getProducts");
    setLoadingSearch(false);
    router.replace("/dashboard/products?page=1");
  };

  // * Set the new filter.
  const handleFilterChange = async (filter?: string) => {
    setLoadingFilter(true);
    setSearchQuery((prev) => ({
      input: prev?.input,
      filter: filter ? filter : undefined,
    }));
    await mutate("getProducts");
    await mutate("getProducts");
    router.replace("/dashboard/products?page=1");
    setLoadingFilter(false);
  };

  // * Set the number of items per page.
  const handlePerPageChange = async (perPage: number) => {
    setPerPage(perPage);
    await mutate("getProducts");
    await mutate("getProducts");
    router.replace("/dashboard/products?page=1");
  };

  const handleClearSearch = async () => {
    setSearchQuery(undefined);
    if (inputRef.current !== null) inputRef.current.value = "";
    await mutate("getProducts");
    await mutate("getProducts");
  };

  // * Set the new page number.
  const handlePageChange = async (page: number) => {
    if (page >= 1 && page <= (data?.totalPages || 1)) {
      router.replace(`/dashboard/products?page=${page}`);
      await mutate("getProducts");
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
              href={`/dashboard/products?page=${i}`}
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
            href={`/dashboard/products?page=${1}`}
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
              href={`/dashboard/products?page=${i}`}
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
              href={`/dashboard/products?page=${data?.totalPages || 1}`}
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
              <DropdownMenuLabel>Display</DropdownMenuLabel>
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
              <Button
                asChild
                type="button"
                variant={searchQuery?.filter ? "default" : "outline"}
              >
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
              <DropdownMenuLabel>Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {searchQuery?.filter ? (
                <DropdownMenuItem onClick={() => handleFilterChange()}>
                  <span className="flex items-center gap-2 bg-gray-50 rounded-md">
                    Clear <XCircleIcon />
                  </span>
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuItem onClick={() => handleFilterChange("knife")}>
                Knife
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("other")}>
                Other
              </DropdownMenuItem>

              {filtersData?.data &&
                filtersData?.data?.length > 0 &&
                filtersData.data.map((filter) => (
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
              placeholder="Search"
            />
            <Button
              variant={searchQuery?.input ? "default" : "outline"}
              type="button"
              onClick={() => handleSearch(inputRef.current?.value)}
            >
              {loadingSearch ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : searchQuery?.input ? (
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
                    <div className="flex items-center gap-3">Error loading data.</div>
                  </TableCell>
                </TableRow>
              ))}

            {data &&
              data?.data !== null &&
              data.data.length > 0 &&
              data.data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell
                    className="cursor-pointer w-[100px]"
                    onClick={() => {
                      setLoadingNavigation(product.id);
                      router.push("/dashboard/products/" + product.id);
                    }}
                  >
                    <div className="relative h-[120px] rounded-lg overflow-hidden">
                      <Image
                        src={product?.thumbnail?.url || "/product-fallback.webp"}
                        alt={product?.thumbnail?.name || "Product Image"}
                        fill
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
                href={`/dashboard/products?page=${
                  data?.currentPage ? data?.currentPage - 1 : 1
                }`}
                onClick={() => handlePageChange((data?.currentPage || 1) - 1)}
                aria-disabled={data?.currentPage === 1}
                tabIndex={data?.currentPage === 1 ? -1 : undefined}
                className={
                  data?.currentPage === 1 ? "pointer-events-none opacity-50" : undefined
                }
              />
            </PaginationItem>
            {renderPaginationLinks()}
            <PaginationItem>
              <PaginationNext
                href={`/dashboard/products?page=${
                  data?.currentPage ? data?.currentPage + 1 : 2
                }`}
                aria-disabled={data?.currentPage === data?.totalPages}
                tabIndex={data?.currentPage === data?.totalPages ? -1 : undefined}
                className={
                  data?.currentPage === data?.totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
