"use client";

import { BadgeAlertIcon } from "lucide-react";

export default function EmptyResults() {
  return (
    <div className="flex items-center justify-start gap-12 text-slate-500">
      <div>
        <BadgeAlertIcon size={70} strokeWidth={1.5} />
      </div>
      <div>
        <h5 className="text-xs sm:text-base">We couldn&#39;t find results!</h5>
        <h4 className="text-base sm:text-xl">Try modifying your search terms.</h4>
      </div>
    </div>
  );
}
