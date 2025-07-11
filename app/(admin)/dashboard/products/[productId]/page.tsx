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
import { AnnoyedIcon, PlusCircleIcon } from "lucide-react";
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

      <PageTitle title={product?.name || "商品"} subtitle="商品名" />

      <div className="flex tems-center gap-4 my-6">
        <div>
          {product !== null && (
            <Button asChild variant="outline">
              <Link href={`/dashboard/products/add?starter=${product?.id}`}>
                <LoadingIndicator />
                <PlusCircleIcon /> コピーを作成
              </Link>
            </Button>
          )}
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
                  エラー
                </CardTitle>
                <CardDescription>読み込みに失敗しました</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Button asChild variant="default">
                    <Link href="/dashboard/products">戻る</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!product ? (
          <div className="max-w-[400px]">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AnnoyedIcon />
                  商品が見つかりません
                </CardTitle>
                <CardDescription>お探しの商品が見つかりませんでした。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Button asChild variant="default">
                    <Link href="/dashboard/products">戻る</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <AdminProductForm product={product} />
        )}
      </div>
    </div>
  );
}
