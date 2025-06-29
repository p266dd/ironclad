import Link from "next/link";
import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminProductForm from "@/components/dashboard/admin-product-form";

import { getProductById } from "@/data/product/action";

// Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnnoyedIcon } from "lucide-react";

export default async function AdminAddProductPage({
  searchParams,
}: {
  searchParams: Promise<{ starter: string }>;
}) {
  const getParams = await searchParams;
  const starter = getParams?.starter;

  const result = await getProductById(starter || "");
  const product = result.data;

  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title="Add New Product" subtitle="" />

      <div className="my-6">
        {starter && result.error && (
          <div className="max-w-[400px] mb-8">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AnnoyedIcon />
                  Error
                </CardTitle>
                <CardDescription>
                  There was an error while loading this product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Button asChild variant="default">
                    <Link href="/dashboard/products">Go Back</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {starter && !product && (
          <div className="max-w-[400px] mb-8">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AnnoyedIcon />
                  Product Not Found
                </CardTitle>
                <CardDescription>
                  We could not find the product you are looking for.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Button asChild variant="default">
                    <Link href="/dashboard/products">Go Back</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <AdminProductForm product={product} isNew={true} />
      </div>
    </div>
  );
}
