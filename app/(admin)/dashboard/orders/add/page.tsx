import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminOrderForm from "@/components/dashboard/admin-order-form";

export default async function AdminNewOrderPage() {
  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title="新規注文" subtitle="顧客の新規注文を作成してください。" />

      <div>
        <AdminOrderForm />
      </div>
    </div>
  );
}
