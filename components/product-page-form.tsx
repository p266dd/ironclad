"use client";

import { useActionState, useState } from "react";

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

// Types
import { Prisma } from "@/lib/generated/prisma";
import { ShoppingCartIcon } from "lucide-react";

const addToCart = () => null;

export default function ProductPageForm({
  product,
}: {
  product: Prisma.ProductGetPayload<{
    include: {
      media: true;
      thumbnail: true;
      sizes: true;
    };
  }> | null;
}) {
  const [otherEngraving, setOtherEngraving] = useState(false);
  const [state, actionForm] = useActionState(addToCart, {});

  if (!product) {
    return <h4 className="text-lg text-slate-500">Product not found!</h4>;
  }

  return (
    <form action={actionForm}>
      <h4 className="text-xl font-semibold mb-4">Product Sizes</h4>
      <input type="hidden" name="productId" value={product.id} />
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
              product.sizes.map((size) => (
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
                      ¥ {size.price} <span className="text-xs">ea.</span>
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
                      defaultValue={
                        0
                        // cartProduct &&
                        // JSON.parse(cartProduct.details).find(
                        //   (d) => Number(d.id) === Number(size.id)
                        // ).quantity
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
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
            onValueChange={(value) =>
              value === "other" ? setOtherEngraving(true) : setOtherEngraving(false)
            }
          >
            <SelectTrigger className="w-full py-6">
              <SelectValue placeholder="Choose engraving brand." />
            </SelectTrigger>
            <SelectContent>
              {/* loop through preferences <SelectGroup>
                <SelectLabel>Save Preferences</SelectLabel>
                <SelectItem value="gmt">Save Brands</SelectItem>
              </SelectGroup> */}

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
          <p className="text-sm text-slate-500">Specific Request</p>
          <Textarea placeholder="Type your message here." disabled={false}></Textarea>
        </div>

        <div className="mt-4">
          <Button className="w-full py-6" type="submit" variant="default" size="lg">
            <ShoppingCartIcon />
            Add to Cart
          </Button>
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
