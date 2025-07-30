"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useActionState, useRef } from "react";
import { authenticateUser } from "./authenticate";
import { cn } from "@/lib/utils";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Eye, EyeOff, Info } from "lucide-react";

// Types
import { ActionFormInitialState } from "@/lib/types";
import LoadingIndicator from "@/components/loading-indicator";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  const initialState: ActionFormInitialState = {
    success: false,
    message: undefined,
    fieldErrors: undefined,
  };

  const [state, formAction, pending] = useActionState(
    authenticateUser,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      // console.log("Login form action succeeded:", state.message);
      router.push("/");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your credentials below to login to your account.
        </p>
      </div>
      {state.message && !state.success && (
        <Alert variant="info">
          <Info />
          <AlertDescription>{state.message}</AlertDescription>
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
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/recover"
              className="flex items-center ml-auto text-sm underline-offset-4 hover:underline"
            >
              <LoadingIndicator />
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <Input
              ref={passwordRef}
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
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing In..." : "Sign In"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="flex items-center underline underline-offset-4"
        >
          <LoadingIndicator />
          Sign up
        </Link>
      </div>
    </form>
  );
}
