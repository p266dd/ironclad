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
  updateProductStatus,
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
import { Switch } from "../ui/switch";

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
        toast.error("メディアの追加中にエラーが発生しました。");
      }

      toast.success("メディアが正常に追加されました！");
    } catch (error) {
      console.error(error);
      toast.error("メディアの削除中にエラーが発生しました。");
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
        toast.error("メディアの削除中にエラーが発生しました。");
      }

      toast.success("メディアが正常に削除されました！");
    } catch (error) {
      console.error(error);
      toast.error("メディアの削除中にエラーが発生しました。");
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

      toast.success("商品が正常に更新されました！");
      if (isNew) {
        router.push("/dashboard/products/" + result.data?.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("商品の更新に失敗しました。");
    } finally {
      mutate("fetchProducts");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: boolean) => {
    setLoading(true);

    let result: {
      data: Product | null;
      error: string | null;
    } | null = null;

    try {
      result = await updateProductStatus({
        newStatus: status,
        productId: product?.id || "",
      });

      if (result.error !== null) {
        toast.error(result.error);
        return;
      }

      toast.success("商品が正常に更新されました！");
    } catch (error) {
      console.error(error);
      toast.error("商品の更新に失敗しました。");
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
      toast.success("商品が正常に更新されました！");
    } catch (error) {
      console.error(error);
      toast.error("サムネイルの保存に失敗しました。");
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
        toast.error("フィルターの保存に失敗しました。");
        return;
      }
      toast.success("フィルターに更新されました！");
    } catch (error) {
      console.error(error);
      toast.error("フィルターの保存に失敗しました。");
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
        toast.error("フィルターの削除に失敗しました。");
        return;
      }
      toast.success("フィルターに削除されました！");
    } catch (error) {
      console.error(error);
      toast.error("フィルターの削除に失敗しました。");
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
                      <CardTitle>包丁</CardTitle>
                      <CardDescription className="sr-only">包丁</CardDescription>
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
                      <CardTitle>その他</CardTitle>
                      <CardDescription className="sr-only">その他</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Label>
          </RadioGroup>

          <div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="name">商品名</Label>
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
              <Label htmlFor="description">詳細情報を追加してください。</Label>
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
                <p>ブランド</p>
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
                      placeholder={
                        loadingBrands ? "ブランドを読み込み中..." : "ブランドを選択"
                      }
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
                <p>スタイル</p>
              </Label>
              <Select defaultValue={product?.style || undefined} name="style" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="western">Western</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="No Style">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full sm:w-1/2 gap-3 pr-3">
              <Label asChild>
                <p>素材</p>
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
                        loadingMaterials ? "素材を読み込み中..." : "素材を選択"
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
                <p>ハンドル</p>
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
                          loadingHandles ? "ハンドルを読み込み中..." : "ハンドルを選択"
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
                  <span>ハンドルの変更は可能ですか？</span>
                </Label>
              </div>
            </div>
          </div>
        </div>
        <div className="my-6 flex items-center gap-4">
          <Button type="submit" variant="default" size="lg" disabled={loading}>
            {loading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : isNew ? (
              <PlusCircleIcon />
            ) : (
              <SaveIcon />
            )}
            {loading ? "保存中..." : isNew ? "商品を作成" : "変更を保存"}
          </Button>
          {!isNew && (
            <Label
              htmlFor="isProductActive"
              className="flex items-center gap-3 border rounded-md px-3 py-2"
            >
              <span className="text-gray-500">Active</span>
              <Switch
                defaultChecked={product ? product?.active : true}
                name="isProductActive"
                id="isProductActive"
                onCheckedChange={(status) => handleStatusUpdate(status)}
              />
            </Label>
          )}
        </div>
      </form>
      {product && !isNew && (
        <div className="flex flex-col gap-6 mt-6">
          <div className="my-6">
            <Label asChild className="text-lg">
              <p>画像をアップロード</p>
            </Label>
            <div>
              {loadingSaveMedia ? (
                <Card className="w-full my-6">
                  <CardHeader className="flex items-center gap-3">
                    <div>
                      <LoaderCircleIcon className="animate-spin" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <CardTitle>画像を保存中です。</CardTitle>
                      <CardDescription>しばらくお待ちください。</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ) : (
                <AdminImageUploader aspectRatio={[3, 5]} onSave={handleSaveMedia} />
              )}

              <div>
                <Label asChild className="text-lg mb-4">
                  <p>現在の画像</p>
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

                            <span className="hidden group-hover:block">削除</span>
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
              <p>商品サイズ</p>
            </Label>
            <div>
              <ProductSizesTableForm sizes={product?.sizes} productType={product?.type} />
            </div>
          </div>

          <div>
            <Label asChild className="text-lg">
              <p>カスタムフィルター</p>
            </Label>

            <div>
              <div className="my-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" type="button">
                      <PlusIcon /> 新しいフィルター
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start">
                    <form className="flex items-center gap-1" onSubmit={handleSaveFilter}>
                      <Input
                        type="text"
                        name="name"
                        placeholder="フィルター..."
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
                    {loadingFilters
                      ? "フィルターを読み込み中... "
                      : "登録されたフィルターはありません。"}
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
