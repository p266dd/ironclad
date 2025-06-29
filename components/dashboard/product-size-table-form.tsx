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
        toast.error("Failed to save size.");
        return;
      }

      toast.success("Size saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save size.");
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
        toast.error("Failed to delete size.");
        return;
      }
      toast.success("Size deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete size.");
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
                  <Label htmlFor="sizeName">Size Name</Label>
                  {edit && (
                    <input type="hidden" name="id" value={editObject?.id} readOnly />
                  )}
                  <Input
                    type="text"
                    name="name"
                    id="sizeName"
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
                    <Label htmlFor="size">Size</Label>
                    <Input
                      type="number"
                      name="size"
                      id="size"
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
                    <Label htmlFor="dimension">Dimension</Label>
                    <Input
                      type="text"
                      name="dimension"
                      id="dimension"
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
                  <Label htmlFor="price">Price</Label>
                  <Input
                    type="string"
                    name="price"
                    id="price"
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
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    type="text"
                    name="stock"
                    id="stock"
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
              {edit ? "Save Changes" : "Add Now"}
            </Button>

            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="my-6">
          <Button variant="secondary" type="button" onClick={() => setShowForm(true)}>
            <PlusIcon /> New Size
          </Button>
        </div>
      )}

      {sizes && sizes.length > 0 ? (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setShowForm(true);
                              setEdit(true);
                              setEditObject(size);
                            }}
                          >
                            <PencilIcon /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteSize(size?.id)}>
                            <TrashIcon /> Delete
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
          No registered sizes.
        </div>
      )}
    </div>
  );
}
