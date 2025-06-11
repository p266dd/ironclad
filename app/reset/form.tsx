"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "./reset";
import { cn } from "@/lib/utils";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Eye, EyeOff, Info } from "lucide-react";

// Types
import { ActionFormInitialState } from "@/lib/types";

export function ResetForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const initialState: ActionFormInitialState = {
    success: false,
    message: undefined,
    fieldErrors: undefined,
  };

  const [state, formAction, pending] = useActionState(resetPassword, initialState);

  useEffect(() => {
    if (state.success) {
      console.log("Password reset action succeeded:", state.message);
      router.push("/");
    }
  }, [state]);

  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your new password below.
        </p>
      </div>
      {state.message && !state.success && (
        <Alert>
          <Info />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">New Password</Label>
          </div>
          <div className="relative">
            <input
              type="hidden"
              name="token"
              value={searchParams.get("token") || ""}
              readOnly
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="•••••••••"
              required
            />
            <span
              className="absolute right-4 top-2 text-slate-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </span>
          </div>
          {state.fieldErrors?.password && (
            <Alert variant="destructive">
              <AlertTriangle size={18} />
              <AlertDescription>
                <p>{state.fieldErrors.password}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="confirmPassword">Type Password Again</Label>
          </div>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="•••••••••"
              required
            />
            <span
              className="absolute right-4 top-2 text-slate-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </span>
          </div>
          {state.fieldErrors?.confirmPassword && (
            <Alert variant="destructive">
              <AlertTriangle size={18} />
              <AlertDescription>
                <p>{state.fieldErrors.confirmPassword}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving New Password..." : "Save Password"}
        </Button>
        <div className="text-center text-sm">
          <Link href="/login" className="underline underline-offset-4">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
