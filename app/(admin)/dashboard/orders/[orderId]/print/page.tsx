"use client";

import Image from "next/image";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import BackButton from "@/components/back-button";
import styles from "./styles.module.css";

import { getOrderById, completeOrder } from "@/data/order/action";

// Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AnnoyedIcon,
  LoaderCircleIcon,
  CheckCircleIcon,
  PrinterIcon,
  RefreshCcwIcon,
} from "lucide-react";

import Logo from "@/assets/logo-icon.png";

//Types
import { TProductDetails } from "@/lib/types";

const companyDetails = {
  name: "Ironclad Knives",
  address: "〒 720-2122 Hiroshima, Fukuyama",
  email: "staff@ironcladknives.com",
  website: "https://ironclad.co.jp/",
};

export default function PrintOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();

  const handleComplete = () => {
    completeOrder({ orderId, status: "completed" });
    router.push("/dashboard/orders/" + orderId);
  };

  const { data, error, isLoading } = useSWR(orderId, getOrderById);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-4 h-screen text-slate-600">
        <LoaderCircleIcon className="animate-spin" /> Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-600">
        <div className="max-w-[400px] mx-6">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AnnoyedIcon />
                エラー
              </CardTitle>
              <CardDescription>
                この商品の読み込み中にエラーが発生しました。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button onClick={() => router.refresh()} variant="default">
                  <RefreshCcwIcon /> Retry
                </Button>
                <Button onClick={() => router.back()} variant="secondary">
                  戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const product = data?.data;

  if (!product) {
    return null;
  }

  return (
    <div className={styles.invoiceWrapperForPrint}>
      <div className={styles.printButtonContainer}>
        <BackButton />

        <Button variant="default" onClick={() => window.print()}>
          <PrinterIcon />
          印刷する
        </Button>

        {!product.isCompleted && (
          <Button variant="default" onClick={handleComplete}>
            <CheckCircleIcon />
            注文を完了
          </Button>
        )}
      </div>
      <div className={styles.a4Page}>
        <header className={styles.invoiceHeader}>
          <div className={styles.companyDetails}>
            <Image src={Logo} alt="Ironclad Logo" className="w-12" />

            <h1>{companyDetails.name}</h1>
            <p>{companyDetails.address}</p>
            <p>Email: {companyDetails.email}</p>
            {companyDetails.website && <p>Website: {companyDetails.website}</p>}
          </div>
          <div className={styles.invoiceInfo}>
            <h2>注文概要</h2>
            <p>
              <strong>コード:</strong> {product.code.split("-")[1]}
            </p>
            <p>
              <strong>日付:</strong> {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>
        </header>

        <section className={styles.customerInfo}>
          <div className={styles.billingAddress}>
            <h3>注文者:</h3>
            <p>
              <strong>{product.client.businessName}</strong>
              <br />
              {product.client.name}
            </p>
          </div>
        </section>

        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th style={{ width: "5%" }}>#</th>
              <th style={{ width: "65%" }}>商品</th>
              <th style={{ width: "15%" }}>ブランド</th>
              <th style={{ width: "15%" }}>ハンドル</th>
            </tr>
          </thead>
          <tbody>
            {product.orderProduct.map((item, index) => {
              const productDetails = item.details as TProductDetails[];
              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    {item.product?.name} <br />
                    <hr className="my-2" />
                    <div className="mb-1">
                      <h5 className="font-semibold">サイズ</h5>
                    </div>
                    <div className="flex flex-col mb-4">
                      {productDetails &&
                        productDetails.map((detail, index) => {
                          if (!detail.id || !detail.quantity || detail.quantity === 0)
                            return null;
                          const sizeObject = item.product?.sizes.find(
                            (p) => p.id === Number(detail.id)
                          );

                          return (
                            <div
                              key={index}
                              className="flex gap-9 py-1 px-2 even:bg-gray-100 border-b border-gray-200"
                            >
                              <div>{sizeObject && sizeObject.name}</div>
                              <div>
                                {sizeObject &&
                                  (sizeObject.size !== 0
                                    ? sizeObject.size + " mm"
                                    : sizeObject.dimension !== "0mm"
                                    ? sizeObject.dimension
                                    : "No Size")}
                              </div>
                              <div>Ordered: {detail.quantity}</div>
                            </div>
                          );
                        })}
                    </div>
                    <div>
                      <p>
                        <strong className="font-semibold mr-3">Special Request</strong>
                        {item.request || "No special request."}
                      </p>
                    </div>
                  </td>
                  <td>{item.brand}</td>
                  <td>{item.handle}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* <div className={styles.totals}>
          <table className={styles.totalsTable}>
            <tbody>
              <tr>
                <td className={styles.label}>Subtotal:</td>
                <td className={styles.amount}>{formatCurrency(subtotal)}</td>
              </tr>
              {discountAmount > 0 && (
                <tr>
                  <td className={styles.label}>
                    Discount ({order.discount.code || ""}):
                  </td>
                  <td className={styles.amount}>
                    -{formatCurrency(discountAmount)}
                  </td>
                </tr>
              )}
              {shippingCost > 0 && (
                <tr>
                  <td className={styles.label}>
                    Shipping ({order.shipping.method || ""}):
                  </td>
                  <td className={styles.amount}>
                    {formatCurrency(shippingCost)}
                  </td>
                </tr>
              )}
              <tr>
                <td className={styles.label}>
                  Tax ({((order.taxRate || 0) * 100).toFixed(0)}%):
                </td>
                <td className={styles.amount}>{formatCurrency(taxAmount)}</td>
              </tr>
              <tr className={styles.grandTotal}>
                <td className={styles.label}>Grand Total:</td>
                <td className={styles.amount}>{formatCurrency(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div> */}

        {/* {(order.notes || order.payment) && (
          <footer className={styles.notesAndPayment}>
            {order.payment && (
              <div>
                <h4>Payment Details:</h4>
                <p>
                  Method: {order.payment.method} | Status:{" "}
                  {order.payment.status}
                </p>
                {order.payment.transactionId && (
                  <p>Transaction ID: {order.payment.transactionId}</p>
                )}
              </div>
            )}
            {order.notes && (
              <div style={{ marginTop: order.payment ? "15px" : "0" }}>
                <h4>Notes:</h4>
                <p>{order.notes}</p>
              </div>
            )}
          </footer>
        )} */}

        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            fontSize: "8pt",
            color: "#777",
            borderTop: "1px solid #eee",
            paddingTop: "10px",
          }}
        >
          ご利用いただきありがとうございます!ご不明な点がございましたら、{" "}
          {companyDetails.email}
          までお気軽にお問い合わせください。
        </div>
      </div>
    </div>
  );
}
