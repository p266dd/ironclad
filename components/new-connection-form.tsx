"use client";

import { useState, useRef } from "react";
import { string } from "yup";

// Shadcn
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { handleNewConnection, verifyCanConnect } from "@/data/user/connections";
import {
  ArrowLeftIcon,
  CheckSquare2Icon,
  Link2Icon,
  LoaderCircleIcon,
} from "lucide-react";

export default function NewConnectionForm({ userId }: { userId: string }) {
  const [step, setStep] = useState(1);
  const [loading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [business, setBusiness] = useState<{
    businessName: string;
    businessCode: string;
    receiveId: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted!");
  };

  const handleNextStep = async () => {
    setErrorMessage(null);

    if (!inputRef.current) {
      return;
    }

    // Parse the input value
    const value = string().cast(inputRef.current.value);

    // Get user business information or error.
    const canConnect = await verifyCanConnect(value ?? "");

    // Check if user accepts connection
    if (canConnect.error) {
      setErrorMessage(canConnect.error);
      return;
    }

    // Set the business state based on the returned value
    setBusiness({
      businessName: canConnect.data?.businessName ?? "No Name",
      businessCode: canConnect.data?.businessCode ?? "No Code",
      receiveId: canConnect.data?.id ?? "",
    });

    // Go to next step
    setStep(2);
  };

  const handleConnection = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    // Create the connection object
    const connectionObj = {
      receiveId: business?.receiveId ?? "",
      requestId: userId,
      businessName: business?.businessName ?? "",
      businessCode: business?.businessCode ?? "",
    };

    // Save connection in pendingConnections
    // code 1 is receiving connection
    // code 2 is submitting connection
    const connected = await handleNewConnection(connectionObj);

    // If error, show message
    if (connected.error) {
      setErrorMessage(connected.error);
      setIsLoading(false);
      return;
    }

    // Show success message.
    setSuccessMessage("Success! New connection is pending.");

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {step === 1 && (
        <div id="step1">
          <div className="grid w-full max-w-sm items-center gap-3 mb-4">
            <Label htmlFor="code">Business Code</Label>
            <Input
              ref={inputRef}
              type="text"
              id="code"
              placeholder=""
              autoComplete="off"
            />
            {errorMessage && (
              <div>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-primary text-white rounded-[100%] w-6 h-6 grid items-center justify-center">
                1
              </span>
              <span className="text-xs text-slate-600 bg-gray-200 rounded-[100%] w-6 h-6 grid items-center justify-center">
                2
              </span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div id="step2">
          <div className="grid w-full max-w-sm items-center gap-3 mb-4">
            <Label htmlFor="code">Connect to</Label>
            <div className="flex flex-col">
              <span className="text-lg font-bold">
                {business?.businessName}
              </span>
              <span className="text-sm text-gray-500">
                {business?.businessCode}
              </span>
            </div>

            {errorMessage && (
              <div>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
          </div>

          {successMessage ? (
            <div className="text-green-600 text-sm flex items-center gap-3">
              <CheckSquare2Icon /> {successMessage}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setErrorMessage(null);
                  setStep(1);
                }}
              >
                <ArrowLeftIcon />
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={handleConnection}
              >
                {loading ? (
                  <>
                    <LoaderCircleIcon className="animate-spin" /> Connecting
                  </>
                ) : (
                  <>
                    <Link2Icon /> Connect
                  </>
                )}
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-600 bg-gray-200  rounded-[100%] w-6 h-6 grid items-center justify-center">
                  1
                </span>
                <span className="text-xs bg-primary text-white rounded-[100%] w-6 h-6 grid items-center justify-center">
                  2
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
