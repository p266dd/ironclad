"use client";

import { useState } from "react";
import { Prisma } from "@/lib/generated/prisma";

// Shadcn
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckCheckIcon, PencilIcon } from "lucide-react";

type TSize = {
  size: number;
  name: string;
  id: number;
  dimension: string | null;
  price: number;
  stock: number;
  productId: string | null;
};

type TOrderProduct = {
  productId: string | undefined | null;
  details?: string | Prisma.JsonValue | undefined;
  brand?: string | undefined | null;
  handle?: string | undefined | null;
  request?: string | undefined | null;
};

export default function AdminSingleOrderPopover({
  size,
  saveSize,
  orderProduct,
  orderProductDetails,
}: {
  size: TSize;
  saveSize: (e: React.FormEvent<HTMLFormElement>) => void;
  orderProduct: TOrderProduct | undefined;
  orderProductDetails: {
    id: number;
    quantity: number;
    priceAtOrder: number;
  }[];
}) {
  const [sizePopover, setSizePopover] = useState(false);

  return (
    <Popover open={sizePopover} onOpenChange={setSizePopover}>
      <PopoverTrigger>
        <h4 className="text-lg font-semibold flex items-center gap-2">
          {orderProductDetails?.find((detail) => Number(detail.id) === size?.id)
            ?.quantity || 0}{" "}
          <PencilIcon size={14} />
        </h4>
      </PopoverTrigger>
      <PopoverContent align="start" side="top">
        <div className="flex items-center">
          <div>
            <span className="text-sm text-slate-500">数量を更新</span>
            <form onSubmit={saveSize}>
              <div className="flex items-center gap-1">
                <Input
                  type="hidden"
                  name="cartProductId"
                  value={orderProduct?.productId ?? ""}
                  readOnly
                />
                <Input type="hidden" name="sizeId" value={size?.id} readOnly />
                <Input
                  name="newQuantity"
                  type="number"
                  defaultValue={
                    orderProductDetails?.find(
                      (detail) => Number(detail.id) === size?.id
                    )?.quantity || 0
                  }
                />
                <Button
                  type="submit"
                  variant="default"
                  onClick={() => setSizePopover(false)}
                >
                  <CheckCheckIcon />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
