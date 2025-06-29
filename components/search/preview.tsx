"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProductsPreview } from "@/data/product/action";
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
  const [inputText, setInputText] = useState("");
  const [products, setProducts] = useState<ProductPreview[] | null>(null);

  useEffect(() => {
    if (inputText.length <= 3) {
      setProducts(null);

      return;
    }

    // Quick search for preview.
    const fetchData = async () => {
      const data = await getProductsPreview(inputText);
      setProducts(data);
    };

    window.addEventListener("click", () => {
      setProducts(null);
    });

    fetchData();
  }, [inputText]);

  return (
    <div className="relative">
      <div>
        <Input
          type="text"
          name="searchTerm"
          className="py-6"
          autoComplete="off"
          value={currentTerm}
          onChange={(e) => {
            setData(e.target.value);
            setInputText(e.target.value);
          }}
          placeholder="Search"
        />
      </div>
      {products && products.length > 0 && (
        <div className="absolute top-16 left-0 w-full z-50">
          <div className="p-6 max-h-8/12 overflow-y-auto bg-white border rounded-lg shadow-2xl">
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <div key={product.id}>
                  <Link href={"/products/" + product.id}>
                    <h4 className="leading-5 text-lg font-semibold mb-2">
                      {product.name}
                    </h4>
                    <div className="flex flex-col md:flex-row md:gap-8">
                      <h5 className="text-sm text-slate-500">
                        <strong>Handle</strong> {product.handle}
                      </h5>
                      <h5 className="text-sm text-slate-500">
                        <strong>Material</strong> {product.material}
                      </h5>
                    </div>
                  </Link>
                </div>
              ))}
              <Separator className="mt-3" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
