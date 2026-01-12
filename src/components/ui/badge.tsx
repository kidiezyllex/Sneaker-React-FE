import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex text-nowrap items-center rounded-full border-2 px-2 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-white shadow-sm hover:bg-primary/90",
        secondary:
          "border-slate-400 bg-slate-50 text-slate-600 hover:bg-slate-100",
        destructive: "border-red-500 bg-red-50 text-red-600 hover:bg-red-100",
        outline: "border-slate-400 text-slate-600 bg-white hover:bg-slate-50",
        success:
          "border-emerald-500 bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
        warning:
          "border-orange-500 bg-orange-50 text-orange-600 hover:bg-orange-100",
        info: "border-sky-500 bg-sky-50 text-sky-600 hover:bg-sky-100",
        purple:
          "border-purple-500 bg-purple-50 text-purple-600 hover:bg-purple-100",
        rose: "border-rose-500 bg-rose-50 text-rose-600 hover:bg-rose-100",
        indigo:
          "border-indigo-500 bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
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
