import Link from "next/link";
import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminProductTable from "@/components/dashboard/product-table";

import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import LoadingIndicator from "@/components/loading-indicator";

export default async function AdminProductsPage() {
  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title="商品一覧" subtitle="すべての商品を一か所で管理できます。" />

      <div className="flex tems-center justify-between my-6">
        <div>
          <Button asChild variant="default" size="lg">
            <Link href="/dashboard/products/add">
              <LoadingIndicator />
              <PlusCircleIcon /> 新商品
            </Link>
          </Button>
        </div>
      </div>

      <AdminProductTable />
    </div>
  );
}
