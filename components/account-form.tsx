"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import NewConnectionForm from "./new-connection-form";
import LoadingIndicator from "./loading-indicator";
import {
  updateUserPreferences,
  removeUserPreference,
  updateOwnUser,
  verifyBusinessCode,
} from "@/data/user/actions";
import {
  approveConnection,
  deleteActiveConnection,
  deleteConnection,
  updateOwnUserConnection,
} from "@/data/user/connections";
import { useTour } from "@/lib/tour/tour-context";

import { generateRandomString } from "@/lib/generate-random-string";

// Shadcn
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  CheckIcon,
  CircleCheckIcon,
  Eye,
  EyeOff,
  ListOrderedIcon,
  LoaderCircleIcon,
  MessageCircleQuestionIcon,
  PlusCircleIcon,
  ReceiptJapaneseYenIcon,
  SaveIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";

// Types
import { TAccountChange } from "@/lib/types";

export default function AccountForm({ currentInfo }: { currentInfo: TAccountChange }) {
  const [save, setSave] = useState(false);
  const [savePreference, setSavePreference] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { startTour } = useTour();
  useEffect(() => {
    if (typeof window === undefined) {
      return;
    }

    if (window.localStorage.getItem("account-tour") !== null) {
      return;
    }

    setTimeout(() => startTour("account-tour"), 1000);

    window.localStorage.setItem("account-tour", "true");
    // return () => clearTimeout(start);
  }, [startTour]);

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

    if (formData === null) {
      toast.error("No data was provided.");
      setLoading(false);
      return;
    }

    // Validate
    const validatedData = {
      name: formData.name === undefined ? "Missing Name" : formData.name,
      email: formData.email === undefined ? "Missing Email" : formData.email,
      password: formData.password,
      businessName:
        formData.businessName === undefined
          ? "Missing Business Name"
          : formData.businessName,
      businessCode: !formData.businessCode ? undefined : formData.businessCode,
    };

    const updatedUser = await updateOwnUser(validatedData);

    if (updatedUser?.error !== null) {
      toast.error(updatedUser.error);
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
    if (unsavedPreference === null || unsavedPreference?.name === undefined) {
      toast.error("No preference was provided.");
      setLoading(false);
      return;
    }

    const updatedPreference = await updateUserPreferences(unsavedPreference);

    if (updatedPreference.error !== null) {
      toast.error(updatedPreference?.error);
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
    if (validUsers === null || validUsers === undefined || validUsers?.length === 0) {
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
    setSave(true);
  };

  const handleUpdateBusinessConnection = async (checked: boolean) => {
    const updatedUser = await updateOwnUserConnection(checked);

    if (updatedUser.error !== null) {
      toast.error(updatedUser.error);
    }

    toast.success("Setting updated successfully!");
  };

  const handleDeleteConnection = async (
    requestId: string,
    receiveId: string,
    active: string | null
  ) => {
    if (!requestId || !receiveId) {
      return null;
    }

    const deletedConnection =
      active !== null
        ? await deleteActiveConnection(receiveId, requestId)
        : await deleteConnection(receiveId, requestId);

    if (deletedConnection.error) {
      toast.error(deletedConnection.error);
    }

    toast.success(deletedConnection?.message ?? "Deleted successfully.");
  };

  const handleApproveConnection = async (
    requestId: string,
    receiveId: string,
    businessName: string,
    businessCode: string
  ) => {
    if (!requestId || !receiveId) {
      return null;
    }

    const approvedConnection = await approveConnection(
      receiveId,
      requestId,
      businessName,
      businessCode
    );

    if (approvedConnection.error) {
      toast.error(approvedConnection.error);
    }

    toast.success(approvedConnection?.message ?? "Deleted successfully.");
  };

  const pendingConnections = currentInfo?.pendingConnections as {
    receiveId: string;
    requestId: string;
    businessName: string;
    businessCode: string;
    code: number;
    name: string;
    email: string;
  }[];
  const connections = currentInfo?.connections as {
    receiveId: string;
    requestId: string;
    connectionId: string;
    businessName: string;
    businessCode: string;
    name: string;
    email: string;
  }[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-5">
        <Button asChild variant="default" size="lg" id="account-history">
          <Link href="/account/orders">
            <LoadingIndicator />
            <ReceiptJapaneseYenIcon /> See All Orders
          </Link>
        </Button>

        <button type="button" onClick={() => startTour("account-tour")}>
          <MessageCircleQuestionIcon id="account-help" className="text-gray-400 size-4" />
        </button>
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
                  setUnsavedChanges((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
                placeholder=""
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="off"
                type="email"
                name="email"
                id="email"
                placeholder=""
                value={unsavedChanges?.email ?? currentInfo?.email ?? ""}
                onChange={(e) => {
                  setSave(true);
                  setUnsavedChanges((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                }}
              />
            </div>

            <div className="flex flex-col gap-3" id="pass-update">
              <Label htmlFor="password">Change Password</Label>
              <div className="relative">
                <Input
                  autoComplete="off"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder=""
                  value={unsavedChanges?.password ?? currentInfo?.password ?? ""}
                  onChange={(e) => {
                    setSave(true);
                    setUnsavedChanges((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }));
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
                placeholder=""
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

            <div className="relative flex flex-col gap-3" id="business-code">
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

              <span className="absolute right-2 bottom-[6px]">
                {code === null ? (
                  <Badge
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => generateBusinessCode()}
                    id="generate-code"
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
                setCode(null);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
      <div>
        <h3 className="text-2xl text-primary">Engraving Preferences</h3>

        <form onSubmit={handlePreferenceSave} id="preferences">
          <div className="py-4 flex flex-col items-center gap-4 md:flex-row">
            <Input
              autoComplete="off"
              type="text"
              name="preference"
              placeholder="Engraving Brand"
              className="flex-grow py-6"
              value={unsavedPreference !== null ? unsavedPreference.name : ""}
              required
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
                    <PopoverTrigger className="cursor-pointer">
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
                          className="cursor-pointer"
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

      <div className="relative flex flex-col gap-6">
        <div className="flex items-center space-x-2" id="connecting-accounts">
          <Switch
            id="connet"
            defaultChecked={currentInfo?.canConnect || false}
            onCheckedChange={handleUpdateBusinessConnection}
          />
          <Label htmlFor="connect">Allow Connection</Label>
        </div>

        {currentInfo?.canConnect === true ? (
          <div className="flex items-center justify-start gap-6">
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="default">
                    Add New
                    <PlusCircleIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" side="top">
                  <NewConnectionForm user={currentInfo ?? ""} />
                </PopoverContent>
              </Popover>
            </div>

            {(pendingConnections && pendingConnections.length > 0) ||
            (connections && connections.length > 0) ? (
              <div className="relative">
                {pendingConnections && pendingConnections.length > 0 ? (
                  <span className="absolute -top-1 -right-1 size-3 rounded-full bg-red-500"></span>
                ) : null}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline">
                      <ListOrderedIcon />
                      Connections
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="top"
                    className="flex flex-col gap-4"
                  >
                    {pendingConnections !== null &&
                      pendingConnections.map((cn, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg p-3 mb-3">
                          <span className="flex items-center gap-2 text-xs font-bold p-2 mb-1 bg-white rounded-md">
                            {cn.code === 1 ? (
                              <>
                                <ArrowLeftCircleIcon className="size-4" /> Receiving
                                Connection
                              </>
                            ) : (
                              <>
                                <ArrowRightCircleIcon className="size-4" /> Requesting
                                Connection
                              </>
                            )}
                          </span>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-col mb-2">
                                <span>{cn.businessName}</span>
                                <span className="text-sm text-slate-500">
                                  {cn.businessCode}
                                </span>
                                <span className="text-sm text-slate-500">{cn.name}</span>
                                <span className="text-sm text-slate-500">{cn.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {cn.code === 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleApproveConnection(
                                        cn.requestId,
                                        cn.receiveId,
                                        cn.businessName,
                                        cn.businessCode
                                      )
                                    }
                                  >
                                    <CheckIcon />
                                  </Button>
                                )}

                                <Button
                                  type="button"
                                  variant="destructive"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleDeleteConnection(
                                      cn.requestId,
                                      cn.receiveId,
                                      null
                                    )
                                  }
                                >
                                  <TrashIcon />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {connections !== null &&
                      connections.map((cn, i) => (
                        <div key={i} className="rounded-lg border p-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-col mb-2">
                                <span>{cn.name ? cn.name : cn.businessName}</span>
                                <span className="text-sm text-slate-500">
                                  {cn.name ? cn.email : cn.businessCode}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() =>
                                    handleDeleteConnection(
                                      cn.requestId,
                                      cn.receiveId,
                                      "active"
                                    )
                                  }
                                >
                                  <TrashIcon className="text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </PopoverContent>
                </Popover>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
