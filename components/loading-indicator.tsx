"use client";

import { useLinkStatus } from "next/link";
import { LoaderCircleIcon } from "lucide-react";

export default function LoadingIndicator() {
  const { pending } = useLinkStatus();
  return pending ? (
    <LoaderCircleIcon className="animate-spin" role="status" aria-label="Loading" />
  ) : null;
}
