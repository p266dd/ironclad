"use client";

import { useState } from "react";
import { Prisma } from "@/lib/generated/prisma";

import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCheckIcon, PencilIcon, Trash2Icon } from "lucide-react";

export default function CartProductDetailRow({
  detail,
  product,
  handleChangeQuantity,
  handleDeleteQuantity,
}: {
  detail: { sizeId: number; quantity: number };
  product: Prisma.CartProductGetPayload<{
    include: {
      product: {
        include: {
          thumbnail: true;
          sizes: true;
        };
      };
    };
  }>;
  handleChangeQuantity: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDeleteQuantity: (data: {
    cartProductId: number | null;
    sizeId: number | null;
  }) => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const matchingProduct = product?.product?.sizes.find(
    (size) => size?.id === detail?.sizeId
  );
  if (!matchingProduct) return null;

  return (
    <TableRow key={matchingProduct?.id}>
      <TableCell>
        <h4 className="text-lg leading-tight">{matchingProduct?.name}</h4>
        <p className="text-sm">
          {matchingProduct?.size && matchingProduct?.size !== 0
            ? matchingProduct.size + " mm"
            : matchingProduct?.dimension}
        </p>
      </TableCell>
      <TableCell>
        <h4 className="text-lg font-semibold">{matchingProduct?.stock}</h4>
      </TableCell>
      <TableCell>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="text-lg font-semibold flex items-center gap-2">
              {detail?.quantity} <PencilIcon size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="top">
            <div className="flex items-center">
              <div>
                <span className="text-sm text-slate-500">Update quantity</span>
                <form
                  onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    handleChangeQuantity(e);
                    setPopoverOpen(false);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <Input
                      type="hidden"
                      name="cartProductId"
                      value={product?.id}
                      readOnly
                    />
                    <Input type="hidden" name="sizeId" value={detail?.sizeId} readOnly />
                    <Input
                      name="newQuantity"
                      type="number"
                      defaultValue={detail?.quantity}
                    />
                    <Button type="submit" variant="default">
                      <CheckCheckIcon />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        handleDeleteQuantity({
                          cartProductId: product?.id,
                          sizeId: detail?.sizeId,
                        });
                        setPopoverOpen(false);
                      }}
                      variant="destructive"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
    </TableRow>
  );
}
