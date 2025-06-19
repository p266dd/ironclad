"use client";

import { useState } from "react";
import SearchForm from "@/components/search/form";

// Shadcn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MousePointerClickIcon } from "lucide-react";

// Types
import { Brand, Material } from "@/lib/generated/prisma";

export default function SearchDialog({
  availableBrands,
  availableMaterials,
}: {
  availableBrands: Brand[] | null;
  availableMaterials: Material[] | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full cursor-pointer">
        <div className="relative px-6 py-3 bg-primary text-primary-foreground rounded-lg">
          <span className="text-lg">Modify Search</span>
          <span className="absolute bottom-1 right-1 opacity-50">
            <MousePointerClickIcon />
          </span>
        </div>
      </DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Modify search parameters.</DialogTitle>
          <DialogDescription>
            Use this form to update the terms used in the search.
          </DialogDescription>
        </DialogHeader>
        <div>
          <SearchForm
            availableBrands={availableBrands}
            availableMaterials={availableMaterials}
            remoteClose={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
