import prisma from "@/lib/prisma";

import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminOrderForm from "@/components/dashboard/admin-order-form";

export default async function AdminEditOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      orderProduct: true,
    },
  });

  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title="Edit Order" subtitle="Edit order subtitle。" />

      <div>
        <AdminOrderForm originalOrder={order} edit />
      </div>
    </div>
  );
}
