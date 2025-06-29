import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminOrderForm from "@/components/dashboard/admin-order-form";

export default async function AdminNewOrderPage() {
  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title="Create Order" subtitle="Create a new order for a client." />

      <div>
        <AdminOrderForm />
      </div>
    </div>
  );
}
