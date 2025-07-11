import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";

import { getOrderById } from "@/data/order/action";
import { Separator } from "@/components/ui/separator";
import OrderSizeTable from "@/app/(main)/account/orders/[orderId]/order-size-table";
import { Button } from "@/components/ui/button";
import { PenIcon, PrinterIcon } from "lucide-react";

export default async function AdminSingleOrder({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const getParams = await params;
  const orderId = getParams.orderId;

  const result = await getOrderById(orderId);

  const order = result.data;
  const error = result.error;

  if (error !== null || order === null) {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle
        title="注文詳細"
        subtitle={
          "受取日時： " + format(order.createdAt, "EEEE, MMMM do yyyy", { locale: ja })
        }
      />

      <div className="mt-4 mb-8 flex items-center gap-4">
        <Button asChild variant="default">
          <Link href={"/dashboard/orders/" + order.id + "/print"}>
            <PrinterIcon />
            注文を印刷
          </Link>
        </Button>

        <Button asChild variant="outline">
          <Link href={"/dashboard/orders/" + order.id + "/edit"}>
            <PenIcon />
            注文を編集
          </Link>
        </Button>
      </div>

      <div className="max-w-[800px] mb-8">
        <div className="flex flex-col md:flex-row gap-4 gap-x-12 mb-8">
          <div>
            <h5 className="text-slate-500">注文番号</h5>
            <h3 className="font-medium text-2xl">{order.code.split("-")[1]}</h3>
          </div>
          <div>
            <h5 className="text-slate-500">顧客</h5>
            <h3 className="font-medium text-2xl">{order.client.businessName}</h3>
          </div>
          <div>
            <h5 className="text-slate-500">注文者</h5>
            <h3 className="font-medium text-2xl">{order.client.name}</h3>
          </div>
          {order.completedAt !== null && (
            <div>
              <h5 className="text-slate-500">完了日時</h5>
              <h3 className="font-medium text-2xl">
                {order?.completedAt
                  ? format(order.completedAt, "MMMM do yyyy", { locale: ja })
                  : null}
              </h3>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-slate-500 mb-4">商品一覧</h4>
          <Separator className="my-3" />
          {order.orderProduct.map((product) => {
            if (!product || !product.product) {
              return null;
            }
            const productDetails = product.details as {
              id: number;
              quantity: number;
              priceAtOrder: number;
              nameAtOrder: string;
            }[];
            return (
              <div key={product.product?.id} className="flex flex-col gap-4 mb-8">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-2xl capitalize">
                    {product.product?.name}
                  </h3>
                  <div className="text-slate-800 leading-relaxed">
                    <p>
                      <strong>Brand:</strong> {product.product?.brand}
                    </p>
                    {product?.brand !== product.product?.brand && (
                      <p>
                        <strong>Engraving:</strong> {product?.brand}
                      </p>
                    )}
                    {product?.handle !== null && product?.handle !== undefined && (
                      <p>
                        <strong>Handle:</strong> {product?.handle}
                      </p>
                    )}
                    {product.product?.material !== null &&
                      product.product?.material !== undefined && (
                        <p>
                          <strong>Material:</strong> {product.product?.material}
                        </p>
                      )}
                    <p>
                      <strong>Request:</strong>{" "}
                      {product.request !== null && product.request !== ""
                        ? product.request
                        : "No special request."}
                    </p>
                  </div>
                  {productDetails !== null && (
                    <OrderSizeTable
                      key={product.product?.id + "sizeTable"}
                      sizes={productDetails}
                      productSizes={product.product?.sizes}
                    />
                  )}
                </div>
                <Separator />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
