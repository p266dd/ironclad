import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCcwIcon } from "lucide-react";

export default function EmptyResults() {
  return (
    <div className="max-w-[400px] md:pt-8 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <RefreshCcwIcon />
            No product found!
          </CardTitle>
          <CardDescription>There are no products to display.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Try modifying your search filters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
