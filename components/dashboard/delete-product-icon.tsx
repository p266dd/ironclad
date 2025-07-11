"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircleIcon, TrashIcon } from "lucide-react";
import { Button } from "../ui/button";

import { deleteProduct } from "@/data/product/action";

export default function DeleteProductIcon({ productId }: { productId: string }) {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const router = useRouter();
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        setLoadingDelete(true);
        await deleteProduct(productId);
        toast.success("Product deleted successfully");
        router.push("/dashboard/products");
        setLoadingDelete(false);
      }}
    >
      {loadingDelete ? (
        <LoaderCircleIcon className="animate-spin" />
      ) : (
        <TrashIcon color="red" />
      )}{" "}
      商品を削除
    </Button>
  );
}
