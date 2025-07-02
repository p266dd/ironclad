"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import AdminImageUploader from "./image-uploader";
import ProductSizesTableForm from "./product-size-table-form";
import ModelPopover from "./model-popover";

import { getBrands } from "@/data/brand/action";
import { getHandles } from "@/data/handles/action";
import { getMaterials } from "@/data/material/action";
import { getFilters } from "@/data/filter/action";
import {
  updateProductDetails,
  saveThumbnail,
  addNewProduct,
} from "@/data/product/action";
import { saveFilter, deleteFilter, toggleFilter } from "@/data/filter/action";
import { addMedia, deleteMedia } from "@/data/media/action";

// Shadcn
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertCircleIcon,
  LoaderCircleIcon,
  MinusCircle,
  PencilIcon,
  PlusCircle,
  PlusCircleIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
} from "lucide-react";

// Types
import { Prisma } from "@/lib/generated/prisma";
import { Product } from "@/lib/generated/prisma";

export default function AdminProductForm({
  product,
  isNew,
}: {
  product: Prisma.ProductGetPayload<{
    include: { filters: true; media: true; thumbnail: true; sizes: true };
  }> | null;
  isNew?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [loadingSetThumbnail, setLoadingSetThumbnail] = useState(false);
  const [loadingSaveFilter, setLoadingSaveFilter] = useState(false);
  const [loadingDeleteFilter, setLoadingDeleteFilter] = useState(false);
  const [loadingSaveMedia, setLoadingSaveMedia] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<string | null>(null);

  const router = useRouter();

  // Fetch data
  const { data: filters, isLoading: loadingFilters } = useSWR("fetchFilters", getFilters);
  const { data: brands, isLoading: loadingBrands } = useSWR("fetchBrands", getBrands);
  const { data: handles, isLoading: loadingHandles } = useSWR("fetchHandles", getHandles);
  const { data: materials, isLoading: loadingMaterials } = useSWR(
    "fetchMaterials",
    getMaterials
  );

  const [productBrand, setProductBrand] = useState(product?.brand || "");

  useEffect(() => {
    if (product) {
      setProductBrand(product.brand || "");
    }
  }, [product]);

  const addFilter = async (filterId: number) => {
    const response = await toggleFilter({
      filterId: filterId,
      productId: product?.id || "",
      status: true,
    });
    if (response.error !== null) {
      toast.error(response.error);
      return;
    }
    mutate("fetchFilters");
  };

  const removeFilter = async (filterId: number) => {
    const response = await toggleFilter({
      filterId: filterId,
      productId: product?.id || "",
      status: false,
    });
    if (response.error !== null) {
      toast.error(response.error);
      return;
    }
    mutate("fetchFilters");
  };

  const handleSaveMedia = async (blob: Blob) => {
    setLoadingSaveMedia(true);
    try {
      const result = await addMedia({
        blob,
        name: "thumbnail",
        productId: product?.id || "",
      });

      if (!result) {
        toast.error("Error adding media.");
      }

      toast.success("Media added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save media.");
    } finally {
      mutate("fetchProducts");
      setLoadingSaveMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    setDeletingMedia(mediaId);
    try {
      const result = await deleteMedia({ id: mediaId });

      if (!result) {
        toast.error("Error deleting media.");
      }

      toast.success("Media deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete media.");
    } finally {
      mutate("fetchProducts");
      setDeletingMedia(null);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const productFormData = Object.fromEntries(formData) as {
      type: string;
      name: string;
      description: string;
      brand: string;
      handle: string;
      canChangeHandle: string;
      material: string;
      style: string;
    };

    let result: {
      data: Product | null;
      error: string | null;
    } | null = null;

    try {
      // Create a new product or update existing one.
      if (isNew) {
        result = await addNewProduct({
          productData: {
            type: productFormData.type,
            name: productFormData.name,
            description: productFormData.description,
            brand: productFormData.brand,
            handle: productFormData.handle,
            canChangeHandle: productFormData.canChangeHandle === "on" ? true : false,
            material: productFormData.material,
            style: productFormData.style,
          },
        });
      } else {
        result = await updateProductDetails({
          productData: {
            type: productFormData.type,
            name: productFormData.name,
            description: productFormData.description,
            brand: productFormData.brand,
            handle: productFormData.handle,
            canChangeHandle: productFormData.canChangeHandle === "on" ? true : false,
            material: productFormData.material,
            style: productFormData.style,
          },
          productId: product?.id || "",
        });
      }

      if (result.error !== null) {
        toast.error(result.error);
        return;
      }

      toast.success("Product updated successfully!");
      if (isNew) {
        router.push("/dashboard/products/" + result.data?.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product.");
    } finally {
      mutate("fetchProducts");
      setLoading(false);
    }
  };

  const handleSaveThumbnail = async (thumbnailId: string) => {
    setLoadingSetThumbnail(true);
    try {
      const result = await saveThumbnail({
        thumbnailId,
        productId: product?.id || "",
      });
      if (result.error !== null) {
        toast.error(result.error);
        return;
      }
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed save thumbnail.");
    } finally {
      mutate("fetchProducts");
      setLoadingSetThumbnail(false);
    }
  };

  const handleSaveFilter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSaveFilter(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const filterName = formData.get("name") as string;
    const filterId = formData.get("id") as string;

    try {
      const result = await saveFilter({
        filterData: {
          name: filterName,
          id: filterId,
        },
      });
      if (result.error !== null) {
        toast.error("Failed save filter.");
        return;
      }
      toast.success("Filter updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed save filter.");
    } finally {
      mutate("fetchFilters");
      setLoadingSaveFilter(false);
    }
  };

  const handleDeleteFilter = async (filterId: number) => {
    setLoadingDeleteFilter(true);

    try {
      const result = await deleteFilter(filterId);
      if (result.error !== null) {
        toast.error("Failed delete filter.");
        return;
      }
      toast.success("Filter deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete filter.");
    } finally {
      mutate("fetchFilters");
      setLoadingDeleteFilter(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSaveDetails}>
        <div className="flex flex-col gap-6">
          <RadioGroup
            defaultValue={product?.type || "knife"}
            name="type"
            required
            className="max-w-[400px] flex items-center gap-6 mb-6"
          >
            <Label htmlFor="typeKnife" className="flex-1">
              <Card
                className={product?.type === "knife" ? "w-full bg-gray-50" : "w-full"}
              >
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <div className="shrink">
                      <RadioGroupItem value="knife" id="typeKnife" />
                    </div>
                    <div className="text-base">
                      <CardTitle>Knife</CardTitle>
                      <CardDescription className="sr-only">Knife Product</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Label>

            <Label htmlFor="typeOther" className="flex-1">
              <Card
                className={product?.type === "other" ? "w-full bg-gray-50" : "w-full"}
              >
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <div className="shrink">
                      <RadioGroupItem value="other" id="typeOther" />
                    </div>
                    <div className="text-base">
                      <CardTitle>Other</CardTitle>
                      <CardDescription className="sr-only">
                        Other Type Product
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Label>
          </RadioGroup>

          <div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="name">Product Name</Label>
              <Input
                type="text"
                name="name"
                id="name"
                defaultValue={
                  isNew && product?.name
                    ? "COPY " + product?.name
                    : product?.name
                    ? product?.name
                    : ""
                }
                className="capitalize"
                required
                placeholder=""
              />
            </div>
          </div>

          <div>
            <div className="grid w-full gap-3">
              <Label htmlFor="description">Add More Information</Label>
              <Textarea
                placeholder=""
                name="description"
                id="description"
                defaultValue={product?.description || ""}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-y-6">
            <div className="grid w-full sm:w-1/2 gap-3 pr-3">
              <Label asChild>
                <p>Brand</p>
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  name="brand"
                  required
                  value={productBrand}
                  onValueChange={(value) => setProductBrand(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={loadingBrands ? "Loading brands..." : "Select Brand"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {brands &&
                      brands?.length > 0 &&
                      brands?.map((brand) => (
                        <SelectItem
                          key={brand.id}
                          value={brand.name}
                          className="capitalize"
                        >
                          {brand.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <div>
                  <ModelPopover model={"brand"} data={brands} />
                </div>
              </div>
            </div>

            <div className="grid w-full sm:w-1/2 gap-3 pr-3">
              <Label asChild>
                <p>Style</p>
              </Label>
              <Select defaultValue={product?.style || undefined} name="style" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="western">Western</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="No Style">No Style</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full sm:w-1/2 gap-3 pr-3">
              <Label asChild>
                <p>Material</p>
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  defaultValue={product?.material || undefined}
                  name="material"
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingMaterials ? "Loading materials..." : "Select Material"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {materials &&
                      materials.length > 0 &&
                      materials?.map((material) => (
                        <SelectItem key={material.id} value={material.name}>
                          {material.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div>
                  <ModelPopover model={"material"} data={materials} />
                </div>
              </div>
            </div>

            <div className="grid w-full sm:w-1/2 gap-3 pr-3">
              <Label asChild>
                <p>Handle</p>
              </Label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={product?.handle || undefined}
                    name="handle"
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          loadingHandles ? "Loading handles..." : "Select Handle"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {handles &&
                        handles.length > 0 &&
                        handles?.map((handle) => (
                          <SelectItem key={handle.id} value={handle.name}>
                            {handle.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <ModelPopover model={"handle"} data={handles} />
                  </div>
                </div>

                <Label htmlFor="canChangeHandle" className="flex items-center gap-3">
                  <Checkbox
                    name="canChangeHandle"
                    id="canChangeHandle"
                    defaultChecked={product?.canChangeHandle || false}
                  />
                  <span>Can change handle?</span>
                </Label>
              </div>
            </div>
          </div>
        </div>
        <div className="my-6">
          <Button type="submit" variant="default" disabled={loading}>
            {loading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : isNew ? (
              <PlusCircleIcon />
            ) : (
              <SaveIcon />
            )}
            {loading ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </form>
      {product && !isNew && (
        <div className="flex flex-col gap-6 mt-6">
          <div className="my-6">
            <Label asChild className="text-lg">
              <p>Upload Image</p>
            </Label>
            <div>
              {loadingSaveMedia ? (
                <Card className="w-full my-6">
                  <CardHeader className="flex items-center gap-3">
                    <div>
                      <LoaderCircleIcon className="animate-spin" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <CardTitle>Saving Your Image.</CardTitle>
                      <CardDescription>Please wait.</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ) : (
                <AdminImageUploader aspectRatio={[3, 5]} onSave={handleSaveMedia} />
              )}

              <div>
                <Label asChild className="text-lg mb-4">
                  <p>Current Images</p>
                </Label>
                <RadioGroup
                  className="w-full flex flex-wrap items-start gap-3"
                  asChild
                  defaultValue={product?.thumbnailId || undefined}
                  onValueChange={(value) => handleSaveThumbnail(value)}
                >
                  <div>
                    {product?.media?.map((media) => (
                      <div key={media.id} className="w-1/3 max-w-[200px]">
                        <div className="relative mb-2 h-[200px] sm:h-[300px] md:h-[340px] border rounded-lg overflow-hidden">
                          <Image
                            src={media.url || "/product-fallback.webp"}
                            alt={media.name || "Product Image"}
                            fill
                            className="object-cover"
                          />
                          <Button
                            onClick={() => handleDeleteMedia(media.id)}
                            className="absolute top-2 right-2 z-30 group cursor-pointer"
                            variant="secondary"
                            type="button"
                          >
                            {deletingMedia && deletingMedia === media.id ? (
                              <LoaderCircleIcon className="animate-spin" />
                            ) : (
                              <TrashIcon />
                            )}

                            <span className="hidden group-hover:block">Delete</span>
                          </Button>
                        </div>

                        <Label
                          htmlFor={media?.id}
                          className="flex items-center justify-center gap-3"
                        >
                          {loadingSetThumbnail ? (
                            <LoaderCircleIcon size={16} className="animate-spin" />
                          ) : (
                            <RadioGroupItem value={media.id} id={media.id} />
                          )}
                          <span>Cover</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <div>
            <Label asChild className="text-lg">
              <p>Product Sizes</p>
            </Label>
            <div>
              <ProductSizesTableForm sizes={product?.sizes} productType={product?.type} />
            </div>
          </div>

          <div>
            <Label asChild className="text-lg">
              <p>Custom Filters</p>
            </Label>

            <div>
              <div className="my-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" type="button">
                      <PlusIcon /> New Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start">
                    <form className="flex items-center gap-1" onSubmit={handleSaveFilter}>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Filter name..."
                        autoComplete="off"
                      />
                      <Button
                        variant="success"
                        type="submit"
                        disabled={loadingSaveFilter}
                      >
                        {loadingSaveFilter ? (
                          <LoaderCircleIcon className="animate-spin" />
                        ) : (
                          <SaveIcon />
                        )}
                      </Button>
                    </form>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-wrap items-start gap-3">
                {filters && filters.length > 0 ? (
                  filters.map((filter) => {
                    const isActive = product.filters.find((f) => f.name === filter.name);
                    return (
                      <Button
                        asChild
                        key={filter.id}
                        variant={isActive ? "default" : "outline"}
                        size="lg"
                      >
                        <div>
                          {filter.name}
                          <span className="px-1">
                            {isActive ? (
                              <button
                                className="pt-1"
                                onClick={() => removeFilter(filter.id)}
                              >
                                <MinusCircle color="red" />
                              </button>
                            ) : (
                              <button
                                className="pt-1"
                                onClick={() => addFilter(filter.id)}
                              >
                                <PlusCircle color="#aaaaaa" />
                              </button>
                            )}
                          </span>
                          <Popover>
                            <PopoverTrigger className="flex">
                              <span className="border-l pl-3">
                                <PencilIcon color="#aaaaaa" />
                              </span>
                            </PopoverTrigger>
                            <PopoverContent align="start">
                              <form
                                className="flex items-center gap-1"
                                onSubmit={handleSaveFilter}
                              >
                                <Input
                                  type="text"
                                  name="name"
                                  autoComplete="off"
                                  required
                                  defaultValue={filter?.name || ""}
                                />
                                <Input
                                  type="hidden"
                                  name="id"
                                  value={filter?.id || undefined}
                                  readOnly
                                />
                                <Button
                                  variant="success"
                                  type="submit"
                                  disabled={loadingSaveFilter}
                                >
                                  {loadingSaveFilter ? (
                                    <LoaderCircleIcon className="animate-spin" />
                                  ) : (
                                    <SaveIcon />
                                  )}
                                </Button>

                                <Button
                                  variant="destructive"
                                  type="button"
                                  disabled={loadingDeleteFilter}
                                  onClick={() => handleDeleteFilter(filter.id)}
                                >
                                  {loadingDeleteFilter ? (
                                    <LoaderCircleIcon className="animate-spin" />
                                  ) : (
                                    <TrashIcon />
                                  )}
                                </Button>
                              </form>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </Button>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    {loadingFilters ? (
                      <LoaderCircleIcon className="animate-spin" size={18} />
                    ) : (
                      <AlertCircleIcon size={18} />
                    )}
                    {loadingFilters ? "Loading filters..." : "No registered filters."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
