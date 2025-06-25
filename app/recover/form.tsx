"use client";

import Link from "next/link";
import { useActionState } from "react";
import { recover } from "./recover";
import { cn } from "@/lib/utils";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeftIcon, Info } from "lucide-react";

import { ActionFormInitialState } from "@/lib/types";

export function RecoverForm({ className, ...props }: React.ComponentProps<"form">) {
  const initialState: ActionFormInitialState = {
    success: false,
    message: undefined,
    fieldErrors: undefined,
  };

  const [state, formAction, pending] = useActionState(recover, initialState);

  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Recover Account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below and we&#39;ll send you a recover code.
        </p>
      </div>
      {state.message && (
        <Alert variant="info">
          <Info size={18} />
          <AlertDescription>
            <p>{state.message}</p>
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
          />
          {state.fieldErrors?.email && (
            <Alert variant="destructive">
              <AlertTriangle size={18} />
              <AlertDescription>
                <p>{state.fieldErrors.email}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Sending..." : "Send Code"}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login" className="flex items-center gap-2">
              <ArrowLeftIcon />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}
