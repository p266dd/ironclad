"use client";

import { useState } from "react";

// Shadcn
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  productId: string | undefined;
  details?: string | undefined;
  brand?: string | undefined;
  handle?: string | undefined;
  request?: string | undefined;
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
    sizeId: number;
    quantity: number;
  }[];
}) {
  const [sizePopover, setSizePopover] = useState(false);

  return (
    <Popover open={sizePopover} onOpenChange={setSizePopover}>
      <PopoverTrigger>
        <h4 className="text-lg font-semibold flex items-center gap-2">
          {orderProductDetails?.find((detail) => Number(detail.sizeId) === size?.id)
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
                  value={orderProduct?.productId}
                  readOnly
                />
                <Input type="hidden" name="sizeId" value={size?.id} readOnly />
                <Input
                  name="newQuantity"
                  type="number"
                  defaultValue={
                    orderProductDetails?.find(
                      (detail) => Number(detail.sizeId) === size?.id
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
