import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminUserForm from "@/components/dashboard/admin-user-form";

export default async function AdminAddUserPage() {
  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title="新規顧客" subtitle="" />

      <div className="my-6">
        <AdminUserForm user={null} isNew={true} />
      </div>
    </div>
  );
}
