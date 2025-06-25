"use client";

import useSWR from "swr";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { fetchOrders } from "@/data/order/action";

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

export default function AdminNewOrdersTable() {
  const router = useRouter();

  const { data, error, isLoading } = useSWR(
    {
      searchQuery: {
        searchTerm: undefined,
        range: { startDate: undefined, endDate: undefined },
      },
      page: 1,
      itemsPerPage: 30,
      newOnly: true,
    },
    (config) => fetchOrders(config)
  );

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

        {data &&
          data?.data !== null &&
          data.data.length > 0 &&
          data.data.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer"
              onClick={() => router.push("/dashboard/orders/" + order.id)}
            >
              <TableCell>{format(order.createdAt, "MM/dd")}</TableCell>
              <TableCell>{order.code.split("-")[1]}</TableCell>
              <TableCell className="overflow-hidden overflow-ellipsis w-[50px]">
                {order.client.businessName}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <EllipsisIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-right">
                      <PrinterIcon /> Print Order
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CircleCheckIcon />
                      Mark Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem>
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
