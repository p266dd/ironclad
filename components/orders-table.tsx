"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// Types
import { TOrderWithConnection } from "@/lib/types";

export default function OrdersTable() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [searchData, setSearchData] = useState<{
    searchTerm?: string;
    date?: Date;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<TOrderWithConnection[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOwnOrders(currentPage, 2);
        if (response.error) {
          setError(response.error);
          setLoading(false);
          return;
        }
        setOrders(response.data && response.data?.length > 0 ? response.data : []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch orders.");
      }
    };
    fetchData();
  }, [currentPage, searchData]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      const searchTermMatch =
        !searchTerm || order.code.toLowerCase().includes(searchTerm.toLowerCase());

      const dateMatch =
        !date ||
        (orderDate.getFullYear() === date.getFullYear() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getDate() === date.getDate());

      return searchTermMatch && dateMatch;
    });
  }, [orders, searchData]);

  // Calculate pagination derived state.
  const ITEMS_PER_PAGE = 10;
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchData]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Function to render pagination links.
  const renderPaginationLinks = () => {
    const links = [];
    const maxPageLinks = 6;

    if (totalPages <= maxPageLinks) {
      for (let i = 1; i <= totalPages; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={i === currentPage}
              onClick={() => handlePageChange(i)}
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
            href="#"
            isActive={1 === currentPage}
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from the beginning.
      if (currentPage > 2) {
        links.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around the current page.
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage === 1) {
        // Adjust range if current page is 1.
        start = 2;
        end = Math.min(totalPages - 1, 3);
      } else if (currentPage === totalPages) {
        // Adjust range if current page is last.
        start = Math.max(2, totalPages - 2);
        end = totalPages - 1;
      }

      for (let i = start; i <= end; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={i === currentPage}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from the end.
      if (currentPage < totalPages - 1) {
        links.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page.
      if (totalPages > 1) {
        // Only show last page if there's more than one page.
        links.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              href="#"
              isActive={totalPages === currentPage}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    return links;
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="text"
                name="searchTerm"
                placeholder="Order Number"
                autoComplete="off"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
            <div className="flex-1">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full pl-3 text-left font-normal"
                  >
                    <span>{date ? format(date, "PPP") : "Select date"}</span>
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              className="flex-2/3"
              onClick={() =>
                setSearchData({
                  searchTerm: searchTerm,
                  date: date,
                })
              }
            >
              <SearchIcon />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1/3"
              onClick={() => {
                setSearchData(null);
                setDate(undefined);
                setSearchTerm("");
                setCurrentPage(1);
              }}
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
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => {
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
                    onClick={() => router.push("/account/orders/" + order.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {order.code.split("-")[1]}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
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
                  {loading ? (
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
        <Pagination className="justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : undefined
                }
              />
            </PaginationItem>
            {renderPaginationLinks()}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
                className={
                  currentPage === totalPages
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
