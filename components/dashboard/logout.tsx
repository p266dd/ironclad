"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";

export default function DashboardLogout() {
  return (
    <Card className="text-primary-foreground border-0 bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>Dhavidy Pires</CardTitle>
        <CardDescription>Logged In</CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="secondary" size="sm" onClick={() => null}>
          <Power /> Logout
        </Button>
      </CardContent>
    </Card>
  );
}
