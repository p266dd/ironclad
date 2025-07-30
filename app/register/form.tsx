"use client";

import Link from "next/link";
import { useState, useActionState, useRef } from "react";
import { signupUser } from "./register";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeftIcon, Eye, EyeOff, Info } from "lucide-react";

// Types
import { ActionFormInitialState } from "@/lib/types";
import LoadingIndicator from "@/components/loading-indicator";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const initialState: ActionFormInitialState = {
    success: false,
    message: undefined,
    fieldErrors: undefined,
  };

  const [state, formAction, pending] = useActionState(signupUser, initialState);

  if (state.success === true) {
    toast.success(state.message);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your credentials to create a new account.
        </p>
      </div>
      {state.message && !state.success && (
        <Alert>
          <Info />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" />
          {state.fieldErrors?.name && (
            <Alert variant="destructive">
              <AlertTriangle size={18} />
              <AlertDescription>
                <p>{state.fieldErrors.name}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
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

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              ref={passwordRef}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="•••••••••"
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

        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            name="businessName"
            type="text"
            placeholder="Acme Inc."
          />
          {state.fieldErrors?.businessName && (
            <Alert variant="destructive">
              <AlertTriangle size={18} />
              <AlertDescription>
                <p>{state.fieldErrors.businessName}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creating Account..." : "Sign Up"}
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="flex items-center underline underline-offset-4"
        >
          <LoadingIndicator />
          Log In
        </Link>
      </div>
    </form>
  );
}
