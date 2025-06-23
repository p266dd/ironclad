"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrderSizeTable({
  sizes,
  productSizes,
}: {
  sizes: {
    id: number;
    quantity: number;
    priceAtOrder: number;
    nameAtOrder: string;
  }[];
  productSizes: {
    id: number;
    name: string;
    productId: string | null;
    size: string;
    price: number;
    stock: number;
  }[];
}) {
  return (
    <Table className="bg-slate-50 rounded-lg">
      <TableHeader>
        <TableRow className="bg-slate-100">
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Ordered</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sizes.map((size) => {
          const matchingProduct = productSizes.find((s) => s.id === size?.id);
          if (!matchingProduct) return null;

          return (
            <TableRow>
              <TableCell className="font-medium">{matchingProduct?.name}</TableCell>
              <TableCell>{matchingProduct?.size}</TableCell>
              <TableCell>{size?.quantity}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
