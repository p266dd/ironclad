"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarIcon } from "lucide-react";

export default function EmptyFavorites() {
  return (
    <div className="max-w-[400px] mx-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <StarIcon />
            No product found!
          </CardTitle>
          <CardDescription>There are no products to display.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Let's add some products to your favorites.</p>
        </CardContent>
      </Card>
    </div>
  );
}
