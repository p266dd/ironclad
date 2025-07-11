import Link from "next/link";
import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminUsersTable from "@/components/dashboard/user-table";

import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import LoadingIndicator from "@/components/loading-indicator";

export default async function AdminProductsPage() {
  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title="顧客一覧" subtitle="顧客を管理しましょう。" />

      <div className="flex tems-center justify-between my-6">
        <div>
          <Button asChild variant="default" size="lg">
            <Link href="/dashboard/users/add">
              <LoadingIndicator />
              <PlusCircleIcon /> 新規顧客
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <AdminUsersTable />
      </div>
    </div>
  );
}
