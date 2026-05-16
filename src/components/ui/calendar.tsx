import * as React from "react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const CURRENT_YEAR = new Date().getFullYear();
/** Câmara dos Deputados disponibiliza dados desde 1934. */
const DEFAULT_FROM_YEAR = 1934;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown-buttons",
  fromYear,
  toYear,
  fromDate,
  toDate,
  ...props
}: CalendarProps) {
  // Quando o consumidor não definiu limites, expomos o intervalo completo de
  // dados da Câmara (1934 → ano atual + 1). Quando há `fromDate`/`toDate`, a
  // própria react-day-picker deriva o range desses limites — não sobrescreve.
  const resolvedFromYear =
    fromYear ?? (fromDate ? undefined : DEFAULT_FROM_YEAR);
  const resolvedToYear = toYear ?? (toDate ? undefined : CURRENT_YEAR + 1);

  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      fromYear={resolvedFromYear}
      toYear={resolvedToYear}
      fromDate={fromDate}
      toDate={toDate}
      className={cn("p-0 md:p-3", className)}
      classNames={{
        months: "w-full  space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        caption_dropdowns: "flex items-center gap-1.5",
        dropdown:
          "appearance-none rounded-md border border-gray-200 bg-white px-2 py-1 pr-6 text-xs font-medium text-gray-800 hover:border-secondary/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 cursor-pointer",
        dropdown_month: "",
        dropdown_year: "",
        dropdown_icon: "ml-1",
        vhidden: "sr-only",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "flex-1 text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full gap-1 mt-2",
        cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-secondary [&:has([aria-selected])]:rounded-md focus-within:relative focus-within:z-20",

        day: "w-full h-10 rounded  p-0 font-normal aria-selected:opacity-100 bg-transparent text-current hover:text-secondary",

        day_selected:
          "bg-secondary text-white hover:bg-secondary hover:text-white focus:bg-secondary focus:text-white",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground bg-zinc-400",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
