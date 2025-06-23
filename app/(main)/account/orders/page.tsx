import OrdersTable from "@/components/orders-table";
import PageTitle from "@/components/page-title";

export default async function ClientOrdersPage() {
  return (
    <div className="pt-16 pb-44 px-6 sm:pt-4 md:pb-12 lg:px-12">
      <PageTitle title="My Orders" subtitle="My complete order history." />

      <div className="max-w-[800px] mb-8">
        <OrdersTable />
      </div>
    </div>
  );
}
