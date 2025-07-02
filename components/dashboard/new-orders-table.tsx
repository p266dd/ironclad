"use client";

import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CircleCheckIcon,
  EllipsisIcon,
  LoaderCircleIcon,
  PrinterIcon,
  Trash2Icon,
} from "lucide-react";

import { fetchOrders, completeOrder, deleteOrder } from "@/data/order/action";

// Types
import { Prisma } from "@/lib/generated/prisma";
import { useState } from "react";

type OrderResponse = Prisma.OrderGetPayload<{
  include: {
    client: {
      select: {
        businessName: true;
      };
    };
  };
}>;

export default function AdminNewOrdersTable() {
  const [loadingAction, setLoadingAction] = useState("");
  const [loadingNavigation, setLoadingNavigation] = useState("");

  const router = useRouter();

  const handleComplete = async (orderId: string) => {
    setLoadingAction(orderId);
    const response = await completeOrder({
      orderId,
      status: "completed",
    });
    if (response.error !== null) {
      toast.error(response.error);
      setLoadingAction("");
      return;
    }
    toast.success("Order was marked as completed.");
    mutate("getOrders");
    mutate("getNewOrders");
    setLoadingAction("");
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
    toast.success("Order was deleted.");
    mutate("getOrders");
    mutate("getNewOrders");
    setLoadingAction("");
  };

  const { data, error, isLoading } = useSWR("getNewOrders", () =>
    fetchOrders({
      searchQuery: {
        searchTerm: undefined,
        range: { startDate: undefined, endDate: undefined },
      },
      page: 1,
      itemsPerPage: 30,
      newOnly: true,
    })
  );

  const orders = data?.data as OrderResponse[];

  return (
    <Table className="w-full max-w-3xl">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[90px]">Date</TableHead>
          <TableHead className="w-[150px]">Code</TableHead>
          <TableHead>Client</TableHead>
          <TableHead className="text-right">Actions</TableHead>
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

        {error && (
          <TableRow>
            <TableCell>{error}</TableCell>
          </TableRow>
        )}

        {orders &&
          orders.length > 0 &&
          orders.map((order) => (
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
                      className="cursor-pointer"
                      onClick={() => handleComplete(order.id)}
                    >
                      <CircleCheckIcon />
                      Mark Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setLoadingNavigation(order.id);
                        router.push("/dashboard/orders/" + order.id + "/print");
                      }}
                    >
                      <PrinterIcon />
                      Print Order
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
