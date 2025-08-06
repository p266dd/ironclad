"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/assets/logo.png";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src={Logo.src} alt="Ironclad" className="w-52" />

        <div className="my-8 text-center">
          <h1 className="text-2xl font-light mb-3">
            <strong className="font-semibold">Page Not Found!</strong>
          </h1>
          <p className="text-base">
            Return to the{" "}
            <button className="underline cursor-pointer" onClick={() => router.back()}>
              previous page
            </button>
          </p>
          <p>
            or go to{" "}
            <Link className="underline" href="/">
              home page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
