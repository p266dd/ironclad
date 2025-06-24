"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import { Share } from "lucide-react";

import LogoIcon from "@/assets/logo-icon.png";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: {
    outcome: "accepted" | "dismissed";
    platform: string;
  };
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Cleanup the event listener when the component unmounts.
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  if (isStandalone) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={`${isIOS ? "top-44" : "top-32"} w-10/12 max-w-md`}
      >
        <DialogHeader className="flex-row items-center gap-4">
          <div className="w-14">
            <Image src={LogoIcon} alt="Ironclad Logo" className="w-full" />
          </div>
          <div className="flex flex-col items-start">
            <DialogTitle className="text-left">Install App?</DialogTitle>
            <DialogDescription className="text-left">
              Now you can browse our product from your smartphone.
            </DialogDescription>
          </div>
        </DialogHeader>
        {isIOS ? (
          <div>
            <Separator className="mb-2" />
            <p className="text-sm text-slate-500">
              How to install this app on your iOS device.
            </p>
            <div className="flex flex-col gap-2">
              <span>
                1. Tap the <span className="font-semibold">share button icon</span>
                <span role="img" aria-label="share icon" className="mx-2">
                  <Share size={18} className="inline-block" />
                </span>
              </span>
              <span>
                2. Tap the
                <span className="font-semibold ml-2">Add to Home Screen.</span>
              </span>
            </div>
          </div>
        ) : (
          <DialogFooter className="flex-row">
            <Button onClick={handleInstallClick} variant="default" className="flex-1">
              Install
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1"
              onClick={() => setShowPrompt(false)}
            >
              <span>Close</span>
            </Button>
          </DialogFooter>
        )}
        <div>
          <button
            className="w-full text-xs underline text-center slate-400 cursor-pointer"
            onClick={() => {
              setShowPrompt(false);
              // set cookie doNotDisplayPrompt.
              document.cookie = "doNotDisplayPrompt=true";
            }}
          >
            Don&apos;t show this again.
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
