"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import CartProductDetailRow from "./cart-product-detail-row";
import FallbackImage from "@/assets/product-fallback.webp";

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
import { SaveIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  updateOrderProductQuantity,
  deleteOrderProductSize,
  updateOrderProductDetails,
} from "@/data/cart/actions";

// Types
import { CartProductWithRelations, TEngravingPreference } from "@/lib/types";

export default function SingleCartProduct({
  product,
  preferences,
}: {
  product: CartProductWithRelations;
  preferences: TEngravingPreference[] | null | undefined;
}) {
  const [loading, setLoading] = useState(false);
  const [save, setSave] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<{
    brand?: string | undefined;
    handle?: string | undefined;
    request?: string | undefined;
  } | null>(null);
  const [otherEngraving, setOtherEngraving] = useState(false);
  const [otherHandle, setOtherHandle] = useState(false);

  const productThumbnail = product.product?.thumbnail?.url;
  const productDetail = product?.details as { sizeId: number; quantity: number }[];

  const handleUpdateDetails = async () => {
    setLoading(true);
    const updatedDetails = await updateOrderProductDetails({
      cartProductId: product.id,
      details: unsavedChanges,
    });

    if (updatedDetails.success === false && "message" in updatedDetails) {
      toast.error(updatedDetails.message);
      setLoading(false);
      return;
    }

    toast.success("Product in cart updated!");

    setUnsavedChanges(null);
    setSave(false);
    setLoading(false);
  };

  const handleDeleteQuantity = async ({
    cartProductId,
    sizeId,
  }: {
    cartProductId: number | null;
    sizeId: number | null;
  }) => {
    setLoading(true);
    if (cartProductId === null || sizeId === null) {
      toast.error("Product and size was not provided.");
      setLoading(false);
      return;
    }

    const deletedQuantity = await deleteOrderProductSize({ cartProductId, sizeId });

    if (deletedQuantity === null) {
      toast.error("Product has been removed from cart.");
      return;
    }

    if (deletedQuantity.success === false && "message" in deletedQuantity) {
      toast.error(deletedQuantity.message);
      setLoading(false);
      return;
    }

    toast.success("Quantity updated!");

    setLoading(false);
    return;
  };

  const handleChangeQuantity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);

    const cartProductId = Number(formData.get("cartProductId"));
    const sizeId = Number(formData.get("sizeId"));
    const newQuantity = formData.get("newQuantity");

    if (Number.isNaN(cartProductId) || cartProductId === null) {
      toast.error("Product was not provided.");
      setLoading(false);
      return;
    }

    if (Number.isNaN(sizeId) || sizeId === null) {
      toast.error("Size was not provided.");
      setLoading(false);
      return;
    }

    if (Number.isNaN(newQuantity) || newQuantity === null) {
      toast.error("Quantity was not provided.");
      setLoading(false);
      return;
    }

    const validateData = {
      cartProductId: Number(cartProductId),
      sizeId: Number(sizeId),
      newQuantity: Number(newQuantity),
    } as {
      cartProductId: number;
      sizeId: number;
      newQuantity: number;
    };

    const updatedQuantity = await updateOrderProductQuantity(validateData);

    if (updatedQuantity.success === false && "message" in updatedQuantity) {
      toast.error(updatedQuantity.message);
      setLoading(false);
      return;
    }

    toast.success("Quantity updated!");

    setLoading(false);
    return updatedQuantity;
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value={product?.cartId}
        className="data-[state=open]:bg-slate-100 rounded-lg px-4"
      >
        <AccordionTrigger className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="relative max-h-[200px] h-[200px] min-w-[120px] lg:w-[120px] lg:mr-4">
              <Image
                src={productThumbnail || FallbackImage}
                alt={product.product?.name || "Product Thumbnail"}
                className="rounded-md overflow-hidden object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 15vw"
                priority
                fill
              />
            </div>
            <div className="w-3/4 flex flex-col">
              <h4 className="capitalize font-semibold text-lg leading-snug mb-2 lg:text-2xl">
                {product?.product?.name}
              </h4>
              <p className="lg:text-base capitalize">
                <strong>Brand:</strong> {product?.brand}
              </p>
              <p className="lg:text-base capitalize">
                <strong>Handle:</strong> {product?.handle}
              </p>
              <p className="lg:text-base w-full max-w-[200px] md:max-w-[500px] truncate">
                <strong>Request:</strong> {product?.request || "No special request."}
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
              <Link className="text-xs" href={"/products/" + product?.product?.id}>
                Open Product Page
              </Link>
            </Button>
          </div>
          <div className="bg-white p-1 mb-2 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6/12">Size</TableHead>
                  <TableHead className="w-3/12">Available</TableHead>
                  <TableHead className="w-3/12">Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productDetail?.map((detail) => {
                  const matchingProduct = product?.product?.sizes.find(
                    (size) => size?.id === detail?.sizeId
                  );
                  if (!matchingProduct) return null;

                  return (
                    <CartProductDetailRow
                      key={detail.sizeId}
                      detail={detail}
                      product={product}
                      handleChangeQuantity={handleChangeQuantity}
                      handleDeleteQuantity={handleDeleteQuantity}
                    />
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-4 md:px-4">
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-sm text-slate-500">Engraving</p>
                <Select
                  disabled={false}
                  name="brand"
                  value={
                    unsavedChanges?.brand || product?.brand || product?.product.brand
                  }
                  onValueChange={(value) => {
                    setSave(true);
                    if (value === "other") setOtherEngraving(true);
                    setUnsavedChanges((prev) => ({ ...prev, brand: value }));
                  }}
                >
                  <SelectTrigger className="w-full py-6">
                    <SelectValue
                      className="capitalize"
                      placeholder="Choose engraving brand."
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {product?.brand !== product.product?.brand && (
                      <SelectGroup>
                        <SelectLabel>Current In Cart</SelectLabel>
                        <SelectItem value={product?.brand} className="capitalize">
                          {product?.brand}
                        </SelectItem>
                      </SelectGroup>
                    )}
                    {preferences && preferences?.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Saved Preferences</SelectLabel>
                        {preferences.map(
                          (value, i) =>
                            value.slug !== product?.brand && (
                              <SelectItem
                                className="capitalize"
                                key={i}
                                value={value?.slug}
                              >
                                {value?.name}
                              </SelectItem>
                            )
                        )}
                      </SelectGroup>
                    )}
                    <SelectGroup>
                      <SelectLabel>Default</SelectLabel>
                      <SelectItem value={product?.product?.brand} className="capitalize">
                        {product?.product?.brand}
                      </SelectItem>
                    </SelectGroup>

                    {product?.product?.brand === "OEM" && (
                      <SelectGroup>
                        <SelectLabel>Write Your Own</SelectLabel>
                        <SelectItem value="other" className="capitalize">
                          Other
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
                    placeholder="What do you want engraved?"
                    className="py-6"
                    onChange={(e) => {
                      setSave(true);
                      setUnsavedChanges((prev) => ({ ...prev, brand: e.target.value }));
                    }}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <p className="text-sm text-slate-500">Handle</p>
                <Select
                  disabled={false}
                  name="handle"
                  value={
                    unsavedChanges?.handle || product?.handle || product?.product?.handle
                  }
                  onValueChange={(value) => {
                    setSave(true);
                    if (value === "custom") setOtherHandle(true);
                    setUnsavedChanges((prev) => ({ ...prev, handle: value }));
                  }}
                >
                  <SelectTrigger className="w-full py-6">
                    <SelectValue placeholder="Choose engraving brand." />
                  </SelectTrigger>
                  <SelectContent>
                    {product?.handle !== product?.product?.handle && (
                      <SelectGroup>
                        <SelectLabel>Current In Cart</SelectLabel>
                        <SelectItem value={product?.handle} className="capitalize">
                          {product?.handle}
                        </SelectItem>
                      </SelectGroup>
                    )}

                    <SelectGroup>
                      <SelectLabel>Default</SelectLabel>
                      <SelectItem value={product?.product?.handle} className="capitalize">
                        {product?.product?.handle}
                      </SelectItem>
                    </SelectGroup>

                    {product?.product?.canChangeHandle && (
                      <SelectGroup>
                        <SelectLabel>Custom</SelectLabel>
                        <SelectItem value="custom" className="capitalize">
                          Other
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
                    placeholder="What handle would you like?"
                    className="py-6"
                    onChange={(e) => {
                      setSave(true);
                      setUnsavedChanges((prev) => ({ ...prev, handle: e.target.value }));
                    }}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-500">Specific Request</p>
                <Textarea
                  name="request"
                  placeholder="Type your message here."
                  value={unsavedChanges?.request ?? product?.request ?? ""}
                  disabled={false}
                  onChange={(e) => {
                    if (!save) setSave(true);
                    setUnsavedChanges((prev) => ({ ...prev, request: e.target.value }));
                  }}
                />
              </div>
            </div>
          </div>
          {save && unsavedChanges && (
            <div className="flex items-center justify-start gap-4">
              <Button
                onClick={handleUpdateDetails}
                type="button"
                variant="success"
                size="lg"
                disabled={loading}
                className="flex-1 w-full"
              >
                <SaveIcon />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => {
                  setSave(false);
                  setUnsavedChanges(null);
                }}
                type="button"
                variant="outline"
                size="lg"
                disabled={loading}
                className="flex-1 w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
