import Link from "next/link";
import BackButton from "@/components/back-button";
import PageTitle from "@/components/page-title";
import AdminUserForm from "@/components/dashboard/admin-user-form";

// Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnnoyedIcon } from "lucide-react";

import { getUserById } from "@/data/user/actions";

export default async function AdminSingleUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const getParams = await params;
  const userId = getParams?.userId;

  const result = await getUserById(userId);
  const user = result.data;

  return (
    <div>
      <div className="my-6">
        <BackButton />
      </div>

      <PageTitle title={user?.name || "氏名"} subtitle="このユーザーを編集しています。" />

      {result.error && (
        <div className="max-w-[400px]">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AnnoyedIcon />
                エラー
              </CardTitle>
              <CardDescription>
                このユーザーの読み込み中にエラーが発生しました。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button asChild variant="default">
                  <Link href="/dashboard/users">戻る</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!user ? (
        <div className="max-w-[400px]">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AnnoyedIcon />
                ユーザーが見つかりません。
              </CardTitle>
              <CardDescription>お探しのユーザーが見つかりませんでした。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button asChild variant="default">
                  <Link href="/dashboard/users">戻る</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="my-6">
          <AdminUserForm user={user} />
        </div>
      )}
    </div>
  );
}
