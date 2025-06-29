import Link from "next/link";
import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminProductTable from "@/components/dashboard/product-table";

import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";

export default async function AdminProductsPage() {
  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title="Product List" subtitle="Manage all your products in one place." />

      <div className="flex tems-center justify-between my-6">
        <div>
          <Button asChild variant="default" size="lg">
            <Link href="/dashboard/products/add">
              <PlusCircleIcon /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      <AdminProductTable />
    </div>
  );
}
