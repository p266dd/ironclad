"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, XIcon } from "lucide-react";

type SearchDate =
  | {
      startDate: Date | undefined;
      endDate: Date | undefined;
    }
  | undefined;

export default function DateRangePicker({
  range,
  setRange,
  className,
}: {
  range: SearchDate;
  setRange: (range: SearchDate | undefined) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !range && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range && range.startDate && range.endDate ? (
              range?.startDate ? (
                <>
                  {format(range.startDate, "MM/dd")} - {format(range?.endDate, "MM/dd")}
                </>
              ) : (
                format(range.startDate, "MM/dd")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="w-auto">
          <DialogClose className="absolute p-2 -top-4 -right-2 bg-primary text-primary-foreground rounded-full">
            <XIcon />
          </DialogClose>
          <DialogHeader className="sr-only">
            <DialogTitle>Date Range</DialogTitle>
            <DialogDescription>Select a date range.</DialogDescription>
          </DialogHeader>
          <Calendar
            className="w-full"
            autoFocus
            mode="range"
            defaultMonth={range?.startDate || new Date()}
            selected={{
              from: range?.startDate,
              to: range?.endDate,
            }}
            onSelect={(dates) => {
              setRange({
                startDate: dates?.from,
                endDate: dates?.to,
              });
            }}
            numberOfMonths={2}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
