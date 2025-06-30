"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { generateRandomString } from "@/lib/generate-random-string";
import { updateUser, addNewUser, verifyBusinessCode } from "@/data/user/actions";

// Shadcn
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function AdminUserForm({
  user,
  isNew,
}: {
  user: Partial<User> | null;
  isNew?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [generatedBusinessCode, setGeneratedBusinessCode] = useState<string | null>(null);

  const router = useRouter();

  const generatePassword = () => {
    const generatedPassword = generateRandomString("password");
    setGeneratedPassword(generatedPassword);
    toast("Password generated.");
  };

  const generateBusinessCode = async () => {
    const generatedBusinessCode = generateRandomString("businessCode");
    if (!generatedBusinessCode) return;
    const isValid = validateBusinessCode(generatedBusinessCode);
    if (!isValid) return;

    setGeneratedBusinessCode(generatedBusinessCode);
    toast("Business code generated.");
  };

  const validateBusinessCode = async (code: string) => {
    const isValid = await verifyBusinessCode(code);
    if (isValid === null) {
      generateBusinessCode();
    }
    return true;
  };

  console.log(generatedBusinessCode);

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

      if (result?.error) {
        toast.error(result.error);
      }

      toast.success("User updated successfully!");
      if (isNew) {
        router.push("/dashboard/users/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSaveUser}>
        <div className="flex flex-col gap-6">
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="name">Client Name</Label>
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
            <Label htmlFor="email">Client Email</Label>
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
              <Label htmlFor="password">Password</Label>
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
                  Generate Password
                </Button>
              )}
            </div>
          ) : (
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="name">Password</Label>
              <Button type="button" variant="secondary">
                <KeyIcon />
                Private
              </Button>
            </div>
          )}

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              type="text"
              name="businessName"
              id="businessName"
              autoComplete="off"
              defaultValue={user?.businessName || ""}
              className="capitalize"
              placeholder=""
            />
          </div>

          <div className="relative grid w-full items-center gap-3">
            <Label htmlFor="businessCode">Business Code</Label>
            <Input
              type="text"
              name="businessCode"
              id="businessCode"
              autoComplete="off"
              max={6}
              min={6}
              defaultValue={
                generatedBusinessCode ? generatedBusinessCode : user?.businessCode ?? ""
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
                Generate
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
                        <User2Icon /> User
                      </CardTitle>
                      <CardDescription className="sr-only">Role: User</CardDescription>
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
                        <UserCheck2Icon /> Admin
                      </CardTitle>
                      <CardDescription className="sr-only">User: Admin</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Label>
          </RadioGroup>

          <Label htmlFor="isActive" className="flex items-center gap-3">
            <Checkbox
              name="isActive"
              id="isActive"
              defaultChecked={user?.isActive || false}
            />
            <span>Is this user active?</span>
          </Label>

          <Button type="submit" variant="default" disabled={loading}>
            {loading ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}
            {loading ? "Saving..." : isNew ? "Add User" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
