"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { generateRandomString } from "@/lib/generate-random-string";
import {
  updateUser,
  addNewUser,
  verifyBusinessCode,
  updateUserStatus,
} from "@/data/user/actions";

// Shadcn
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  KeyIcon,
  LoaderCircleIcon,
  SaveIcon,
  User2Icon,
  UserCheck2Icon,
} from "lucide-react";

// Types
import { User } from "@/lib/generated/prisma";
import { Switch } from "../ui/switch";

export default function AdminUserForm({
  user,
  isNew,
}: {
  user: Partial<User> | null;
  isNew?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );
  const [generatedBusinessCode, setGeneratedBusinessCode] = useState<
    string | null
  >(null);

  const router = useRouter();

  const generatePassword = () => {
    const generatedPassword = generateRandomString("password");
    setGeneratedPassword(generatedPassword);
    toast("パスワードが生成されました。");
  };

  const generateBusinessCode = async () => {
    const generatedBusinessCode = generateRandomString("businessCode");
    if (!generatedBusinessCode) return;
    const isValid = validateBusinessCode(generatedBusinessCode);
    if (!isValid) return;

    setGeneratedBusinessCode(generatedBusinessCode);
    toast("ビジネスコードが生成されました。");
  };

  const validateBusinessCode = async (code: string) => {
    const isValid = await verifyBusinessCode(code);
    if (isValid === null) {
      generateBusinessCode();
    }
    return true;
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userFormData = Object.fromEntries(formData) as {
      name: string;
      email: string;
      password?: string;
      businessName: string;
      businessCode: string;
      role: string;
      isActive: string;
    };

    let result: {
      data: Partial<User> | null;
      error: string | null;
    } | null = null;

    try {
      // Create a new user or update existing one.
      if (isNew) {
        result = await addNewUser({
          userData: {
            ...userFormData,
            isActive: Boolean(userFormData.isActive),
            password: userFormData.password || "ResetPassword",
          },
        });
      } else {
        result = await updateUser({
          userData: {
            ...userFormData,
          },
          userId: user?.id || "",
        });
      }

      if (result.error !== null) {
        toast.error(result.error);
      }

      toast.success("ユーザーが正常に更新されました。");
      if (isNew) {
        router.push("/dashboard/users/");
      }
    } catch (error) {
      console.error(error);
      toast.error("ユーザーの更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const updateActivationStatus = async (status: boolean) => {
    setLoading(true);
    try {
      const result = await updateUserStatus({
        status: status,
        user: {
          id: user?.id ?? "",
          email: user?.email ?? "",
        },
      });

      if (result.error !== null) {
        toast.error(result.error);
      }

      toast.success("ユーザーが正常に更新されました。");
    } catch (error) {
      console.error(error);
      toast.error("ユーザーの更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSaveUser}>
        <div className="flex flex-col gap-6">
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="name">顧客名</Label>
            <Input
              type="text"
              name="name"
              id="name"
              autoComplete="off"
              defaultValue={user?.name || ""}
              className="capitalize"
              placeholder=""
              required
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="email">顧客メール</Label>
            <Input
              type="text"
              name="email"
              id="email"
              autoComplete="off"
              defaultValue={user?.email || ""}
              placeholder=""
              required
            />
          </div>

          {isNew ? (
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="password">パスワード</Label>
              {generatedPassword ? (
                <Input
                  type="text"
                  name="password"
                  id="password"
                  autoComplete="off"
                  value={generatedPassword}
                  placeholder=""
                  disabled
                  readOnly
                  required
                />
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => generatePassword()}
                >
                  <KeyIcon />
                  パスワードを生成
                </Button>
              )}
            </div>
          ) : (
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="name">Password</Label>
              <Button type="button" variant="secondary">
                <KeyIcon />
                個人情報
              </Button>
            </div>
          )}

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="businessName">会社名</Label>
            <Input
              type="text"
              name="businessName"
              id="businessName"
              autoComplete="off"
              defaultValue={user?.businessName || ""}
              className="capitalize"
              placeholder=""
              required
            />
          </div>

          <div className="relative grid w-full items-center gap-3">
            <Label htmlFor="businessCode">ビジネスコード </Label>
            <Input
              type="text"
              name="businessCode"
              id="businessCode"
              autoComplete="off"
              max={6}
              min={6}
              defaultValue={
                generatedBusinessCode
                  ? generatedBusinessCode
                  : user?.businessCode ?? ""
              }
              className="capitalize"
              placeholder=""
            />

            <span className="absolute right-2 bottom-2">
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => generateBusinessCode()}
              >
                コードを生成
              </Badge>
            </span>
          </div>

          <RadioGroup
            defaultValue={user?.role || "user"}
            name="role"
            required
            className="max-w-[400px] flex items-center gap-3 mb-6"
          >
            <Label htmlFor="user" className="flex-1">
              <Card
                className={`${
                  user?.role === "user" ? "w-full bg-gray-50" : "w-full"
                } py-2`}
              >
                <CardHeader className="gap-0">
                  <div className="flex items-center gap-2">
                    <div className="shrink">
                      <RadioGroupItem value="user" id="user" />
                    </div>
                    <div className="text-base">
                      <CardTitle className="flex items-center gap-2">
                        <User2Icon /> ユーザー
                      </CardTitle>
                      <CardDescription className="sr-only">
                        ユーザー権限
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Label>

            <Label htmlFor="admin" className="flex-1">
              <Card
                className={`${
                  user?.role === "user" ? "w-full bg-gray-50" : "w-full"
                } py-2`}
              >
                <CardHeader className="gap-0">
                  <div className="flex items-center gap-2">
                    <div className="shrink">
                      <RadioGroupItem value="admin" id="admin" />
                    </div>
                    <div className="text-base">
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck2Icon /> 管理者
                      </CardTitle>
                      <CardDescription className="sr-only">
                        管理者権限
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Label>
          </RadioGroup>

          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <h5 className="font-semibold">
                ユーザーアクティベーションステータス
              </h5>
              <p className="text-gray-500 text-sm">
                このフィールドが更新されると、ユーザーにメールが届きます。
              </p>
            </div>
            <Switch
              name="isActive"
              checked={user?.isActive || false}
              onCheckedChange={updateActivationStatus}
            />
          </div>

          <Button type="submit" variant="default" disabled={loading}>
            {loading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <SaveIcon />
            )}
            {loading ? "保存中..." : isNew ? "追加" : "変更を保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
