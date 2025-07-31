"use client";

import React, { useState } from "react";

// Shadcn
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectGroup,
  SelectLabel,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Types
import { Prisma } from "@/lib/generated/prisma";
import AdminSingleOrderPopover from "./admin-single-order-popover";

// Types
type TOrder = {
  clientId: string | undefined | null;
  orderProduct: TOrderProduct[];
};

type TOrderProduct = {
  productId: string | undefined | null;
  details?: string | Prisma.JsonValue | undefined;
  brand?: string | undefined | null;
  handle?: string | undefined | null;
  request?: string | undefined | null;
};

export default function AdminSingleOrder({
  fullProduct,
  order,
  saveSize,
  saveDetails,
}: {
  fullProduct: Prisma.ProductGetPayload<{ include: { sizes: true } }>;
  order: TOrder;
  saveSize: (e: React.FormEvent<HTMLFormElement>) => void;
  saveDetails: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [save, setSave] = useState(false);
  const [otherEngraving, setOtherEngraving] = useState(false);
  const [otherHandle, setOtherHandle] = useState(false);

  const orderProduct = order.orderProduct.find(
    (product) => product.productId === fullProduct.id
  );

  const orderProductDetails = orderProduct?.details
    ? typeof orderProduct?.details === "string"
      ? (JSON.parse(orderProduct.details) as {
          id: number;
          quantity: number;
          priceAtOrder: number;
        }[])
      : (orderProduct?.details as {
          id: number;
          quantity: number;
          priceAtOrder: number;
        }[])
    : [];

  if (!fullProduct.id || fullProduct.sizes === undefined) {
    return null;
  }

  if (!orderProduct) {
    return null;
  }

  return (
    <AccordionItem value={fullProduct.id} className="mb-6">
      <AccordionTrigger className="bg-gray-50 px-6 py-3 text-lg hover:no-underline cursor-pointer">
        <span className="flex items-center gap-3">{fullProduct?.name}</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-white p-1 mb-2 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-6/12">サイズ</TableHead>
                <TableHead className="w-3/12">在庫</TableHead>
                <TableHead className="w-3/12">注文</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fullProduct.sizes &&
                fullProduct.sizes.length > 0 &&
                fullProduct.sizes.map((size, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <h4 className="text-lg leading-tight">{size?.name}</h4>
                      {size?.size !== 0 && (
                        <p className="text-sm">{size?.size} mm</p>
                      )}
                      {size?.dimension !== "0mm" && (
                        <p className="text-sm">{size?.dimension}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <h4 className="text-lg font-semibold">{size?.stock}</h4>
                    </TableCell>
                    <TableCell>
                      <AdminSingleOrderPopover
                        size={size}
                        saveSize={saveSize}
                        orderProduct={orderProduct}
                        orderProductDetails={orderProductDetails}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              saveDetails(e);
              setSave(false);
            }}
          >
            <input
              type="hidden"
              name="productId"
              value={fullProduct.id}
              readOnly
            />
            <div className="mt-4 md:px-4">
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-sm text-slate-500">ブランド</p>
                <Select
                  disabled={false}
                  name="brand"
                  value={
                    otherEngraving
                      ? "other"
                      : orderProduct?.brand || fullProduct?.brand
                  }
                  onValueChange={(value) => {
                    if (value === "other") {
                      setOtherEngraving(true);
                    }
                    setSave(true);
                  }}
                >
                  <SelectTrigger className="w-full py-6">
                    <SelectValue
                      className="capitalize"
                      placeholder="彫刻ブランドを選択してください。"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {orderProduct?.brand &&
                      orderProduct?.brand !== fullProduct?.brand && (
                        <SelectGroup>
                          <SelectLabel>現在の注文内</SelectLabel>
                          <SelectItem
                            value={orderProduct.brand}
                            className="capitalize"
                          >
                            {orderProduct?.brand}
                          </SelectItem>
                        </SelectGroup>
                      )}
                    <SelectGroup>
                      <SelectLabel>デフォルト</SelectLabel>
                      <SelectItem
                        value={fullProduct?.brand}
                        className="capitalize"
                      >
                        {fullProduct?.brand}
                      </SelectItem>
                    </SelectGroup>

                    {fullProduct?.brand === "OEM" && (
                      <SelectGroup>
                        <SelectLabel>自分で入力</SelectLabel>
                        <SelectItem value="other" className="capitalize">
                          その他
                        </SelectItem>
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>

                {otherEngraving && (
                  <Input
                    type="text"
                    name="brandOther"
                    autoComplete="off"
                    placeholder="何を彫刻しますか？"
                    className="py-6"
                    defaultValue={
                      otherEngraving
                        ? orderProduct?.brand
                          ? orderProduct?.brand
                          : ""
                        : ""
                    }
                    onChange={() => setSave(true)}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <p className="text-sm text-slate-500">ハンドル</p>
                <Select
                  disabled={false}
                  name="handle"
                  value={
                    otherHandle
                      ? "other"
                      : orderProduct?.handle || fullProduct?.handle
                  }
                  onValueChange={(value) => {
                    if (value === "other") {
                      setOtherHandle(true);
                    }
                    setSave(true);
                  }}
                >
                  <SelectTrigger className="w-full py-6">
                    <SelectValue placeholder="Choose engraving brand." />
                  </SelectTrigger>
                  <SelectContent>
                    {orderProduct?.handle &&
                      orderProduct?.handle !== fullProduct?.handle && (
                        <SelectGroup>
                          <SelectLabel>現在の注文内</SelectLabel>
                          <SelectItem
                            value={orderProduct?.handle}
                            className="capitalize"
                          >
                            {orderProduct?.handle}
                          </SelectItem>
                        </SelectGroup>
                      )}

                    <SelectGroup>
                      <SelectLabel>デフォルト</SelectLabel>
                      <SelectItem
                        value={fullProduct?.handle}
                        className="capitalize"
                      >
                        {fullProduct?.handle}
                      </SelectItem>
                    </SelectGroup>

                    {fullProduct?.canChangeHandle && (
                      <SelectGroup>
                        <SelectLabel>自分で入力</SelectLabel>
                        <SelectItem value="other" className="capitalize">
                          その他
                        </SelectItem>
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>

                {otherHandle && (
                  <Input
                    type="text"
                    name="handleOther"
                    autoComplete="off"
                    placeholder="自分で入力"
                    className="py-6"
                    defaultValue={
                      otherHandle
                        ? orderProduct?.handle
                          ? orderProduct?.handle
                          : ""
                        : ""
                    }
                    onChange={() => setSave(true)}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-500">特別なご要望</p>
                <Textarea
                  name="request"
                  placeholder="ここにメッセージを入力してください。"
                  defaultValue={orderProduct?.request ?? ""}
                  disabled={false}
                  onChange={() => setSave(true)}
                />
              </div>
            </div>
            <div className="my-6 ml-4">
              <Button type="submit" variant="default" disabled={!save}>
                変更を保存
              </Button>
            </div>
          </form>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
