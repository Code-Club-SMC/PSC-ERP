import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[3px] border px-1.5 h-[18px] text-[0.6154rem] font-medium leading-none tracking-[0.02em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-1 font-variant-numeric-tabular-nums",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/12 text-primary-foreground hover:bg-primary/20",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive/12 text-destructive hover:bg-destructive/20",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };