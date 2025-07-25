import { redirect } from "next/navigation";
import { format } from "date-fns";
import PageTitle from "@/components/page-title";
import { getOwnOrderById } from "@/data/order/action";
import OrderSizeTable from "./order-size-table";

// Shadcn
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBagIcon } from "lucide-react";

export default async function ClientSingleOrder({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ success: string } | null>;
}) {
  const getParams = await params;
  const orderId = getParams.orderId;

  const getSearchParams = await searchParams;
  const success = getSearchParams?.success;

  const result = await getOwnOrderById(orderId);

  const order = result.data;
  const error = result.error;

  if (error !== null || order === null) {
    redirect("/account/orders");
  }

  return (
    <div className="pt-16 pb-44 px-6 sm:pt-4 md:pb-12 lg:px-12">
      <PageTitle
        title="Order Details"
        subtitle={format(order.createdAt, "EEEE, MMMM do yyyy")}
      />

      {success && (
        <div className="max-w-[400px] my-4 mb-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ShoppingBagIcon color="green" size={30} />
                We have successfully received your order.
              </CardTitle>
              <CardDescription className="sr-only">
                We&apos;ve received your order.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="max-w-[800px] mb-8">
        <div className="flex flex-col md:flex-row gap-4 gap-x-12 mb-8">
          <div>
            <h5 className="text-slate-500">Order Reference</h5>
            <h3 className="font-medium text-2xl">{order.code.split("-")[1]}</h3>
          </div>
          <div>
            <h5 className="text-slate-500">Ordered By</h5>
            <h3 className="font-medium text-2xl">{order.client.name}</h3>
          </div>
        </div>

        <div>
          <h4 className="text-slate-500 mb-4">List Of Products</h4>
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
