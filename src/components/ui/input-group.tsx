import { cn } from "@/lib/utils";
import * as React from "react";

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  merged?: boolean;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, merged, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group input-group relative flex w-full flex-wrap items-stretch ltr:flex-row rtl:flex-row-reverse",
        className,
        {
          merged: merged,
        },
      )}
      {...props}
    />
  ),
);
InputGroup.displayName = "InputGroup";

const InputGroupButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "[&>*]:first:rounded-r-none [&>*]:last:rounded-l-none",
      className,
    )}
    {...props}
  />
));
InputGroupButton.displayName = "InputGroupButton";

const InputGroupText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, color, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-default-300 text-default-500 bg-background group-focus-within:border-secondary ring-secondary flex items-center justify-center border px-3 text-sm font-normal transition duration-300 first:rounded-l-md first:border-r-0 last:rounded-r-md last:border-l-0",
      className,
      {
        "border-info/50 group-focus-within:border-info-700 ring-info-700":
          color === "info",
        "border-secondary/50 group-focus-within:border-secondary-700 ring-secondary-700":
          color === "primary",
        "border-success/50 group-focus-within:border-success-700 ring-success-700":
          color === "success",
        "border-destructive/50 group-focus-within:border-destructive-700 ring-destructive-700":
          color === "destructive",
        "border-warning/50 group-focus-within:border-warning-700 ring-warning-700":
          color === "warning",
      },
    )}
    {...props}
  />
));
InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupButton, InputGroupText };
