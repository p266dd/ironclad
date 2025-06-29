import Link from "next/link";
import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminUsersTable from "@/components/dashboard/user-table";

import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";

export default async function AdminProductsPage() {
  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title="Client List" subtitle="Manage your clients." />

      <div className="flex tems-center justify-between my-6">
        <div>
          <Button asChild variant="default" size="lg">
            <Link href="/dashboard/users/add">
              <PlusCircleIcon /> New Client
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
