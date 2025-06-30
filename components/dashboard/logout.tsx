"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";

import { logout } from "@/lib/logout";

export default function DashboardLogout() {
  return (
    <Card className="text-primary-foreground border-0 bg-transparent shadow-none">
      <CardHeader>
        <CardTitle></CardTitle>
        <CardDescription>Logged In</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={async () => await logout()}
        >
          <Power /> Logout
        </Button>
      </CardContent>
    </Card>
  );
}
