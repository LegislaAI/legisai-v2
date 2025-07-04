import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0   disabled:opacity-50  whitespace-nowrap disabled:pointer-events-none",
  {
    variants: {
      color: {
        default: "bg-secondary text-text-100 hover:bg-secondary/80",
        primary: "bg-secondary text-text-100 hover:bg-secondary/80",
        destructive: "bg-destructive text-text-50 hover:bg-destructive/80",
        success: "bg-success text-success-foreground hover:bg-success/80",
        info: "bg-info text-info-foreground hover:bg-info/80",
        warning: "bg-warning text-warning-foreground hover:bg-warning/80",
        secondary: "bg-secondary text-text-50  hover:bg-secondary/80",
        dark: "bg-accent-foreground text-accent hover:bg-accent-foreground/80",
      },
      variant: {
        outline:
          "border border-current  bg-transparent hover:text-secondary-foreground",
        soft: " bg-opacity-10  hover:text-secondary-foreground",
        ghost: "bg-transparent text-current hover:text-secondary-foreground",
      },
      size: {
        default: "h-10 px-4 py-[10px]",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-[18px] py-[10px] text-base",
        xl: "h-12 rounded-md px-6 py-3 text-base",
        md: "h-9 rounded-md px-4 py-2",
        xs: "h-9 rounded-md px-[14px] py-[6px]",
        icon: "h-10 w-10",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "destructive",
        className:
          "text-destructive hover:text-destructive-foreground hover:border-destructive hover:bg-destructive",
      },
      {
        variant: "outline",
        color: "success",
        className:
          "text-success hover:text-success-foreground hover:border-success hover:bg-success",
      },
      {
        variant: "outline",
        color: "info",
        className:
          "text-info hover:text-info-foreground hover:border-info hover:bg-info",
      },
      {
        variant: "outline",
        color: "warning",
        className:
          "text-warning hover:text-warning-foreground hover:border-warning hover:bg-warning",
      },
      {
        variant: "outline",
        color: "dark",
        className: "text-accent-foreground hover:bg-accent-foreground",
      },
      {
        variant: "outline",
        color: "secondary",
        className:
          "text-muted-foreground dark:bg-transparent hover:bg-default-500  dark:hover:bg-default-500/50 border-default-500",
      },
      {
        variant: "outline",
        color: "default",
        className:
          "text-secondary  hover:text-secondary-foreground hover:border-secondary hover:bg-secondary",
      },
      {
        variant: "outline",
        color: "primary",
        className: "text-secondary  hover:text-secondary-foreground",
      },
      {
        variant: "soft",
        color: "info",
        className: "text-info hover:text-info-foreground",
      },
      {
        variant: "soft",
        color: "warning",
        className: "text-warning hover:text-warning-foreground",
      },
      {
        variant: "soft",
        color: "destructive",
        className: "text-destructive  hover:text-destructive-foreground",
      },
      {
        variant: "soft",
        color: "success",
        className: "text-success hover:text-success-foreground",
      },
      {
        variant: "soft",
        color: "secondary",
        className:
          "text-muted-foreground dark:bg-opacity-50  hover:bg-default-500/50  dark:hover:bg-opacity-100",
      },
      {
        variant: "soft",
        color: "default",
        className: "text-secondary",
      },
      {
        variant: "ghost",
        color: "default",
        className: " text-secondary  ",
      },
      {
        variant: "ghost",
        color: "secondary",
        className:
          " text-muted-foreground dark:bg-transparent hover:bg-default-500/50  dark:hover:bg-default-500/50",
      },
      {
        variant: "ghost",
        color: "success",
        className: " text-success  hover:text-success-foreground ",
      },
      {
        variant: "ghost",
        color: "info",
        className: " text-info hover:text-info-foreground ",
      },
      {
        variant: "ghost",
        color: "warning",
        className: " text-warning hover:text-warning-foreground ",
      },
      {
        variant: "ghost",
        color: "destructive",
        className: " text-destructive  hover:text-destructive-foreground ",
      },
    ],

    defaultVariants: {
      color: "default",
      size: "default",
    },
  },
);
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "destructive"
    | "default"
    | "dark";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, color, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, color, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
