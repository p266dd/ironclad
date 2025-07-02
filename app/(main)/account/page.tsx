import PageTitle from "@/components/page-title";
import AccountForm from "@/components/account-form";

import { getOwnUserProfile } from "@/data/user/actions";
import { AlertCircleIcon } from "lucide-react";

export default async function AccountPage() {
  const user = await getOwnUserProfile();

  return (
    <div className="pt-16 pb-44 px-6 sm:pt-4 md:pb-12 lg:px-12">
      <PageTitle title="Account" subtitle="Manage your account information." />
      <div className="max-w-[800px] mb-8">
        {user === null ? (
          <div>
            <AlertCircleIcon className="mb-3" /> User account was not found!
          </div>
        ) : (
          <AccountForm currentInfo={user} />
        )}
      </div>
    </div>
  );
}
