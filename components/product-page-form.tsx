"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useEffect } from "react";
import { addToCart, updateProductFromCart } from "@/data/cart/actions";

// Shadcn
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2Icon, Loader2Icon, SaveIcon, ShoppingCartIcon } from "lucide-react";

// Types
import { Prisma } from "@/lib/generated/prisma";
import { TEngravingPreference } from "@/lib/types";

export default function ProductPageForm({
  product,
  preferences,
  cart,
}: {
  product: Prisma.ProductGetPayload<{
    include: {
      media: true;
      thumbnail: true;
      sizes: true;
    };
  }> | null;
  preferences: TEngravingPreference[] | null | undefined;
  cart: Prisma.CartProductGetPayload<{
    include: {
      product: true;
    };
  }> | null;
}) {
  const router = useRouter();
  const [otherEngraving, setOtherEngraving] = useState(false);
  const [otherHandle, setOtherHandle] = useState(false);
  const [details, setDetails] = useState<Prisma.JsonArray>(
    (cart?.details as Prisma.JsonArray) || []
  );

  const [state, actionForm, isLoading] = useActionState(
    cart ? updateProductFromCart : addToCart,
    {
      success: false,
      message: "",
      fieldErrors: {},
    }
  );

  useEffect(() => {
    if (state.success) {
      router.push("/cart");
    }
  }, [state, router]);

  if (!product) {
    return <h4 className="text-lg text-slate-500">Product not found!</h4>;
  }

  return (
    <form
      action={actionForm}
      onSubmit={() => {
        setOtherEngraving(false);
        setOtherHandle(false);
      }}
    >
      <h4 className="text-xl font-semibold mb-4">Product Sizes</h4>
      <input type="hidden" name="productId" readOnly value={product.id || ""} />
      <input
        type="hidden"
        name="details"
        readOnly
        value={JSON.stringify(details) || ""}
      />
      <div className="flex flex-col gap-4">
        <Table className="w-full">
          <TableCaption>Available sizes.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-4/12">Size</TableHead>
              <TableHead className="w-4/12">Price</TableHead>
              <TableHead className="w-2/12">Stock</TableHead>
              <TableHead className="w-2/12">Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {product.sizes.length > 0 ? (
              product.sizes.map((size) => {
                const productDetails = details as {
                  sizeId: number;
                  quantity: number;
                }[];
                const sizeQuantity =
                  productDetails !== undefined && productDetails !== null
                    ? productDetails.find((value) => {
                        return value.sizeId === size.id;
                      })?.quantity
                    : 0;

                return (
                  <TableRow key={size.id}>
                    <TableCell>
                      <p>
                        <span className="text-lg">{size.name}</span>
                        <br />
                        <span className="text-sm">{size.size}</span>
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-lg">
                        {new Intl.NumberFormat("ja-JP", {
                          style: "currency",
                          currency: "JPY",
                        }).format(size.price)}{" "}
                        <span className="text-xs">ea.</span>
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-lg font-semibold">{size.stock}</p>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        max={size.stock}
                        min={0}
                        name={`size_${size.id}`}
                        placeholder="0"
                        autoComplete="off"
                        className="px-1 text-center"
                        defaultValue={(sizeQuantity && sizeQuantity) || undefined}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (isNaN(value)) return;

                          setDetails((prev) => {
                            if (prev.length === 0)
                              return [
                                { sizeId: size.id, quantity: value },
                              ] as Prisma.JsonArray;
                            return prev.map((item) => {
                              const itemDetail = item as {
                                sizeId: number;
                                quantity: number;
                              };

                              if (itemDetail.sizeId === size.id) {
                                return {
                                  sizeId: size.id,
                                  quantity: value,
                                } as Prisma.JsonValue;
                              }

                              return item;
                            }) as Prisma.JsonArray;
                          });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <p className="text-slate-500">
                    There are no sizes registered for this product.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm text-slate-500">Engraving</p>
          <Select
            disabled={false}
            name="brand"
            defaultValue={cart?.brand || product.brand}
            onValueChange={(value) =>
              value === "other" ? setOtherEngraving(true) : setOtherEngraving(false)
            }
          >
            <SelectTrigger className="w-full py-6">
              <SelectValue placeholder="Choose engraving brand." />
            </SelectTrigger>
            <SelectContent>
              {cart && cart.brand !== product.brand && (
                <SelectGroup>
                  <SelectLabel>Current In Cart</SelectLabel>
                  <SelectItem value={cart.brand} className="capitalize">
                    {cart.brand}
                  </SelectItem>
                </SelectGroup>
              )}

              {preferences && preferences.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Saved Preferences</SelectLabel>
                  {preferences.map((value, i) => {
                    return (
                      <SelectItem key={`engraving-${i}`} value={value.slug}>
                        {value.name}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              )}
              <SelectGroup>
                <SelectLabel>Default</SelectLabel>
                <SelectItem value={product.brand} className="capitalize">
                  {product.brand}
                </SelectItem>
              </SelectGroup>

              {product.brand === "OEM" && (
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
            />
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm text-slate-500">Handle</p>
          <Select
            disabled={false}
            name="handle"
            defaultValue={cart?.handle || product.handle}
            onValueChange={(value) =>
              value === "custom" ? setOtherHandle(true) : setOtherHandle(false)
            }
          >
            <SelectTrigger className="w-full py-6">
              <SelectValue placeholder="Choose engraving brand." />
            </SelectTrigger>
            <SelectContent>
              {cart && cart.handle && cart.handle !== product.handle && (
                <SelectGroup>
                  <SelectLabel>Current In Cart</SelectLabel>
                  <SelectItem value={cart.handle || ""} className="capitalize">
                    {cart.handle}
                  </SelectItem>
                </SelectGroup>
              )}

              <SelectGroup>
                <SelectLabel>Default</SelectLabel>
                <SelectItem value={product.handle} className="capitalize">
                  {product.handle}
                </SelectItem>
              </SelectGroup>

              {product.canChangeHandle && (
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
            />
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm text-slate-500">Specific Request</p>
          <Textarea
            name="request"
            placeholder="Type your message here."
            defaultValue={cart?.request || ""}
            disabled={false}
          />
        </div>

        {state?.message && (
          <Alert variant="info" className="my-3">
            <CheckCircle2Icon />
            <AlertDescription>{state?.message}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          {cart && (
            <p className="text-sm text-center text-slate-500 mb-3">
              This product is in your cart.
            </p>
          )}

          {isLoading ? (
            <Button className="w-full py-6" variant="outline" size="lg" disabled>
              <Loader2Icon className="animate-spin" />
              Loading...
            </Button>
          ) : (
            <Button className="w-full py-6" type="submit" variant="default" size="lg">
              {cart ? (
                <span className="flex gap-2">
                  <SaveIcon />
                  Save Changes
                </span>
              ) : (
                <span className="flex gap-2">
                  <ShoppingCartIcon />
                  Add to Cart
                </span>
              )}
            </Button>
          )}
        </div>

        <div>
          <p className="text-sm text-center text-slate-500">
            ** Please note <strong>if you don&#39;t</strong> change engraving, handle or
            add any specific request, we will proceed with the standard configuration.
          </p>
        </div>
      </div>
    </form>
  );
}
