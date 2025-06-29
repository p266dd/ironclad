"use client";

import useSWR from "swr";
import Link from "next/link";
import { useState, useEffect } from "react";

import { getActiveMessage } from "@/data/message/action";

// Shadcn
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

export default function DisplayMessage() {
  const SESSION_KEY = "hasSessionMessageBeenShown";

  const [message, setMessage] = useState<{
    title: string;
    content: string;
    linkTitle: string | null;
    linkUrl: string | null;
    image: string | null;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { data, isLoading } = useSWR("fetchActiveMessage", getActiveMessage);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem(SESSION_KEY);

    if (!hasBeenShown && !isLoading) {
      if (data !== null && data !== undefined) {
        setMessage({
          title: data?.title,
          content: data?.content,
          linkTitle: data?.linkTitle,
          linkUrl: data?.linkUrl,
          image: data?.image,
        });
      }

      setIsVisible(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [isLoading, data]);

  if (!message) {
    return;
  }

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent showCloseButton={false} className="md:max-w-10/12 lg:max-w-4xl">
        <DialogHeader className="flex flex-col sm:flex-row sm:items-center gap-6 lg:mb-4">
          {message.image && (
            <div className="flex justify-center md:max-w-[350px]">
              <img
                src={message.image}
                alt="Dialog Image"
                className=" rounded-lg overflow-hidden"
              />
            </div>
          )}

          <div className="flex flex-col gap-4">
            <DialogTitle className="md:text-2xl">
              {message.title || <span className="text-gray-400">Missing title.</span>}
            </DialogTitle>
            <DialogDescription className="md:text-base">
              {message.content || <span className="text-gray-400">Missing content.</span>}
            </DialogDescription>
          </div>
        </DialogHeader>
        {message.linkTitle && message.linkUrl && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button asChild type="button">
              <Link href="#" target="_blank">
                {message.linkTitle || (
                  <span className="text-sm text-gray-400">Missing Link</span>
                )}
              </Link>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
