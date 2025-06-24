import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCartIcon } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="max-w-[400px] mx-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShoppingCartIcon />
            No product found!
          </CardTitle>
          <CardDescription>There are no products to display.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Let&apos;s add some products to your cart.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
