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
    <div className="max-w-[400px]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <StarIcon />
            No product found!
          </CardTitle>
          <CardDescription>There are no products to display.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Let&apos;s add some products to your favorites.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
