import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex !text-white text-nowrap items-center rounded-full border !px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent !bg-primary shadow hover:bg-primary/80",
        secondary:
          "border-transparent !bg-secondary shadow hover:bg-secondary/80",
        destructive:
          "border-transparent !bg-destructive shadow hover:bg-destructive/80",
        outline: "border-transparent !bg-extra shadow hover:bg-extra/80",
        success:
          "border-transparent !bg-emerald-500 shadow hover:bg-emerald-500/80",
        warning:
          "border-transparent !bg-amber-500 shadow hover:bg-amber-500/80",
        info: "border-transparent !bg-sky-500 shadow hover:bg-sky-500/80",
        purple:
          "border-transparent !bg-purple-600 shadow hover:bg-purple-600/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
