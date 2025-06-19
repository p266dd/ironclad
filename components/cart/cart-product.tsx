"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

//Shadcn
import {
  Accordion,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCheckIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { updateOrderProductQuantity, deleteOrderProductSize } from "@/data/cart/actions";

// Types
import { CartProductWithRelations } from "@/lib/types";

export default function SingleCartProduct({
  product,
}: {
  product: CartProductWithRelations;
}) {
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const productThumbnail = product.product.thumbnail?.url;
  const productDetail = product.details as { sizeId: number; quantity: number }[];

  const handleDeleteQuantity = async ({
    cartProductId,
    sizeId,
  }: {
    cartProductId: number | null;
    sizeId: number | null;
  }) => {
    setLoading(true);
    const deletedQuantity = await deleteOrderProductSize({ cartProductId, sizeId });

    if (!deletedQuantity) {
      toast.error("Failed to update quantity.");
      return;
    }

    toast.success("Quantity updated!");
    setPopoverOpen(false);
    return deletedQuantity;
  };

  const handleChangeQuantity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);

    const cartProductId = formData.get("cartProductId");
    const sizeId = formData.get("sizeId");
    const newQuantity = formData.get("newQuantity");

    const validateData = {
      cartProductId: Number(cartProductId) || null,
      sizeId: Number(sizeId) || null,
      newQuantity: Number(newQuantity) || 0,
    } as {
      cartProductId: number | null;
      sizeId: number | null;
      newQuantity: number;
    };

    const updatedQuantity = await updateOrderProductQuantity(validateData);

    setLoading(false);

    if (!updatedQuantity) {
      toast.error("Failed to update quantity.");
      return;
    }

    toast.success("Quantity updated!");
    setPopoverOpen(false);
    return updatedQuantity;
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value={product.cartId}
        className="data-[state=open]:bg-slate-100 rounded-lg px-4"
      >
        <AccordionTrigger className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-1/4 lg:w-auto lg:mr-4">
              <img
                src={productThumbnail}
                alt={product.product.name}
                className="max-h-[200px] rounded-md overflow-hidden"
              />
            </div>
            <div className="w-3/4 flex flex-col">
              <h4 className="font-semibold text-lg leading-snug mb-2 lg:text-2xl">
                {product.product.name}
              </h4>
              <p className="lg:text-base">
                <strong>Brand:</strong> {product.brand}
              </p>
              <p className="lg:text-base">
                <strong>Handle:</strong> {product.handle}
              </p>
              <p className="lg:text-base">
                <strong>Request:</strong> {product.request}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mb-2">
            <Button
              variant="default"
              size="sm"
              className="w-full flex items-center justify-center"
              asChild
            >
              <Link className="text-xs" href={"/products/" + product.product.id}>
                Open Product Page
              </Link>
            </Button>
          </div>
          <div className="bg-white p-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6/12">Size</TableHead>
                  <TableHead className="w-3/12">Available</TableHead>
                  <TableHead className="w-3/12">Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productDetail.map((detail) => {
                  const matchingProduct = product.product.sizes.find(
                    (size) => size.id === detail.sizeId
                  );
                  if (!matchingProduct) return null;

                  return (
                    <TableRow key={matchingProduct.id}>
                      <TableCell>
                        <h4 className="text-lg leading-tight">{matchingProduct.name}</h4>
                        <p className="text-sm">{matchingProduct.size}</p>
                      </TableCell>
                      <TableCell>
                        <h4 className="text-lg font-semibold">{matchingProduct.stock}</h4>
                      </TableCell>
                      <TableCell>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger>
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                              {detail.quantity} <PencilIcon size={14} />
                            </h4>
                          </PopoverTrigger>
                          <PopoverContent align="start" side="top">
                            <div className="flex items-center">
                              <div>
                                <span className="text-sm text-slate-500">
                                  Update quantity
                                </span>
                                <form onSubmit={handleChangeQuantity}>
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="hidden"
                                      name="cartProductId"
                                      value={product.id}
                                      readOnly
                                    />
                                    <Input
                                      type="hidden"
                                      name="sizeId"
                                      value={detail.sizeId}
                                      readOnly
                                    />
                                    <Input
                                      name="newQuantity"
                                      type="number"
                                      defaultValue={detail.quantity}
                                    />
                                    <Button type="submit" variant="default">
                                      <CheckCheckIcon />
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteQuantity({
                                          cartProductId: product.id,
                                          sizeId: detail.sizeId,
                                        })
                                      }
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
                })}
              </TableBody>
            </Table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
