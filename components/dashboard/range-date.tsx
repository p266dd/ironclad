"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { type DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";

type SearchDate = {
  startDate: Date | undefined;
  endDate: Date | undefined;
};

export default function DateRangePicker({
  range,
  setRange,
  className,
}: {
  range: SearchDate | undefined;
  setRange: (range: SearchDate | undefined) => void;
  className?: string;
}) {
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MM/dd")} - {format(date.to, "MM/dd")}
                </>
              ) : (
                format(date.from, "MM/dd")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="end">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date ? date : { from: range?.startDate, to: range?.endDate }}
            onSelect={(dates) => {
              setDate(dates);
              setRange({
                startDate: dates?.from,
                endDate: dates?.to,
              });
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
