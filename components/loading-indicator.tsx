"use client";

import { useLinkStatus } from "next/link";
import { LoaderCircleIcon } from "lucide-react";

export default function LoadingIndicator() {
  const { pending } = useLinkStatus();
  return pending ? (
    <LoaderCircleIcon
      className="animate-spin size-2 md:size-4"
      role="status"
      aria-label="Loading"
    />
  ) : null;
}
