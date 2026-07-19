import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[5px] text-[0.8462rem] font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 touch-manipulation [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-none",
        destructive: "border border-destructive text-destructive bg-transparent hover:bg-destructive hover:text-destructive-foreground shadow-none",
        outline: "border border-input bg-background hover:bg-muted text-foreground shadow-none",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-none",
        ghost: "hover:bg-muted text-foreground shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-[30px] px-3 py-1.5",
        sm: "h-[26px] px-2.5 py-1 text-[0.7692rem]",
        lg: "h-[34px] px-4 py-2",
        icon: "h-[28px] w-[28px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  rbacAllowed?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, rbacAllowed = true, disabled, title, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || !rbacAllowed;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        title={!rbacAllowed ? title || "You do not have permission for this action" : title}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
