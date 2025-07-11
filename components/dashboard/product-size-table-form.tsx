"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircleIcon,
  BoxIcon,
  EllipsisIcon,
  JapaneseYenIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  RulerIcon,
  TrashIcon,
} from "lucide-react";

// Types
import { Size } from "@/lib/generated/prisma";

import { saveSize } from "@/data/product/action";
import { deleteSize } from "@/data/size/action";

export default function ProductSizesTableForm({
  sizes,
  productType,
}: {
  sizes: Size[] | undefined;
  productType: string | undefined;
}) {
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editObject, setEditObject] = useState<Size | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const getParams = useParams();
  const productId = getParams.productId as string;

  const handleSaveNewSize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const dataObject = Object.fromEntries(formData) as {
      name: string;
      size?: string;
      dimension?: string;
      price: string;
      stock: string;
    };

    try {
      const addedSize = await saveSize({
        sizeData: {
          ...dataObject,
        },
        productId: productId || undefined,
      });
      if (!addedSize) {
        toast.error("サイズの保存に失敗しました。");
        return;
      }

      toast.success("サイズが正常に保存されました！");
    } catch (error) {
      console.error(error);
      toast.error("サイズの保存に失敗しました。");
    } finally {
      setLoading(false);
      setShowForm(false);
    }
  };

  const handleDeleteSize = async (sizeId: number) => {
    setLoadingDelete(true);
    setDeletingId(sizeId);

    try {
      const deletedSize = await deleteSize({
        sizeId: sizeId,
        productId: productId,
      });
      if (!deletedSize) {
        toast.error("サイズの削除に失敗しました。");
        return;
      }
      toast.success("サイズが正常に削除されました！");
    } catch (error) {
      console.error(error);
      toast.error("サイズの削除に失敗しました。");
    } finally {
      setLoadingDelete(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="my-4">
      {showForm ? (
        <form onSubmit={handleSaveNewSize} className="mb-8 p-3 bg-gray-50 rounded-lg">
          <div className="md:flex gap-2 mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 gap-y-4 mb-4 md:mb-0">
              <div className="flex-1 md:flex-1/2">
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="sizeName">サイズ名</Label>
                  {edit && (
                    <input type="hidden" name="id" value={editObject?.id} readOnly />
                  )}
                  <Input
                    type="text"
                    name="name"
                    id="sizeName"
                    required
                    className="bg-white"
                    autoComplete="off"
                    defaultValue={edit ? editObject?.name : ""}
                    placeholder=""
                  />
                </div>
              </div>
              {productType === "knife" && (
                <div className="flex-1 md:flex-1/2">
                  <div className="relative grid w-full items-center gap-3">
                    <Label htmlFor="size">サイズの長さ</Label>
                    <Input
                      type="number"
                      name="size"
                      id="size"
                      required
                      className="bg-white"
                      autoComplete="off"
                      defaultValue={edit ? editObject?.size || 0 : ""}
                      placeholder=""
                    />
                    <span className="absolute right-2 bottom-[10px]">
                      <RulerIcon size={18} color="#aaaaaa" />
                    </span>
                  </div>
                </div>
              )}
              {productType === "other" && (
                <div className="flex-1 md:flex-1/2">
                  <div className="relative grid w-full items-center gap-3">
                    <Label htmlFor="dimension">寸法</Label>
                    <Input
                      type="text"
                      name="dimension"
                      id="dimension"
                      required
                      className="bg-white"
                      autoComplete="off"
                      defaultValue={edit ? editObject?.dimension || "0mm" : ""}
                      placeholder=""
                    />
                    <span className="absolute right-2 bottom-[10px]">
                      <RulerIcon size={18} color="#aaaaaa" />
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1/2">
                <div className="relative grid w-full items-center gap-3">
                  <Label htmlFor="price">価格</Label>
                  <Input
                    type="string"
                    name="price"
                    id="price"
                    required
                    className="bg-white"
                    autoComplete="off"
                    defaultValue={edit ? editObject?.price?.toLocaleString("ja-JP") : ""}
                    placeholder=""
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const inputValue = e.target.value;

                      // Remove non-numeric characters.
                      const numericValue = inputValue.replace(/\D/g, "");

                      // Parse the numeric value as an integer.
                      const parsedValue = parseInt(numericValue);

                      // Format the number with commas (or your desired format).
                      if (!isNaN(parsedValue)) {
                        e.target.value = parsedValue.toLocaleString("ja-JP");
                      } else {
                        e.target.value = "";
                      }
                    }}
                  />
                  <span className="absolute right-2 bottom-[10px]">
                    <JapaneseYenIcon size={18} color="#aaaaaa" />
                  </span>
                </div>
              </div>
              <div className="flex-1/2">
                <div className="relative grid w-full items-center gap-3">
                  <Label htmlFor="stock">在庫</Label>
                  <Input
                    type="text"
                    name="stock"
                    id="stock"
                    required
                    className="bg-white"
                    autoComplete="off"
                    defaultValue={edit ? editObject?.stock : ""}
                    placeholder=""
                  />
                  <span className="absolute right-2 bottom-[10px]">
                    <BoxIcon size={18} color="#aaaaaa" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              variant={edit ? "success" : "default"}
              disabled={loading}
            >
              {loading ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon />}
              {edit ? "変更を保存 " : "今すぐ追加"}
            </Button>

            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              キャンセル
            </Button>
          </div>
        </form>
      ) : (
        <div className="my-6">
          <Button variant="secondary" type="button" onClick={() => setShowForm(true)}>
            <PlusIcon /> 新しい
          </Button>
        </div>
      )}

      {sizes && sizes.length > 0 ? (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>サイズ名</TableHead>
                <TableHead>価格</TableHead>
                <TableHead>在庫</TableHead>
                <TableHead className="text-right w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.map((size) => (
                <TableRow key={size?.id}>
                  <TableCell>
                    <h5 className="font-medium text-lg">{size?.name}</h5>
                    {productType ? (
                      productType === "knife" ? (
                        <p className="text-sm text-slate-500">{size?.size} mm</p>
                      ) : productType === "other" ? (
                        <p className="text-sm text-slate-500">{size?.dimension}</p>
                      ) : null
                    ) : null}
                  </TableCell>
                  <TableCell>¥ {size?.price?.toLocaleString("ja-JP")}</TableCell>
                  <TableCell>{size?.stock}</TableCell>
                  <TableCell className="text-right">
                    {loadingDelete && deletingId === size?.id ? (
                      <LoaderCircleIcon className="animate-spin" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setShowForm(true);
                              setEdit(true);
                              setEditObject(size);
                            }}
                          >
                            <PencilIcon /> 顧客
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteSize(size?.id)}>
                            <TrashIcon /> 注文
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <AlertCircleIcon size={18} />
          登録されたサイズはありません。
        </div>
      )}
    </div>
  );
}
