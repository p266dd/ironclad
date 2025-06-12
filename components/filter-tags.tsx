"use client";

import { useRouter } from "next/navigation";

// Shadcn
import { Button } from "@/components/ui/button";

// Types
import { TagIcon } from "lucide-react";

export default function FilterTags({
  filter,
  active,
}: {
  filter: string;
  active: string;
}) {
  const router = useRouter();
  const isActive = filter.toLowerCase() === active.toLowerCase();

  return (
    <Button
      onClick={() => {
        isActive
          ? router.push("/")
          : router.push("/?filter=" + filter.toLowerCase().trim());
      }}
      variant={isActive ? "default" : "outline"}
      size="lg"
    >
      {isActive && <TagIcon />}
      {filter}
    </Button>
  );
}
