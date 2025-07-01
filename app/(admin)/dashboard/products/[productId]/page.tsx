import Link from "next/link";
import { toast } from "sonner";
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
import { AnnoyedIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import DeleteProductIcon from "@/components/dashboard/delete-product-icon";
import LoadingIndicator from "@/components/loading-indicator";

export default async function AdminSingleProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const getParams = await params;
  const productId = getParams?.productId;

  const result = await getProductById(productId);
  const product = result.data;

  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title={product?.name || "Product Details"} subtitle="Product Name" />

      <div className="flex tems-center gap-4 my-6">
        <div>
          <Button asChild variant="outline">
            <Link href={`/dashboard/products/add?starter=${product?.id}`}>
              <LoadingIndicator />
              <PlusCircleIcon /> Create a Copy
            </Link>
          </Button>
        </div>
        <div>{product?.id && <DeleteProductIcon productId={product?.id} />}</div>
      </div>

      <div className="my-6">
        {result.error && (
          <div className="max-w-[400px]">
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

        {!product && (
          <div className="max-w-[400px]">
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

        <AdminProductForm product={product} />
      </div>
    </div>
  );
}
