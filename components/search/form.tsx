"use client";

import { useState } from "react";
import { redirect, RedirectType, useSearchParams } from "next/navigation";
import SearchPreview from "./preview";
import RangeSlider from "./range-slider";

// Shadcn
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

// Types
import { Brand, Material } from "@/lib/generated/prisma";

type TSearchState = {
  searchTerm: string;
  style: string;
  stock: string;
  price: {
    min: number;
    max: number;
  };
  brand: string[];
  material: string[];
};

export default function SearchForm({
  availableBrands,
  availableMaterials,
  remoteClose,
}: {
  availableBrands: Brand[] | null;
  availableMaterials: Material[] | null;
  remoteClose?: () => void;
}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const getRange = (_for: string) => {
    const range = searchParams.get(String(_for));
    if (range) {
      return {
        min: Number(range.split("-")[0]),
        max: Number(range.split("-")[1]),
      };
    } else {
      return {
        min: undefined,
        max: undefined,
      };
    }
  };

  const [searchState, setSearchState] = useState<TSearchState>({
    searchTerm: searchParams.get("searchTerms") || "",
    style: searchParams.get("style") || "all",
    stock: searchParams.get("stock") || "all",
    price: {
      min: getRange("price")?.min || 0,
      max: getRange("price")?.max || 90000,
    },
    brand: searchParams.getAll("brand") || [],
    material: searchParams.getAll("material") || [],
  });

  // Handle the search data url search params.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // * Create searchparams from object.
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(searchState)) {
      if (key === "price") {
        // Only append if min/max are defined.
        if (
          typeof value === "object" &&
          "min" in value &&
          "max" in value &&
          value.min !== undefined &&
          value.max !== undefined
        ) {
          searchParams.append(key, `${value.min}-${value.max}`);
        }
      } else if (key === "searchTerm") {
        // Only append if searchTerm isn't empty.
        if (value !== "") {
          searchParams.append(key, value as string);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else {
        searchParams.append(key, value as string);
      }
    }

    setLoading(false);
    if (remoteClose !== undefined) remoteClose();
    redirect(`/search/results?${searchParams.toString()}`, RedirectType.push);
  };

  return (
    <form className="w-full max-w-[800px]" onSubmit={handleSubmit}>
      <div className="my-4">
        <SearchPreview
          currentTerm={searchState.searchTerm}
          setData={(term: string) =>
            setSearchState((prev) => ({ ...prev, searchTerm: term }))
          }
        />
      </div>

      <div>
        <p className="text-lg text-slate-500 mb-2">Knife Style</p>
      </div>
      <div className="flex items-center flex-wrap gap-3 max-w-6xl mb-6">
        <Label
          htmlFor="japaneseHandle"
          className="flex-1 flex items-center justify-center px-4 py-3 bg-slate-50 rounded-lg"
        >
          <Input
            id="japaneseHandle"
            type="radio"
            name="style"
            className="w-4 h-4"
            defaultChecked={
              searchParams.get("style") === "japanese" || searchState.style === "japanese"
            }
            onChange={(e) => {
              setSearchState((prev) => ({
                ...prev,
                style: e.target.checked ? "japanese" : "",
              }));
            }}
          />
          Japanese
        </Label>

        <Label
          htmlFor="westernHandle"
          className="flex-1 flex items-center justify-center px-4 py-3 bg-slate-50 rounded-lg"
        >
          <Input
            id="westernHandle"
            name="style"
            type="radio"
            className="w-4 h-4"
            defaultChecked={
              searchParams.get("style") === "western" || searchState.style === "western"
            }
            onChange={(e) => {
              setSearchState((prev) => ({
                ...prev,
                style: e.target.checked ? "western" : "",
              }));
            }}
          />
          Western
        </Label>

        <Label
          htmlFor="allHandle"
          className="flex-1 flex items-center justify-center px-4 py-3 bg-slate-50 rounded-lg"
        >
          <Input
            id="allHandle"
            name="style"
            type="radio"
            className="w-4 h-4"
            defaultChecked={!searchParams.get("style") || searchState.style === "all"}
            onChange={(e) => {
              setSearchState((prev) => ({
                ...prev,
                style: e.target.checked ? "all" : "",
              }));
            }}
          />
          All
        </Label>
      </div>

      <div>
        <p className="text-lg text-slate-500 mb-2">Stock Availability</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center flex-wrap gap-3 max-w-6xl mb-6">
        <Label
          htmlFor="largeStock"
          className="w-full flex-1 flex items-center justify-center px-4 py-3 bg-slate-50 rounded-lg"
        >
          <Input
            id="largeStock"
            type="radio"
            name="stock"
            className="w-4 h-4"
            defaultChecked={
              searchParams.get("stock") === "largeStock" ||
              searchState.style === "largeStock"
            }
            onChange={(e) => {
              setSearchState((prev) => ({
                ...prev,
                stock: e.target.checked ? "largeStock" : "",
              }));
            }}
          />
          50 or more in stock.
        </Label>

        <Label
          htmlFor="allStock"
          className="w-full flex-1 flex items-center justify-center px-4 py-3 bg-slate-50 rounded-lg"
        >
          <Input
            id="allStock"
            type="radio"
            name="stock"
            className="w-4 h-4"
            defaultChecked={
              searchParams.get("stock") === "aall" || searchState.style === "all"
            }
            onChange={(e) => {
              setSearchState((prev) => ({
                ...prev,
                stock: e.target.checked ? "all" : "",
              }));
            }}
          />
          Any quantity.
        </Label>
      </div>

      <div className="mb-10 flex flex-col md:flex-row items-start gap-4 md:gap-12 max-w-6xl">
        <div className="flex-1 w-full">
          <div>
            <p className="text-lg text-slate-500 mb-2">Product Prices</p>
          </div>

          <RangeSlider
            label="Price"
            min={2000}
            max={90000}
            data={searchState.price}
            setData={(data: { min: number; max: number }) => {
              setSearchState((prev) => ({ ...prev, price: data }));
            }}
          />
        </div>
        {/* <div className="flex-1 w-full">
          <div>
            <p className="text-lg text-slate-500 mb-2">Product Sizes</p>
          </div>

          <RangeSlider
            label="Size"
            min={70}
            max={350}
            data={searchState.size}
            setData={(data: { min: number; max: number }) => {
              setSearchState((prev) => ({ ...prev, size: data }));
            }}
          />
        </div> */}
      </div>

      <div className="mb-6 max-w-6xl">
        <Accordion type="multiple">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-12">
            <div className="w-full">
              <AccordionItem value="brand">
                <AccordionTrigger className="bg-slate-500 text-primary-foreground px-4">
                  Search by Brands
                </AccordionTrigger>
                <AccordionContent className="px-4 py-5">
                  <div className="flex items-center flex-wrap gap-4">
                    <Label
                      htmlFor="brandAll"
                      className="flex-1 flex items-center justify-start px-4 py-3 bg-slate-50 rounded-lg"
                    >
                      <Input
                        id="brandAll"
                        name="brand"
                        type="checkbox"
                        className="w-4 h-4"
                        defaultChecked={false}
                        onChange={() =>
                          setSearchState((prev) => ({
                            ...prev,
                            brand: [...prev.brand, "all"],
                          }))
                        }
                      />
                      All
                    </Label>

                    {availableBrands && availableBrands.length > 0
                      ? availableBrands.map((brand) => (
                          <Label
                            key={brand.id}
                            htmlFor={brand.name}
                            className="flex-1 flex items-center justify-start px-4 py-3 bg-slate-50 rounded-lg"
                          >
                            <Input
                              id={brand.name}
                              name="brand"
                              type="checkbox"
                              className="w-4 h-4"
                              defaultChecked={
                                searchState.brand && typeof searchState.brand === "object"
                                  ? searchState.brand.some((name) => name === brand.name)
                                  : searchState.brand === brand.name
                              }
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (e.target.checked === true) {
                                  setSearchState((prev) => ({
                                    ...prev,
                                    brand: [...prev.brand, brand.name],
                                  }));
                                } else {
                                  setSearchState((prev) => ({
                                    ...prev,
                                    brand: prev.brand.filter((f) => f === brand.name),
                                  }));
                                }
                              }}
                            />
                            {brand.name}
                          </Label>
                        ))
                      : "No brands registered."}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </div>

            <div className="w-full">
              <AccordionItem value="material">
                <AccordionTrigger className="bg-slate-500 text-primary-foreground px-4">
                  Search by Material
                </AccordionTrigger>
                <AccordionContent className="px-4 py-5">
                  <div className="flex items-center gap-4">
                    <Label
                      htmlFor="materialAll"
                      className="flex-1 flex items-center justify-start px-4 py-3 bg-slate-50 rounded-lg"
                    >
                      <Input
                        id="materialAll"
                        name="material"
                        type="checkbox"
                        className="w-4 h-4"
                        defaultChecked={false}
                        onChange={() =>
                          setSearchState((prev) => ({
                            ...prev,
                            material: [...prev.material, "all"],
                          }))
                        }
                      />
                      All
                    </Label>

                    {availableMaterials && availableMaterials.length > 0
                      ? availableMaterials.map((material) => (
                          <Label
                            key={material.id}
                            htmlFor={material.name}
                            className="flex-1 flex items-center justify-start px-4 py-3 bg-slate-50 rounded-lg"
                          >
                            <Input
                              id={material.name}
                              name="material"
                              type="checkbox"
                              className="w-4 h-4"
                              defaultChecked={
                                searchState.material &&
                                typeof searchState.material === "object"
                                  ? searchState.material.some(
                                      (name) => name === material.name
                                    )
                                  : searchState.material === material.name
                              }
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (e.target.checked === true) {
                                  setSearchState((prev) => ({
                                    ...prev,
                                    material: [...prev.material, material.name],
                                  }));
                                } else {
                                  setSearchState((prev) => ({
                                    ...prev,
                                    material: prev.material.filter(
                                      (f) => f === material.name
                                    ),
                                  }));
                                }
                              }}
                            />
                            {material.name}
                          </Label>
                        ))
                      : "No materials registered."}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </div>
          </div>
        </Accordion>
      </div>

      <div className="mb-6 max-w-6xl">
        <Button
          type="submit"
          variant={loading ? "outline" : "default"}
          size="lg"
          className="w-full text-lg h-14"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={24} className="animate-spin" />
              Loading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search size={24} />
              Search
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
