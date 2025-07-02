"use client";

import useSWR, { mutate } from "swr";
import { useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOwnOrders } from "@/data/order/action";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, LoaderCircleIcon, SearchIcon, XCircleIcon } from "lucide-react";

export default function OrdersTable() {
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState("");

  const [open, setOpen] = useState(false);
  const [inputDate, setInputDate] = useState<Date | undefined>(undefined);

  const getSearchParams = useSearchParams();
  const page = getSearchParams.get("page");
  const currentPage = page ? Number(page) : 1;
  const perPage = 15;

  const dateRef = useRef<HTMLInputElement>(null);
  const getDate = getSearchParams.get("date");
  const inputRef = useRef<HTMLInputElement>(null);
  const getSearchTerm = getSearchParams.get("searchTerm");

  const router = useRouter();

  const {
    data: orders,
    error,
    isLoading,
  } = useSWR(
    ["getOwnOrders", getSearchTerm, getDate, currentPage],
    () =>
      getOwnOrders({
        searchQuery: {
          searchTerm: getSearchTerm || undefined,
          date: getDate ? new Date(getDate) : undefined,
        },
        page: page ? Number(page) : 1,
        perPage,
      }),
    { keepPreviousData: true }
  );

  // * Set the searchQuery.
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const searchTerm = data.get("searchTerm") as string;
    const date = data.get("date") as string;

    setLoadingSearch(true);
    router.replace("/account/orders?page=1&searchTerm=" + searchTerm + "&date=" + date);
    setLoadingSearch(false);
  };

  const handleClearSearch = async () => {
    setInputDate(undefined);
    if (inputRef.current !== null) inputRef.current.value = "";
    router.replace("/account/orders?page=1");
  };

  // * Set the new page number.
  const handlePageChange = async (page: number) => {
    if (page >= 1 && page <= (orders?.totalPages || 1)) {
      router.replace(
        `/account/orders?page=${page}&searchTerm=${getSearchTerm || ""}&date=${
          getDate || ""
        }`
      );
    }
  };

  const renderPaginationLinks = () => {
    const links = [];
    const maxPageLinks = 6;

    if ((orders?.totalPages || 1) <= maxPageLinks) {
      for (let i = 1; i <= (orders?.totalPages || 1); i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={`/account/orders?page=${i}&searchTerm=${getSearchTerm || ""}&date=${
                getDate || ""
              }`}
              isActive={i === orders?.currentPage}
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
            href={`/account/orders?page=${1}&searchTerm=${getSearchTerm || ""}&date=${
              getDate || ""
            }`}
            isActive={1 === orders?.currentPage}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from the beginning.
      if ((orders?.currentPage || 1) > 2) {
        links.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around the current page.
      let start = Math.max(2, (orders?.currentPage || 1) - 1);
      let end = Math.min((orders?.totalPages || 1) - 1, (orders?.currentPage || 1) + 1);

      if ((orders?.currentPage || 1) === 1) {
        // Adjust range if current page is 1.
        start = 2;
        end = Math.min((orders?.totalPages || 1) - 1, 3);
      } else if ((orders?.currentPage || 1) === (orders?.totalPages || 1)) {
        // Adjust range if current page is last.
        start = Math.max(2, (orders?.totalPages || 1) - 2);
        end = (orders?.totalPages || 1) - 1;
      }

      for (let i = start; i <= end; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={`/account/orders?page=${i}&searchTerm=${getSearchTerm || ""}&date=${
                getDate || ""
              }`}
              isActive={i === (orders?.currentPage || 1)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from the end.
      if ((orders?.currentPage || 1) < (orders?.totalPages || 1) - 1) {
        links.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page.
      if ((orders?.totalPages || 1) > 1) {
        // Only show last page if there's more than one page.
        links.push(
          <PaginationItem key={orders?.totalPages || 1}>
            <PaginationLink
              href={`/account/orders?page=${orders?.totalPages || 1}&searchTerm=${
                getSearchTerm || ""
              }&date=${getDate || ""}`}
              isActive={(orders?.totalPages || 1) === (orders?.currentPage || 1)}
            >
              {orders?.totalPages || 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    return links;
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSearch}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                ref={inputRef}
                type="text"
                name="searchTerm"
                placeholder="Order Number"
                autoComplete="off"
              />
              <Input ref={dateRef} type="hidden" name="date" value={undefined} />
            </div>
            <div className="flex-1">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full pl-3 text-left font-normal"
                  >
                    <span>
                      {inputDate
                        ? format(inputDate, "PPP")
                        : getDate
                        ? format(new Date(getDate), "PPP")
                        : "Select date"}
                    </span>
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      inputDate ? inputDate : getDate ? new Date(getDate) : undefined
                    }
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (dateRef.current !== null) {
                        dateRef.current.value = date
                          ? new Date(date).toLocaleString()
                          : "";
                      }
                      setInputDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="default" className="flex-2/3">
              <SearchIcon />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1/3"
              onClick={handleClearSearch}
            >
              <XCircleIcon />
              Clear
            </Button>
          </div>
        </div>
      </form>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]"># Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.data && orders.data.length > 0 ? (
              orders.data.map((order) => {
                const totalItems = order.orderProduct.reduce((sum, product) => {
                  // Ensure product.details is treated as an array of objects with quantity
                  const productDetails = product.details as {
                    id: number;
                    quantity: number;
                  }[];
                  const totalQuantity = productDetails.reduce((total, detail) => {
                    return total + detail.quantity;
                  }, 0);
                  return sum + totalQuantity;
                }, 0);

                return (
                  <TableRow
                    key={order.id}
                    onClick={() => {
                      setLoadingNavigation(order.id);
                      router.push("/account/orders/" + order.id);
                    }}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {order.code.split("-")[1]}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {loadingNavigation === order.id ? (
                        <LoaderCircleIcon className="animate-spin" />
                      ) : null}{" "}
                      {format(new Date(order.createdAt), "d/M/y")}
                    </TableCell>
                    <TableCell className="md:hidden">
                      {format(new Date(order.createdAt), "d/M/yy")}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.client.name}
                    </TableCell>
                    <TableCell className="md:hidden">
                      {order.client.name.split(" ")[0]}
                    </TableCell>
                    <TableCell className="text-right">{totalItems}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500">
                  {isLoading || loadingSearch ? (
                    <span className="flex items-center gap-4">
                      <LoaderCircleIcon /> Loading...
                    </span>
                  ) : error ? (
                    error
                  ) : (
                    "No orders found."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div>
        {orders && orders?.totalPages && orders?.totalPages > 0 ? (
          <Pagination className="justify-start">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`/account/orders?page=${
                    orders?.currentPage ? orders?.currentPage - 1 : 1
                  }&searchTerm=${getSearchTerm || ""}&date=${getDate || ""}`}
                  onClick={() => handlePageChange((orders?.currentPage || 1) - 1)}
                  aria-disabled={orders?.currentPage === 1}
                  tabIndex={orders?.currentPage === 1 ? -1 : undefined}
                  className={
                    orders?.currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
              {renderPaginationLinks()}
              <PaginationItem>
                <PaginationNext
                  href={`/account/orders?page=${
                    orders?.currentPage ? orders?.currentPage + 1 : 2
                  }&searchTerm=${getSearchTerm || ""}&date=${getDate || ""}`}
                  aria-disabled={orders?.currentPage === orders?.totalPages}
                  tabIndex={orders?.currentPage === orders?.totalPages ? -1 : undefined}
                  className={
                    orders?.currentPage === orders?.totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>
    </div>
  );
}
