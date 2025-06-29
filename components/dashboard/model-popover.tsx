"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { mutate } from "swr";

// Shadcn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EllipsisIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
} from "lucide-react";

import { updateBrand, deleteBrand, addBrand } from "@/data/brand/action";
import { updateHandle, deleteHandle, addHandle } from "@/data/handles/action";
import { updateMaterial, deleteMaterial, addMaterial } from "@/data/material/action";

export default function ModelPopover({
  model,
  data,
}: {
  model: string;
  data: { id: number; name: string }[] | null | undefined;
}) {
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [open, setOpen] = useState(false);

  const params = useParams();
  const productId = params.productId as string;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setLoadingSave(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("name") as string;
    const oldName = formData.get("oldName") as string;
    const model = formData.get("model") as string;
    const id = formData.get("id") as string;

    let result: string | null = null;

    switch (model) {
      case "brand":
        if (id !== null && id !== "") {
          result = await updateBrand({ id, name, oldName, productId });
          mutate("fetchBrands");
          toast.success("Brand updated successfully!");
        } else {
          result = await addBrand({ name, productId });
          mutate("fetchBrands");
          toast.success("Brand added successfully!");
        }
        setOpen(false);
        break;

      case "handle":
        if (id !== null && id !== "") {
          result = await updateHandle({ id, name, oldName, productId });
          mutate("fetchHandles");
          toast.success("Handle updated successfully!");
        } else {
          result = await addHandle({ name, productId });
          mutate("fetchHandles");
          toast.success("Handle added successfully!");
        }
        setOpen(false);
        break;

      case "material":
        if (id !== null && id !== "") {
          result = await updateMaterial({ id, name, oldName, productId });
          mutate("fetchMaterials");
          toast.success("Material updated successfully!");
        } else {
          result = await addMaterial({ name, productId });
          mutate("fetchMaterials");
          toast.success("Material added successfully!");
        }
        setOpen(false);
        break;

      default:
        break;
    }

    if (result === null) {
      toast.error("Something went wrong!");
    }
    setLoadingSave(false);
  };

  const handleDelete = async ({ model, id }: { model: string; id: number }) => {
    setLoadingDelete(true);

    let result: string | null = null;

    switch (model) {
      case "brand":
        result = await deleteBrand({ id, productId });
        if (typeof result === "string") mutate("fetchBrands");
        setOpen(false);
        toast.success("Brand deleted successfully!");
        break;

      case "handle":
        result = await deleteHandle({ id, productId });
        if (typeof result === "string") mutate("fetchHandles");
        setOpen(false);
        toast.success("Handle deleted successfully!");
        break;
      case "material":
        result = await deleteMaterial({ id, productId });
        if (typeof result === "string") mutate("fetchMaterials");
        setOpen(false);
        toast.success("Material deleted successfully!");
        break;

      default:
        break;
    }

    setLoadingDelete(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button asChild variant="secondary">
          <span>
            <EllipsisIcon />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="capitalize">Manage {model}s</DialogTitle>
          <DialogDescription>You can add, edit or delete {model}s.</DialogDescription>
        </DialogHeader>
        <div>
          <div className="mb-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="default" size="sm" type="button">
                  <PlusIcon /> Add New
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <form className="flex items-center gap-1" onSubmit={handleSave}>
                  <Input type="text" name="name" autoComplete="off" required />
                  <Input type="hidden" name="model" value={model} readOnly />
                  <Button variant="success" type="submit" disabled={loadingSave}>
                    {loadingSave ? (
                      <LoaderCircleIcon className="animate-spin" />
                    ) : (
                      <SaveIcon />
                    )}
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            {data &&
              data.length > 0 &&
              data.map((m) => (
                <div
                  className="flex items-center justify-between gap-2 mb-2 border-b pb-2"
                  key={m.id}
                >
                  <div className="text-sm">{m.name}</div>
                  <div>
                    <Popover>
                      <PopoverTrigger>
                        <Button asChild variant="secondary">
                          <span>
                            <PencilIcon />
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end">
                        <form className="flex items-center gap-1" onSubmit={handleSave}>
                          <Input
                            type="text"
                            name="name"
                            autoComplete="off"
                            defaultValue={m.name}
                          />
                          <Input type="hidden" name="model" value={model} readOnly />
                          <Input type="hidden" name="oldName" value={m.name} readOnly />
                          <Input type="hidden" name="id" value={m.id} readOnly />
                          <Button variant="success" type="submit" disabled={loadingSave}>
                            {loadingSave ? (
                              <LoaderCircleIcon className="animate-spin" />
                            ) : (
                              <SaveIcon />
                            )}
                          </Button>

                          <Button
                            variant="destructive"
                            type="button"
                            disabled={loadingDelete}
                            onClick={async () => await handleDelete({ model, id: m.id })}
                          >
                            {loadingDelete ? (
                              <LoaderCircleIcon className="animate-spin" />
                            ) : (
                              <TrashIcon />
                            )}
                          </Button>
                        </form>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
