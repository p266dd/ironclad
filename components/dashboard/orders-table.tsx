"use client";

import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { fetchOrders, deleteOrder } from "@/data/order/action";

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
import DateRangePicker from "./range-date";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SearchIcon,
  EllipsisIcon,
  PrinterIcon,
  Trash2Icon,
  LoaderCircleIcon,
} from "lucide-react";

type SearchDate =
  | {
      startDate: Date | undefined;
      endDate: Date | undefined;
    }
  | undefined;

type SearchReference = {
  searchTerm: string | undefined;
  range: SearchDate | undefined;
} | null;

export default function AdminOrdersTable() {
  const [loadingAction, setLoadingAction] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState("");

  // * User's search input content.
  const [searchQuery, setSearchQuery] = useState<SearchReference>(null);
  // * Pagination settings.
  const [page, setPage] = useState<number>(1);
  const itemsPerPage: number = 20;
  // * Search references.
  const [searchReference, setSearchReference] = useState<SearchReference>(null);

  const router = useRouter();

  const { data, error, isLoading } = useSWR("getOrders", () =>
    fetchOrders({
      searchQuery,
      page,
      itemsPerPage,
      newOnly: false,
    })
  );

  // * Set the searchQuery state and set page to 1.
  const handleSearch = async () => {
    setLoadingSearch(true);
    setSearchQuery(searchReference);
    await mutate("getOrders");
    await mutate("getOrders");
    setPage(1);
    setLoadingSearch(false);
  };

  const handleClearSearch = async () => {
    setSearchQuery(null);
    setSearchReference({
      searchTerm: undefined,
      range: undefined,
    });
    await mutate("getOrders");
    await mutate("getOrders");
  };

  const handlePageChange = async (page: number) => {
    if (page >= 1 && page <= (data?.totalPages || 1)) {
      setPage(page);
      await mutate("getOrders");
      await mutate("getOrders");
    }
  };

  const handleDelete = async (orderId: string) => {
    setLoadingAction(orderId);
    const response = await deleteOrder({
      orderId,
    });
    if (response.error !== null) {
      toast.success(response.error);
      setLoadingAction("");
      return;
    }
    toast.success("注文が削除されました");
    mutate("getOrders");
    mutate("getNewOrders");
    setLoadingAction("");
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
              href="#"
              isActive={i === data?.currentPage}
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
            isActive={1 === data?.currentPage}
            onClick={() => handlePageChange(1)}
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
              href="#"
              isActive={i === (data?.currentPage || 1)}
              onClick={() => handlePageChange(i)}
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
              href="#"
              isActive={(data?.totalPages || 1) === (data?.currentPage || 1)}
              onClick={() => handlePageChange(data?.totalPages || 1)}
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
    <div className="flex flex-col gap-4 w-full max-w-3xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex-2/3">
            <Input
              name="searchTerm"
              placeholder="検索"
              autoComplete="off"
              value={searchReference?.searchTerm || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchReference((prev) => ({
                  searchTerm: e.target.value,
                  range: prev?.range,
                }))
              }
            />
          </div>
          <div className="flex-1/3">
            <DateRangePicker
              range={searchReference?.range || undefined}
              setRange={(range: SearchDate) =>
                setSearchReference((prev) => ({
                  searchTerm: prev?.searchTerm,
                  range: {
                    startDate: range?.startDate,
                    endDate: range?.endDate,
                  },
                }))
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="default"
            type="button"
            className="flex-grow md:flex-3/4 cursor-pointer"
            onClick={handleSearch}
          >
            {loadingSearch ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <SearchIcon />
            )}
            検索
          </Button>

          <Button
            variant="outline"
            type="button"
            className="bg-gray-100 shrink md:shrink-0 md:flex-1/4 cursor-pointer"
            onClick={handleClearSearch}
          >
            解除
          </Button>
        </div>
      </div>

      <div>
        <Table className="w-full max-w-3xl">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">日付</TableHead>
              <TableHead className="w-[110px]">注文番号</TableHead>
              <TableHead>顧客</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
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
              data.data.length > 0 &&
              data.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => {
                      setLoadingNavigation(order.id);
                      router.push("/dashboard/orders/" + order.id);
                    }}
                  >
                    {loadingNavigation === order.id || loadingAction === order.id ? (
                      <LoaderCircleIcon className="animate-spin" />
                    ) : null}{" "}
                    {format(order.createdAt, "MM/dd")}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => {
                      setLoadingNavigation(order.id);
                      router.push("/dashboard/orders/" + order.id);
                    }}
                  >
                    {order.code.split("-")[1]}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer overflow-hidden overflow-ellipsis w-[50px]"
                    onClick={() => {
                      setLoadingNavigation(order.id);
                      router.push("/dashboard/orders/" + order.id);
                    }}
                  >
                    {order.client.businessName}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        {loadingAction === order.id ? (
                          <LoaderCircleIcon className="animate-spin" />
                        ) : (
                          <EllipsisIcon />
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            setLoadingNavigation(order.id);
                            router.push("/dashboard/orders/" + order.id + "/print");
                          }}
                          className="text-right cursor-pointer"
                        >
                          <PrinterIcon /> 注文を印刷
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setLoadingAction(order.id);
                            handleDelete(order.id);
                          }}
                        >
                          {loadingAction === order.id ? (
                            <LoaderCircleIcon className="animate-spin" />
                          ) : (
                            <Trash2Icon />
                          )}
                          注文を削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div>
        {data && data.totalPages > 1 ? (
          <Pagination className="justify-start">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
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
                  href="#"
                  onClick={() => handlePageChange((data?.currentPage || 1) + 1)}
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
        ) : null}
      </div>
    </div>
  );
}
