import AdminNewOrdersTable from "@/components/dashboard/new-orders-table";
import AdminOrdersTable from "@/components/dashboard/orders-table";
import PageTitle from "@/components/page-title";
import { ListIcon, LucideShoppingBag } from "lucide-react";

export default async function DashboardPage() {
  return (
    <div>
      <PageTitle title="ダッシュボード" />

      <div className="mb-16">
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-8">
          <LucideShoppingBag />
          新規注文
        </h2>
        <div>
          <AdminNewOrdersTable />
        </div>
      </div>

      <div>
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-8">
          <ListIcon />
          注文履歴
        </h2>
        <div>
          <AdminOrdersTable />
        </div>
      </div>
    </div>
  );
}
