"use client";

import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnnoyedIcon, RefreshCcwIcon } from "lucide-react";

export default function ProductGridError() {
  const router = useRouter();

  return (
    <div className="max-w-[400px] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AnnoyedIcon />
            Error
          </CardTitle>
          <CardDescription>
            There was an error while loading the product list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button onClick={() => router.refresh()} variant="default">
              <RefreshCcwIcon /> Retry
            </Button>
            <Button onClick={() => router.push("/")} variant="secondary">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
