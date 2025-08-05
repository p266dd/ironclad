"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import { getProductsPreview } from "@/data/product/action";

// Shadcn
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Types
import { Prisma } from "@/lib/generated/prisma";
type ProductPreview = Pick<
  Prisma.ProductGetPayload<{ include: { thumbnail: true } }>,
  "id" | "name" | "handle" | "material"
>;

export default function SearchPreview({
  currentTerm,
  setData,
}: {
  currentTerm: string;
  setData: (term: string) => void;
}) {
  const [products, setProducts] = useState<ProductPreview[] | null>(null);

  // Debounce, reduce the amount of fetch calls.
  let timeout: NodeJS.Timeout | null = null;
  const debounce = (func: () => Promise<void>, delay: number) => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func();
    }, delay);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.value.length <= 3) {
      setProducts(null);
      return;
    }

    debounce(async () => {
      const data = await getProductsPreview(e.target.value);
      setProducts(data);
    }, 300);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setProducts(null);
    });
  }, []);

  return (
    <div className="relative">
      <div id="preview-search">
        <Input
          type="text"
          name="searchTerm"
          className="py-6"
          autoComplete="off"
          value={currentTerm}
          onChange={(e) => {
            setData(e.target.value);
            handleInputChange(e);
          }}
          placeholder="Search"
        />
      </div>
      {products && products.length > 0 && (
        <div className="absolute top-16 left-0 w-full z-50">
          <div className="p-6 max-h-[60vh] overflow-y-auto bg-white border rounded-lg shadow-2xl">
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <div key={product.id}>
                  <Link href={"/products/" + product.id}>
                    <h4 className="leading-5 text-lg font-semibold mb-2">
                      {product?.name}
                    </h4>
                    <div className="flex flex-col md:gap-1">
                      <h5 className="text-sm text-slate-500">
                        <strong>Handle</strong> {product?.handle}
                      </h5>
                      <h5 className="text-sm text-slate-500">
                        <strong>Material</strong> {product?.material}
                      </h5>
                    </div>
                  </Link>
                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
