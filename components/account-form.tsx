"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  updateUserPreferences,
  removeUserPreference,
  updateOwnUser,
} from "@/data/user/actions";

import { generateRandomString } from "@/lib/generate-random-string";
import { verifyBusinessCode } from "@/data/user/actions";

// Shadcn
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CircleCheckIcon,
  Eye,
  EyeOff,
  LoaderCircleIcon,
  ReceiptJapaneseYenIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";

// Types
import { TAccountChange } from "@/lib/types";

export default function AccountForm({ currentInfo }: { currentInfo: TAccountChange }) {
  const [save, setSave] = useState(false);
  const [savePreference, setSavePreference] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Code validation state.
  const [code, setCode] = useState<string | null>(null);

  // Keep unsaved preferences.
  const [unsavedPreference, setUnsavedPreference] = useState<{
    slug: string;
    name: string;
  } | null>(null);

  // Keep unsaved user info.
  const [unsavedChanges, setUnsavedChanges] = useState<TAccountChange | null>(
    currentInfo?.name !== "" ? currentInfo : null
  );

  const handleInformationSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const formData = Object.fromEntries(data.entries()) as TAccountChange;
    const updatedUser = await updateOwnUser(formData);
    if ("error" in updatedUser && typeof updatedUser.error === "string") {
      toast.error(`${updatedUser.error}`);
      setLoading(false);
      return;
    }
    toast.success("Information updated successfully.");
    setSave(false);
    setLoading(false);
  };

  const handlePreferenceSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const updatedPreference = await updateUserPreferences(unsavedPreference);
    if ("error" in updatedPreference && typeof updatedPreference.error === "string") {
      toast.error(`${updatedPreference.error}`);
      setLoading(false);
      return;
    }
    toast.success("Preference updated successfully");
    setSavePreference(false);
    setUnsavedPreference(null);
    setLoading(false);
  };

  const validateBusinessCode = async (code: string) => {
    const validUsers = await verifyBusinessCode(code);
    if (validUsers === null || validUsers === undefined || validUsers.length === 0) {
      return false;
    }
    return true;
  };

  const generateBusinessCode = async () => {
    const generatedBusinessCode = generateRandomString("businessCode");
    if (!generatedBusinessCode) return;
    const isValid = validateBusinessCode(generatedBusinessCode);
    if (!isValid) return;

    setCode(generatedBusinessCode);
    toast("Business code generated.");
  };

  console.log(code);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button asChild variant="default" size="lg">
          <Link href="/account/orders">
            <ReceiptJapaneseYenIcon /> See All Orders
          </Link>
        </Button>
      </div>
      <form onSubmit={handleInformationSave}>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex-1 w-full flex flex-col gap-6">
            <h3 className="text-2xl text-primary">Personal Information</h3>
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Full Name</Label>
              <Input
                autoComplete="off"
                type="text"
                name="name"
                id="name"
                value={unsavedChanges?.name ?? currentInfo?.name ?? ""}
                onChange={(e) => {
                  setSave(true);
                  setUnsavedChanges((prev) => ({ ...prev, name: e.target.value }));
                }}
                placeholder="John Doe"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="off"
                type="email"
                name="email"
                id="email"
                placeholder="name@email.com"
                value={unsavedChanges?.email ?? currentInfo?.email ?? ""}
                onChange={(e) => {
                  setSave(true);
                  setUnsavedChanges((prev) => ({ ...prev, email: e.target.value }));
                }}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="password">Change Password</Label>
              <div className="relative">
                <Input
                  autoComplete="off"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="•••••••••"
                  value={unsavedChanges?.password ?? currentInfo?.password ?? ""}
                  onChange={(e) => {
                    setSave(true);
                    setUnsavedChanges((prev) => ({ ...prev, password: e.target.value }));
                  }}
                />
                <span
                  className="absolute right-4 top-2 text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full flex flex-col gap-6">
            <h3 className="text-2xl text-primary">Company Information</h3>

            <div className="flex flex-col gap-3">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                autoComplete="off"
                type="text"
                name="businessName"
                id="businessName"
                placeholder="Ironclad"
                value={unsavedChanges?.businessName ?? currentInfo?.businessName ?? ""}
                onChange={(e) => {
                  setSave(true);
                  setUnsavedChanges((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }));
                }}
              />
            </div>

            <div className="relative flex flex-col gap-3">
              <Label htmlFor="businessCode">Business Code</Label>
              <Input
                autoComplete="off"
                type="text"
                name="businessCode"
                id="businessCode"
                placeholder=""
                value={
                  code
                    ? code
                    : unsavedChanges?.businessCode ?? currentInfo?.businessCode ?? ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSave(true);
                  setUnsavedChanges((prev) => ({
                    ...prev,
                    businessCode: e.target.value,
                  }));
                }}
              />

              <span className="absolute right-2 bottom-[6px] z-30">
                {code === null ? (
                  <Badge
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => generateBusinessCode()}
                  >
                    Generate
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setCode(null)}
                  >
                    Clear
                  </Badge>
                )}
              </span>
            </div>
          </div>
        </div>
        {save && (
          <div className="flex items-center gap-6 my-5">
            <Button type="submit" disabled={loading} variant="success" size="lg">
              <SaveIcon />
              {loading ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              type="submit"
              variant="outline"
              disabled={loading}
              size="lg"
              onClick={() => {
                setSave(false);
                setUnsavedChanges(null);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
      <div>
        <h3 className="text-2xl text-primary">Engraving Preferences</h3>

        <form onSubmit={handlePreferenceSave}>
          <div className="py-4 flex flex-col items-center gap-4 md:flex-row">
            <Input
              autoComplete="off"
              type="text"
              name="preference"
              placeholder="Engraving Brand"
              className="flex-grow py-6"
              value={unsavedPreference !== null ? unsavedPreference.name : ""}
              onChange={(e) => {
                const value = e.target.value;
                setSavePreference(true);
                setUnsavedPreference({
                  slug: value.trim().toLocaleLowerCase().replace(" ", "_"),
                  name: e.target.value,
                });
              }}
            />
            {savePreference && (
              <div className="flex items-center gap-2 w-full md:w-4/12">
                <Button
                  type="submit"
                  variant="success"
                  disabled={loading}
                  className="flex-1 w-full"
                >
                  {loading ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={() => {
                    setSavePreference(false);
                    setUnsavedPreference(null);
                  }}
                  type="submit"
                  variant="outline"
                  disabled={loading}
                  className="flex-1 w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </form>

        <div className="flex flex-wrap gap-4 items-center justify-start py-5">
          {Array.isArray(currentInfo?.engraving) &&
            currentInfo?.engraving.map((item) => {
              const engraving = item as {
                slug: string;
                name: string;
              };
              return (
                <div
                  key={engraving.slug}
                  className="md:min-w-3/12 flex items-center gap-2 justify-between px-4 py-2 bg-white border rounded-md"
                >
                  <span>{engraving.name}</span>
                  <Popover>
                    <PopoverTrigger>
                      <Trash2Icon color="red" size={18} />
                    </PopoverTrigger>
                    <PopoverContent align="center" side="bottom">
                      <div className="flex flex-col gap-3">
                        <span className="text-sm text-slate-500">
                          Remove This Preference?
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            removeUserPreference(engraving.slug).then(() => {
                              toast.success("Preference removed successfully");
                            });
                          }}
                        >
                          <CircleCheckIcon />
                          Confirm
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
