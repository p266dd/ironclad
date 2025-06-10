"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useActionState, useRef } from "react";
import { signupUser } from "./register";
import { cn } from "@/lib/utils";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter();
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  interface FormInitialState {
    success: boolean;
    message: string | undefined;
    fieldErrors: Record<string, string> | undefined;
  }

  const initialState: FormInitialState = {
    success: false,
    message: undefined,
    fieldErrors: undefined,
  };

  const [state, formAction, pending] = useActionState(signupUser, initialState);

  useEffect(() => {
    if (state.success) {
      console.log("Login form action succeeded:", state.message);
      router.push("/");
    }
  }, [state]);

  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)} {...props}>
      {state.message && !state.success && (
        <p className="text-red-500 text-sm text-center">{state.message}</p>
      )}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your credentials to create a new account.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" />
          {state.fieldErrors?.name && (
            <p className="text-red-500 text-xs mt-1">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="name@example.com" />
          {state.fieldErrors?.email && (
            <p className="text-red-500 text-xs mt-1">{state.fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="•••••••••" />
          {state.fieldErrors?.password && (
            <p className="text-red-500 text-xs mt-1">{state.fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            name="businessName"
            type="text"
            placeholder="Acme Inc."
          />
          {state.fieldErrors?.businessName && (
            <p className="text-red-500 text-xs mt-1">{state.fieldErrors.businessName}</p>
          )}
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating Account..." : "Sign Up"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Log In
        </Link>
      </div>
    </form>
  );
}
